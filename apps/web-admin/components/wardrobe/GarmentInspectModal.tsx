'use client';

import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { PearlButton } from '@/components/ui/PearlButton';
import { Shirt, X, CheckCircle, Sparkles } from 'lucide-react';
import type { WardrobeItem } from './WardrobeGrid';

type GarmentInspectModalProps = {
  item: WardrobeItem;
  onClose: () => void;
  onDelete: (item: WardrobeItem) => void;
  isDeleting?: boolean;
};

/**
 * Safely extracts a display string from an attribute field which can be:
 * - A string: "crewneck"
 * - An AttributeGroup object: { predicted: "crewneck", confidence: 92, top_candidates: [...] }
 * - Null or undefined
 */
function renderAttributeValue(val: unknown, fallback: string = 'None'): string {
  if (!val) return fallback;
  if (typeof val === 'string' && val.trim()) return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object' && val !== null) {
    const obj = val as Record<string, unknown>;
    if (typeof obj.predicted === 'string' && obj.predicted.trim()) {
      const conf =
        typeof obj.confidence === 'number'
          ? ` (${Math.round(obj.confidence <= 1 ? obj.confidence * 100 : obj.confidence)}%)`
          : '';
      return `${obj.predicted}${conf}`;
    }
    if (typeof obj.name === 'string' && obj.name.trim()) return obj.name;
    if (typeof obj.label === 'string' && obj.label.trim()) return obj.label;
  }
  return fallback;
}

export function GarmentInspectModal({
  item,
  onClose,
  onDelete,
  isDeleting,
}: GarmentInspectModalProps) {
  const conf = item.confidence
    ? Math.round(item.confidence <= 1 ? item.confidence * 100 : item.confidence)
    : null;
  const aiOriginal = item.attributes?.ai_original;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-halo-plum/20 backdrop-blur-sm animate-in fade-in duration-200">
      <GlassCard className="w-full max-w-xl p-6 relative shadow-glass-lg max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/70 hover:bg-white text-halo-plum transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/60">
          <Sparkles className="w-4 h-4 text-halo-periwinkle" />
          <h2 className="text-base font-bold text-halo-plum">
            Garment Inspection & CV Provenance
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-5">
          {/* Crop */}
          <div className="w-full sm:w-48 aspect-square rounded-xl bg-white/80 border border-white flex items-center justify-center p-3 shrink-0">
            {item.crop_base64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.crop_base64}
                alt={item.name || 'Garment Crop'}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <Shirt className="w-12 h-12 text-halo-plumMuted" />
            )}
          </div>

          {/* Attributes & provenance */}
          <div className="space-y-3 flex-1 text-xs">
            <div>
              <span className="font-semibold text-halo-plumMuted uppercase tracking-wider block text-[10px]">
                Garment Name
              </span>
              <p className="font-bold text-sm text-halo-plum">{item.name || 'Untitled Garment'}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="font-semibold text-halo-plumMuted block text-[10px]">
                  Category
                </span>
                <p className="font-medium text-halo-plum capitalize">
                  {typeof item.category === 'string' ? item.category.replace(/_/g, ' ') : 'Uncategorized'}
                </p>
              </div>
              <div>
                <span className="font-semibold text-halo-plumMuted block text-[10px]">
                  Confidence
                </span>
                <Badge variant={conf && conf >= 80 ? 'success' : 'warning'}>
                  {conf ? `${conf}%` : 'N/A'}
                </Badge>
              </div>
            </div>

            {/* Subtype & Fabric */}
            <div className="p-3 rounded-xl bg-white/60 border border-white space-y-1.5">
              <p className="font-bold text-[11px] text-halo-plum flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                CV Extracted Attributes
              </p>
              <p className="text-halo-plumMuted">
                Subtype: <span className="text-halo-plum font-medium capitalize">{renderAttributeValue(item.attributes?.subtype, 'None')}</span>
              </p>
              <p className="text-halo-plumMuted">
                Fabric: <span className="text-halo-plum font-medium capitalize">{renderAttributeValue(item.attributes?.fabric, 'Unknown')}</span>
              </p>
              <p className="text-halo-plumMuted">
                Pattern: <span className="text-halo-plum font-medium capitalize">{renderAttributeValue(item.attributes?.pattern, 'Solid')}</span>
              </p>
            </div>

            {/* AI Original predictions if available */}
            {aiOriginal && typeof aiOriginal === 'object' && (
              <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1 text-[11px]">
                <p className="font-bold text-halo-plum flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-halo-periwinkle" />
                  Original Model Detection
                </p>
                <div className="grid grid-cols-2 gap-1 text-halo-plumMuted text-[10px]">
                  <span>Category: <strong className="text-halo-plum font-medium">{String(aiOriginal.category || 'N/A')}</strong></span>
                  <span>Subtype: <strong className="text-halo-plum font-medium">{String(aiOriginal.subtype || 'None')}</strong></span>
                  <span>Fabric: <strong className="text-halo-plum font-medium">{String(aiOriginal.fabric || 'Unknown')}</strong></span>
                  <span>Pattern: <strong className="text-halo-plum font-medium">{String(aiOriginal.pattern || 'Solid')}</strong></span>
                </div>
              </div>
            )}

            {/* Dominant Palette */}
            {Array.isArray(item.colors) && item.colors.length > 0 && (
              <div>
                <span className="font-semibold text-halo-plumMuted block text-[10px] uppercase mb-1">
                  Extracted Palette
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {item.colors.slice(0, 4).map((col, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/70 border border-white text-[10px] text-halo-plum font-medium"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: col?.hex || '#ccc' }}
                      />
                      <span>{col?.name ?? 'Color'}</span>
                      <span className="text-halo-plumMuted">({col?.percentage ?? 0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[11px] text-halo-plumMuted pt-1">
              User ID: <span className="font-mono">{item.user_id}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/60 flex justify-end gap-2">
          <PearlButton
            size="sm"
            variant="danger"
            loading={isDeleting}
            onClick={() => onDelete(item)}
          >
            Delete Garment
          </PearlButton>
          <PearlButton
            size="sm"
            variant="secondary"
            onClick={onClose}
          >
            Close
          </PearlButton>
        </div>
      </GlassCard>
    </div>
  );
}
