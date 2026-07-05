import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ProductRow } from '@/types/supabase-models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DeleteConfirmDialog from '@/components/admin/DeleteConfirmDialog';
import { Edit2, Trash2, RefreshCw, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProductListProps {
  onEdit: (product: ProductRow) => void;
  onAdd: () => void;
  refreshKey?: number;
}

const CATEGORY_ORDER: ProductRow['category'][] = ['cookies', 'juice'];
const CATEGORY_LABELS: Record<ProductRow['category'], string> = {
  cookies: 'Cookies',
  juice: 'Juice',
};

export default function ProductList({ onEdit, onAdd, refreshKey }: ProductListProps) {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const { toast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (err) {
      setError('Failed to load products. Please try again.');
    } else {
      setProducts(data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, refreshKey]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error: err } = await supabase
      .from('products')
      .delete()
      .eq('id', deleteTarget.id);

    if (err) throw new Error(err.message);

    setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast({ title: 'Product deleted', duration: 3000 });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-center justify-between">
        <p className="text-sm text-red-700">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchProducts} className="gap-1.5">
          <RefreshCw className="w-3 h-3" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button onClick={onAdd} className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Product
        </Button>
      </div>

      {CATEGORY_ORDER.map((category) => {
        const items = products.filter((p) => p.category === category);
        return (
          <section key={category}>
            <h2 className="text-base font-semibold text-foreground mb-3 capitalize">
              {CATEGORY_LABELS[category]}{' '}
              <span className="text-muted-foreground font-normal text-sm">
                ({items.length})
              </span>
            </h2>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No {CATEGORY_LABELS[category].toLowerCase()} products yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:border-gray-300 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="w-[80px] h-[80px] rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
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
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm text-foreground truncate">
                          {product.name}
                        </span>
                        {product.is_new && (
                          <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {product.variants.length} variant
                        {product.variants.length !== 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="gap-1 text-xs h-8"
                      >
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(product)}
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
          </section>
        );
      })}

      <DeleteConfirmDialog
        open={!!deleteTarget}
        itemName={deleteTarget?.name ?? ''}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
