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

    const remoteItems = Array.isArray(data)
      ? data.map((item) => WardrobeItemSchema.parse(item))
      : [];

    const cached = await getLocalItems();
    const remoteIds = new Set(remoteItems.map((i) => i.id));
    const unsyncedLocal = cached.filter(
      (item) =>
        item.id.startsWith(LOCAL_ID_PREFIX) &&
        !remoteIds.has(item.id) &&
        (activeUserId === ANON_FALLBACK_UUID ||
          item.user_id === activeUserId ||
          item.user_id === ANON_FALLBACK_UUID),
    );

    const merged = [...unsyncedLocal, ...remoteItems];
    await setLocalItems(merged);
    return merged;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
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

  try {
    if (!hasSupabaseClient()) throw new Error("Supabase client not configured");
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    const savedItem = WardrobeItemSchema.parse(data);
    await upsertLocalItem(savedItem);
    return savedItem;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
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
    if (!hasSupabaseClient() || itemId.startsWith(LOCAL_ID_PREFIX)) {
      throw new Error("Local-only wardrobe item");
    }
    const { data, error } = await supabase
      .from("wardrobe_items")
      .update(payload)
      .eq("id", itemId)
      .select("*")
      .single();

    if (error) throw error;

    const updatedItem = WardrobeItemSchema.parse(data);
    await upsertLocalItem(updatedItem);
    return updatedItem;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase update fallback (${msg}).`);
    return updateLocalItem(itemId, parsedUpdates);
  }
}

export async function deleteWardrobeItem(itemId: string): Promise<void> {
  if (hasSupabaseClient() && !itemId.startsWith(LOCAL_ID_PREFIX)) {
    try {
      const { error } = await supabase.from("wardrobe_items").delete().eq("id", itemId);
      if (error) console.warn(`[HALO Wardrobe] ⚠️ Remote delete warning: ${error.message}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[HALO Wardrobe] ⚠️ Remote delete skipped (${msg}).`);
    }
  }
  await deleteLocalItem(itemId);
}
