/**
 * Data access layer for user's personal Digital Wardrobe.
 * Primary: Supabase Postgres (`wardrobe_items`) with Row Level Security (`user_id = auth.uid()`).
 * Fallback: Per-user local device storage (AsyncStorage) when offline or network/SSL fails.
 * Preserves immutable AI predictions (`ai_original`) separately from user edits (AGENTS.md §3).
 */

import { supabase } from "@/shared/lib/supabase";
import {
  deleteLocalItem,
  getLocalItems,
  setLocalItems,
  updateLocalItem,
  upsertLocalItem,
} from "@/features/wardrobe/api/wardrobeCache";
import {
  CreateWardrobeItemInputSchema,
  UpdateWardrobeItemInputSchema,
  WardrobeItemSchema,
  type CreateWardrobeItemInput,
  type UpdateWardrobeItemInput,
  type WardrobeAttributes,
  type WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

const ANON_FALLBACK_UUID = "00000000-0000-4000-8000-000000000000";
const LOCAL_ID_PREFIX = "a0eebc99-9c0b-4ef8-a000-";
// Postgres "undefined_column" — the DB has not had migration 0003 applied yet.
const UNDEFINED_COLUMN = "42703";

export function isLocalWardrobeItemId(itemId: string): boolean {
  return itemId.startsWith(LOCAL_ID_PREFIX);
}

// Supabase returns PostgrestError plain objects (not Error instances), which
// would otherwise log as "[object Object]" and hide e.g. a missing column.
function describeError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const { message, code } = err as { message?: unknown; code?: unknown };
    if (typeof message === "string") return typeof code === "string" ? `${code}: ${message}` : message;
  }
  return String(err);
}

function hasSupabaseClient(): boolean {
  return Boolean(supabase && typeof supabase.from === "function");
}

async function resolveActiveUserId(): Promise<string> {
  if (!hasSupabaseClient()) return ANON_FALLBACK_UUID;
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    if (sessionUser?.id) return sessionUser.id;
    const { data: userData } = await supabase.auth.getUser();
    if (userData?.user?.id) return userData.user.id;
  } catch {
    console.warn("[HALO Wardrobe] Auth session lookup unavailable; using offline scope.");
  }
  return ANON_FALLBACK_UUID;
}

