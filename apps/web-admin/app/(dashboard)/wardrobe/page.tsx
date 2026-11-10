import { createClient } from '@/lib/supabase/server';
import { WardrobeGrid, type WardrobeItem } from '@/components/wardrobe/WardrobeGrid';

export default async function WardrobePage() {
  const supabase = await createClient();

  const { data: items, error } = await supabase
    .from('wardrobe_items')
    .select('id, user_id, name, category, confidence, crop_base64, colors, attributes, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-halo-plum tracking-tight">
          Wardrobe & CV Moderation
        </h1>
        <p className="text-sm text-halo-plumMuted mt-1">
          Inspect computer vision detections, segmented garment crops, color palettes, and AI prediction confidence.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-halo-rose text-red-800 text-sm">
          Failed to load wardrobe items: {error.message}
        </div>
      ) : (
        <WardrobeGrid initialItems={(items as WardrobeItem[]) || []} />
      )}
    </div>
  );
}

