import { useState } from 'react';
import type { ProductRow } from '@/types/supabase-models';
import type { HamperRow } from '@/types/supabase-models';
import ProductList from '@/components/admin/products/ProductList';
import ProductForm from '@/components/admin/products/ProductForm';
import HamperList from '@/components/admin/hampers/HamperList';
import HamperForm from '@/components/admin/hampers/HamperForm';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

type ActiveTab = 'products' | 'hampers';
type FormMode = 'closed' | 'create' | 'edit';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('products');

  // Product form state
  const [productFormMode, setProductFormMode] = useState<FormMode>('closed');
  const [editingProduct, setEditingProduct] = useState<ProductRow | undefined>(undefined);
  const [productRefreshKey, setProductRefreshKey] = useState(0);

  // Hamper form state
  const [hamperFormMode, setHamperFormMode] = useState<FormMode>('closed');
  const [editingHamper, setEditingHamper] = useState<HamperRow | undefined>(undefined);
  const [hamperRefreshKey, setHamperRefreshKey] = useState(0);

  const { toast } = useToast();

  // Product handlers
  const handleProductEdit = (product: ProductRow) => {
    setEditingProduct(product);
    setProductFormMode('edit');
  };

  const handleProductAdd = () => {
    setEditingProduct(undefined);
    setProductFormMode('create');
  };

  const handleProductSuccess = () => {
    setProductFormMode('closed');
    setEditingProduct(undefined);
    setProductRefreshKey((k) => k + 1);
    toast({
      title: productFormMode === 'create' ? 'Product created ✓' : 'Product updated ✓',
      duration: 5000,
    });
  };

  const handleProductCancel = () => {
    setProductFormMode('closed');
    setEditingProduct(undefined);
  };

  // Hamper handlers
  const handleHamperEdit = (hamper: HamperRow) => {
    setEditingHamper(hamper);
    setHamperFormMode('edit');
  };

  const handleHamperAdd = () => {
    setEditingHamper(undefined);
    setHamperFormMode('create');
  };

  const handleHamperSuccess = () => {
    setHamperFormMode('closed');
    setEditingHamper(undefined);
    setHamperRefreshKey((k) => k + 1);
    toast({
      title: hamperFormMode === 'create' ? 'Hamper created ✓' : 'Hamper updated ✓',
      duration: 5000,
    });
  };

  const handleHamperCancel = () => {
    setHamperFormMode('closed');
    setEditingHamper(undefined);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(['products', 'hampers'] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Products tab */}
      {activeTab === 'products' && (
        <ProductList
          onEdit={handleProductEdit}
          onAdd={handleProductAdd}
          refreshKey={productRefreshKey}
        />
      )}

      {/* Hampers tab */}
      {activeTab === 'hampers' && (
        <HamperList
          onEdit={handleHamperEdit}
          onAdd={handleHamperAdd}
          refreshKey={hamperRefreshKey}
        />
      )}

      {/* Product form sheet */}
      <Sheet
        open={productFormMode !== 'closed'}
        onOpenChange={(open) => !open && handleProductCancel()}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="sr-only">
              {productFormMode === 'create' ? 'New Product' : 'Edit Product'}
            </SheetTitle>
          </SheetHeader>
          <ProductForm
            product={editingProduct}
            onSuccess={handleProductSuccess}
            onCancel={handleProductCancel}
          />
        </SheetContent>
      </Sheet>

      {/* Hamper form sheet */}
      <Sheet
        open={hamperFormMode !== 'closed'}
        onOpenChange={(open) => !open && handleHamperCancel()}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="mb-2">
            <SheetTitle className="sr-only">
              {hamperFormMode === 'create' ? 'New Hamper' : 'Edit Hamper'}
            </SheetTitle>
          </SheetHeader>
          <HamperForm
            hamper={editingHamper}
            onSuccess={handleHamperSuccess}
            onCancel={handleHamperCancel}
          />
        </SheetContent>
      </Sheet>

      <Toaster />
    </div>
  );
}
