'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { PearlButton } from '@/components/ui/PearlButton';
import { GarmentInspectModal } from './GarmentInspectModal';
import { Search, Shirt, Trash2, Eye } from 'lucide-react';

export type AttributeGroup = {
  predicted?: string | null;
  confidence?: number | null;
  top_candidates?: Array<{ label: string; confidence: number }>;
};

export type WardrobeItem = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  confidence: number | null;
  crop_base64: string | null;
  colors: { name: string; percentage: number; hex?: string }[] | null;
  attributes: {
    fabric?: AttributeGroup | string | null;
    pattern?: AttributeGroup | string | null;
    subtype?: AttributeGroup | string | null;
    ai_original?: {
      category?: string | null;
      subtype?: string | null;
      fabric?: string | null;
      pattern?: string | null;
    } | null;
  } | null;
  created_at: string;
};

type WardrobeGridProps = {
  initialItems: WardrobeItem[];
};

export function WardrobeGrid({ initialItems }: WardrobeGridProps) {
  const [items, setItems] = useState<WardrobeItem[]>(initialItems);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    return (
      (item.name || '').toLowerCase().includes(q) ||
      (item.category || '').toLowerCase().includes(q) ||
      item.user_id.toLowerCase().includes(q)
    );
  });

  async function handleDelete(item: WardrobeItem) {
    if (!window.confirm(`Are you sure you want to delete "${item.name}" from the system?`)) {
      return;
    }

    setDeletingId(item.id);
    setStatusMessage(null);

    const supabase = createClient();
    const { error } = await supabase
      .from('wardrobe_items')
      .delete()
      .eq('id', item.id);

    setDeletingId(null);

    if (error) {
      setStatusMessage(`Delete failed: ${error.message}`);
      return;
    }

    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (selectedItem?.id === item.id) {
      setSelectedItem(null);
    }
    setStatusMessage(`Successfully deleted item "${item.name}".`);
  }

  return (
    <div className="space-y-4">
      {/* Search and stats bar */}
      <GlassCard className="p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-halo-plumMuted/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by category, name, or user..."
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs sm:text-sm text-halo-plum placeholder:text-halo-plumMuted/60"
          />
        </div>

        <div className="text-xs font-semibold text-halo-plumMuted">
          Showing {filteredItems.length} of {items.length} garments
        </div>
      </GlassCard>

      {statusMessage && (
        <div className="p-3 rounded-xl bg-white/80 border border-halo-periwinkle/30 text-xs font-medium text-halo-plum shadow-sm">
          {statusMessage}
        </div>
      )}

      {/* Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const conf = item.confidence ? Math.round(item.confidence * 100) : null;
            return (
              <GlassCard
                key={item.id}
                className="overflow-hidden flex flex-col justify-between hover:shadow-glass-lg transition-all group"
              >
                {/* Crop Image View */}
                <div className="aspect-square w-full bg-white/70 border-b border-white/60 relative flex items-center justify-center p-3">
                  {item.crop_base64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.crop_base64}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-halo-plumMuted gap-2">
                      <Shirt className="w-10 h-10 stroke-1" />
                      <span className="text-[11px]">No crop data</span>
                    </div>
                  )}

                  {/* Confidence Pill */}
                  {conf !== null && (
                    <div className="absolute top-2.5 right-2.5">
                      <Badge variant={conf >= 80 ? 'success' : 'warning'}>
                        {conf}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-halo-plum truncate" title={item.name}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-halo-plumMuted capitalize mt-0.5">
                      {item.category?.replace(/_/g, ' ') || 'Uncategorized'}
                    </p>

                    {/* Dominant Color swatches */}
                    {item.colors && item.colors.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2.5">
                        {item.colors.slice(0, 3).map((col, idx) => (
                          <div
                            key={idx}
                            title={`${col.name} (${col.percentage}%)`}
                            className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                            style={{ backgroundColor: col.hex || '#ccc' }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-white/50 flex items-center justify-between">
                    <PearlButton
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedItem(item)}
                      className="text-xs"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Inspect
                    </PearlButton>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      className="p-1.5 rounded-lg text-halo-plumMuted hover:text-red-700 hover:bg-halo-rose/60 transition-colors"
                      title="Delete garment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-12 text-center text-sm text-halo-plumMuted">
          No garments match your search criteria.
        </GlassCard>
      )}

      {/* Inspect Modal */}
      {selectedItem && (
        <GarmentInspectModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onDelete={handleDelete}
          isDeleting={deletingId === selectedItem.id}
        />
      )}
    </div>
  );
}
