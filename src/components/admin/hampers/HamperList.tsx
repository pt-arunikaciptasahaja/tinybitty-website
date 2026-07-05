import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { HamperRow } from '@/types/supabase-models';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { Edit2, Trash2, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface HamperListProps {
  onEdit: (hamper: HamperRow) => void;
  onAdd: () => void;
  refreshKey?: number;
}

function isHamperVisible(hamper: HamperRow): boolean {
  if (hamper.hamper_variants.length > 0) {
    // Multi-variant: hide only if ALL variant prices are 0
    return hamper.hamper_variants.some((v) => v.price > 0);
  }
  // Single-price: hide if price is 0 or null
  return (hamper.price ?? 0) > 0;
}

function formatPrice(hamper: HamperRow): string {
  if (hamper.hamper_variants.length > 0) {
    const prices = hamper.hamper_variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `Rp ${min.toLocaleString('id-ID')}`;
    return `Rp ${min.toLocaleString('id-ID')} – ${max.toLocaleString('id-ID')}`;
  }
  return hamper.price ? `Rp ${hamper.price.toLocaleString('id-ID')}` : '—';
}

export default function HamperList({ onEdit, onAdd, refreshKey }: HamperListProps) {
  const [hampers, setHampers] = useState<HamperRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HamperRow | null>(null);
  const { toast } = useToast();

  const fetchHampers = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('hampers')
      .select('*')
      .order('name');

    if (err) {
      setError('Failed to load hampers. Please try again.');
    } else {
      setHampers(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHampers();
  }, [fetchHampers, refreshKey]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await supabase
      .from('hampers')
      .delete()
      .eq('id', deleteTarget.id);

    if (err) throw new Error(err.message);

    setHampers((prev) => prev.filter((h) => h.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: 'Hamper deleted', duration: 3000 });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHampers} className="gap-1.5">
          <RefreshCw className="w-3 h-3" />
          Retry
        </Button>
      </div>
    );
  }

  const visibleHampers = hampers.filter(isHamperVisible);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Hamper
        </Button>
      </div>

      {visibleHampers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-muted-foreground">No hampers yet. Add your first one!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {visibleHampers.map((hamper) => (
            <div
              key={hamper.id}
              className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-colors"
            >
              {/* Thumbnail */}
              <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {hamper.image ? (
                  <img
                    src={hamper.image}
                    alt={hamper.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm text-foreground truncate">
                    {hamper.name}
                  </span>
                  {hamper.seasonal && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {hamper.seasonal}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{formatPrice(hamper)}</p>
                {hamper.sales && hamper.sales !== '0+' && (
                  <p className="text-xs text-muted-foreground">Sold: {hamper.sales}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(hamper)}
                  className="gap-1 text-xs h-8"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTarget(hamper)}
                  className="gap-1 text-xs h-8 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