export async function fetchWardrobeItems(): Promise<WardrobeItem[]> {
  const activeUserId = await resolveActiveUserId();
  if (!hasSupabaseClient()) return getLocalItems();

  try {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const cached = await getLocalItems();
    // Without migration 0003 the back photo only exists in the local cache; keep it.
    const cachedBackPhotos = new Map(
      cached.filter((i) => i.back_crop_base64).map((i) => [i.id, i.back_crop_base64]),
    );
    const remoteItems = Array.isArray(data)
      ? data.map((row) => {
          const item = WardrobeItemSchema.parse(row);
          return item.back_crop_base64 || !cachedBackPhotos.has(item.id)
            ? item
            : { ...item, back_crop_base64: cachedBackPhotos.get(item.id) };
        })
      : [];

    const remoteIds = new Set(remoteItems.map((i) => i.id));
    const unsyncedLocal = cached.filter(
      (item) =>
        isLocalWardrobeItemId(item.id) &&
        !remoteIds.has(item.id) &&
        (activeUserId === ANON_FALLBACK_UUID ||
          item.user_id === activeUserId ||
          item.user_id === ANON_FALLBACK_UUID),
    );

    const merged = [...unsyncedLocal, ...remoteItems];
    await setLocalItems(merged);
    return merged;
  } catch (err: unknown) {
    const msg = describeError(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase fetch failed (${msg}). Falling back to local cache.`);

    const localItems = await getLocalItems();
    return activeUserId === ANON_FALLBACK_UUID
      ? localItems
      : localItems.filter(
          (item) => item.user_id === activeUserId || item.user_id === ANON_FALLBACK_UUID,
        );
  }
}

export async function insertWardrobeItem(
  input: CreateWardrobeItemInput,
): Promise<WardrobeItem> {
  const parsedInput = CreateWardrobeItemInputSchema.parse(input);
  const userId = await resolveActiveUserId();

  const baseAttrs: WardrobeAttributes = parsedInput.attributes ?? {
    fabric: { predicted: null, confidence: null, top_candidates: [] },
    pattern: { predicted: null, confidence: null, top_candidates: [] },
    subtype: { predicted: null, confidence: null, top_candidates: [] },
  };

  const enrichedAttributes: WardrobeAttributes =
    parsedInput.confidence != null && !baseAttrs.ai_original
      ? {
          ...baseAttrs,
          ai_original: {
            category: parsedInput.category,
            subtype: baseAttrs.subtype.predicted,
            fabric: baseAttrs.fabric.predicted,
            pattern: baseAttrs.pattern.predicted,
          },
        }
      : baseAttrs;

  const payload = {
    user_id: userId,
    name: parsedInput.name,
    category: parsedInput.category,
    confidence: parsedInput.confidence ?? null,
    crop_base64: parsedInput.crop_base64 ?? null,
    colors: parsedInput.colors,
    attributes: enrichedAttributes,
  };

  const backPhoto = parsedInput.back_crop_base64 ?? null;

  try {
    if (!hasSupabaseClient()) throw new Error("Supabase client not configured");
    const insertRow = async (row: Record<string, unknown>) =>
      supabase.from("wardrobe_items").insert(row).select("*").single();

    let { data, error } = await insertRow(backPhoto ? { ...payload, back_crop_base64: backPhoto } : payload);
    if (error && backPhoto && (error as { code?: string }).code === UNDEFINED_COLUMN) {
      console.warn(
        "[HALO Wardrobe] back_crop_base64 column missing (apply migration 0003). Keeping the back photo on this device only.",
      );
      ({ data, error } = await insertRow(payload));
    }
    if (error) throw error;

    const parsed = WardrobeItemSchema.parse(data);
    const savedItem = backPhoto ? { ...parsed, back_crop_base64: backPhoto } : parsed;
    await upsertLocalItem(savedItem);
    return savedItem;
  } catch (err: unknown) {
    const msg = describeError(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase save fallback (${msg}). Saving locally.`);

    const uniqueSuffix = (Date.now() * 1000 + Math.floor(Math.random() * 1000))
      .toString(16)
      .padStart(12, "0")
      .slice(-12);

    const localSavedItem: WardrobeItem = {
      id: `${LOCAL_ID_PREFIX}${uniqueSuffix}`,
      user_id: userId,
      name: parsedInput.name,
      category: parsedInput.category,
      confidence: parsedInput.confidence ?? null,
      crop_base64: parsedInput.crop_base64 ?? null,
      back_crop_base64: backPhoto,
      colors: parsedInput.colors,
      attributes: enrichedAttributes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await upsertLocalItem(localSavedItem);
    return localSavedItem;
  }
}

export async function updateWardrobeItem(
  itemId: string,
  updates: UpdateWardrobeItemInput,
): Promise<WardrobeItem> {
  const parsedUpdates = UpdateWardrobeItemInputSchema.parse(updates);
  const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (parsedUpdates.name !== undefined) payload.name = parsedUpdates.name;
  if (parsedUpdates.category !== undefined) payload.category = parsedUpdates.category;
  if (parsedUpdates.attributes !== undefined) payload.attributes = parsedUpdates.attributes;
  if (parsedUpdates.colors !== undefined) payload.colors = parsedUpdates.colors;

  try {
    if (!hasSupabaseClient() || isLocalWardrobeItemId(itemId)) {
      throw new Error("Local-only wardrobe item");
    }
    const { data, error } = await supabase
      .from("wardrobe_items")
      .update(payload)
      .eq("id", itemId)
      .select("*")
      .single();

    if (error) throw error;

    const parsed = WardrobeItemSchema.parse(data);
    const cachedBack = parsed.back_crop_base64
      ? null
      : (await getLocalItems()).find((i) => i.id === itemId)?.back_crop_base64 ?? null;
    const updatedItem = cachedBack ? { ...parsed, back_crop_base64: cachedBack } : parsed;
    await upsertLocalItem(updatedItem);
    return updatedItem;
  } catch (err: unknown) {
    const msg = describeError(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase update fallback (${msg}).`);
    return updateLocalItem(itemId, parsedUpdates);
  }
}

export async function deleteWardrobeItem(itemId: string): Promise<void> {
  if (hasSupabaseClient() && !isLocalWardrobeItemId(itemId)) {
    try {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", itemId);
      if (error) console.warn(`[HALO Wardrobe] ⚠️ Remote delete warning: ${error.message}`);
    } catch (err: unknown) {
      const msg = describeError(err);
      console.warn(`[HALO Wardrobe] ⚠️ Remote delete skipped (${msg}).`);
    }
  }
  await deleteLocalItem(itemId);
}
