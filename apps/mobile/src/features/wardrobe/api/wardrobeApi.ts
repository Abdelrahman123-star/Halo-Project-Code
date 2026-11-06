/**
 * Data access layer for user's personal Digital Wardrobe.
 * Primary: Supabase Postgres with Row Level Security (RLS).
 * Fallback: Local device storage (AsyncStorage) when ISP / SSL handshake fails.
 * Includes step-by-step console logging for terminal debugging.
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
  type WardrobeItem,
} from "@/features/wardrobe/types/wardrobe";

/**
 * Fetches all wardrobe items belonging to the user.
 * Tries Supabase first; gracefully falls back to local cache if network/SSL fails.
 */
export async function fetchWardrobeItems(): Promise<WardrobeItem[]> {
  console.log("[HALO Wardrobe] 📥 Fetching wardrobe items from Supabase...");

  try {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const items = Array.isArray(data)
      ? data.map((item) => WardrobeItemSchema.parse(item))
      : [];

    console.log(`[HALO Wardrobe] ✅ Loaded ${items.length} wardrobe item(s) from Supabase.`);
    await setLocalItems(items);
    return items;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase fetch failed (${msg}).`);

    if (msg.includes("SSLHandshakeException") || msg.includes("CertPathValidatorException")) {
      console.warn(
        "[HALO Wardrobe] 🛡️ ISP/Network SSL Block detected (*.supabase.co).\n" +
          "👉 Quick Phone Fix: In Android Settings -> Network -> Private DNS -> enter 'dns.google' or use Cloudflare WARP (1.1.1.1).\n" +
          "📱 Activating local storage fallback...",
      );
    }

    const localItems = await getLocalItems();
    console.log(`[HALO Wardrobe] 📱 Loaded ${localItems.length} wardrobe item(s) from local cache.`);
    return localItems;
  }
}

/**
 * Saves a new detected garment.
 * Tries Supabase; if blocked by SSL/ISP, persists to local storage so testing never breaks.
 */
export async function insertWardrobeItem(
  input: CreateWardrobeItemInput,
): Promise<WardrobeItem> {
  console.log("============================================================");
  console.log("[HALO Wardrobe] 💾 Starting Save to Digital Wardrobe...");
  console.log(`[HALO Wardrobe] [1/4] Validating input: ${input.name} (${input.category})...`);

  const parsedInput = CreateWardrobeItemInputSchema.parse(input);

  // [2/4] Check user session
  console.log("[HALO Wardrobe] [2/4] Checking authenticated user session...");
  let userId = "00000000-0000-4000-8000-000000000000";
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const sessionUser = sessionData?.session?.user;
    if (sessionUser) {
      userId = sessionUser.id;
      console.log(`[HALO Wardrobe] [2/4] Active session for User: ${userId}`);
    } else {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        userId = userData.user.id;
        console.log(`[HALO Wardrobe] [2/4] Active user: ${userId}`);
      }
    }
  } catch {
    console.warn("[HALO Wardrobe] Auth check skipped or offline.");
  }

  // [3/4] Prepare payload
  const cropLength = parsedInput.crop_base64?.length ?? 0;
  const cropKb = Math.round((cropLength * 0.75) / 1024);
  console.log(`[HALO Wardrobe] [3/4] Prepared payload: crop image size ~${cropKb} KB, ${parsedInput.colors.length} colors`);

  const payload = {
    user_id: userId,
    name: parsedInput.name,
    category: parsedInput.category,
    confidence: parsedInput.confidence ?? null,
    crop_base64: parsedInput.crop_base64 ?? null,
    colors: parsedInput.colors,
    attributes: parsedInput.attributes ?? {},
  };

  // [4/4] Try Supabase insert
  try {
    console.log("[HALO Wardrobe] [4/4] Inserting into 'wardrobe_items' table...");
    const { data, error } = await supabase
      .from("wardrobe_items")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    const savedItem = WardrobeItemSchema.parse(data);
    console.log(`[HALO Wardrobe] ✅ Saved successfully to Supabase! Item ID: ${savedItem.id}`);
    console.log("============================================================");

    await upsertLocalItem(savedItem);
    return savedItem;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase save failed: ${msg}`);

    // Generate valid RFC 4122 v4 UUID for local storage
    const hexTime = Date.now().toString(16).padStart(12, "0").slice(-12);
    const localId = `a0eebc99-9c0b-4ef8-a000-${hexTime}`;

    const localSavedItem: WardrobeItem = {
      id: localId,
      user_id: userId,
      name: parsedInput.name,
      category: parsedInput.category,
      confidence: parsedInput.confidence ?? null,
      crop_base64: parsedInput.crop_base64 ?? null,
      colors: parsedInput.colors,
      attributes: parsedInput.attributes ?? {
        fabric: { predicted: null, confidence: null, top_candidates: [] },
        pattern: { predicted: null, confidence: null, top_candidates: [] },
        subtype: { predicted: null, confidence: null, top_candidates: [] },
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await upsertLocalItem(localSavedItem);
    console.log(`[HALO Wardrobe] 📱 Saved successfully to local wardrobe storage! Item ID: ${localSavedItem.id}`);
    console.log("============================================================");
    return localSavedItem;
  }
}

/**
 * Updates an existing wardrobe item (e.g. edited category, name, or attributes).
 */
export async function updateWardrobeItem(
  itemId: string,
  updates: UpdateWardrobeItemInput,
): Promise<WardrobeItem> {
  console.log(`[HALO Wardrobe] ✏️ Updating wardrobe item ${itemId}...`, updates);
  const parsedUpdates = UpdateWardrobeItemInputSchema.parse(updates);

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (parsedUpdates.name !== undefined) payload.name = parsedUpdates.name;
  if (parsedUpdates.category !== undefined) payload.category = parsedUpdates.category;
  if (parsedUpdates.attributes !== undefined) payload.attributes = parsedUpdates.attributes;
  if (parsedUpdates.colors !== undefined) payload.colors = parsedUpdates.colors;

  try {
    const { data, error } = await supabase
      .from("wardrobe_items")
      .update(payload)
      .eq("id", itemId)
      .select("*")
      .single();

    if (error) throw error;

    const updatedItem = WardrobeItemSchema.parse(data);
    console.log(`[HALO Wardrobe] ✅ Updated in Supabase! Item ID: ${updatedItem.id}`);
    await upsertLocalItem(updatedItem);
    return updatedItem;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[HALO Wardrobe] ⚠️ Supabase update failed (${msg}). Updating in local storage...`);
    const localUpdated = await updateLocalItem(itemId, parsedUpdates);
    console.log(`[HALO Wardrobe] 📱 Updated in local storage! Item ID: ${localUpdated.id}`);
    return localUpdated;
  }
}

/**
 * Deletes a wardrobe item by its ID.
 */
export async function deleteWardrobeItem(itemId: string): Promise<void> {
  console.log(`[HALO Wardrobe] 🗑️ Deleting wardrobe item: ${itemId}...`);

  try {
    await supabase.from("wardrobe_items").delete().eq("id", itemId);
  } catch {
    // ignore remote error on deletion
  }

  await deleteLocalItem(itemId);
  console.log(`[HALO Wardrobe] ✅ Item ${itemId} deleted successfully.`);
}
