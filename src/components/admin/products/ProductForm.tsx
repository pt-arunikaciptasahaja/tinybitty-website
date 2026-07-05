import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import {
  productFormSchema,
  toProductFormValues,
  toProductRow,
  type ProductFormValues,
} from '@/lib/adminUtils';
import type { ProductRow } from '@/types/supabase-models';
import ImageUploader from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, X } from 'lucide-react';

interface ProductFormProps {
  product?: ProductRow;
  onSuccess: () => void;
  onCancel: () => void;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const isEdit = !!product;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: isEdit
      ? toProductFormValues(product)
      : {
          id: '',
          name: '',
          description: '',
          category: 'cookies',
          image: '',
          variants: [{ size: '', price: 0 }],
          ingredients: [],
          toppings: [],
          is_new: false,
        },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'variants' });

  const {
    fields: ingredientFields,
    append: appendIngredient,
    remove: removeIngredient,
  } = useFieldArray({ control, name: 'ingredients' as never });

  const {
    fields: toppingFields,
    append: appendTopping,
    remove: removeTopping,
  } = useFieldArray({ control, name: 'toppings' as never });

  const watchName = watch('name');
  const watchCategory = watch('category');

  // Auto-generate id slug from name in create mode
  useEffect(() => {
    if (!isEdit && watchName) {
      setValue('id', generateSlug(watchName));
    }
  }, [watchName, isEdit, setValue]);

  const onSubmit = async (data: ProductFormValues) => {
    setSubmitError(null);
    const row = toProductRow(data);
    const { error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      setSubmitError(`Failed to save product: ${error.message}`);
      return;
    }
    onSuccess();
  };

  const isDisabled = isSubmitting || uploading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isEdit ? `Edit — ${product.name}` : 'New Product'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full p-1 hover:bg-gray-100 transition-colors"
          aria-label="Close form"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* ID (read-only in edit, auto-generated in create) */}
      <div className="space-y-1.5">
        <Label htmlFor="id">ID (slug)</Label>
        <Input
          id="id"
          {...register('id')}
          readOnly={isEdit}
          className={isEdit ? 'bg-gray-50 text-muted-foreground' : ''}
          aria-invalid={!!errors.id}
        />
        {errors.id && <p className="text-xs text-red-600">{errors.id.message}</p>}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name *</Label>
        <Input id="name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          rows={3}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label>Category *</Label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={!!errors.category}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cookies">Cookies</SelectItem>
                <SelectItem value="juice">Juice</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-xs text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Image */}
      <div className="space-y-1.5">
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader
              label="Product Image *"
              value={field.value}
              onChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
        {errors.image && <p className="text-xs text-red-600">{errors.image.message}</p>}
      </div>

      {/* isNew checkbox */}
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="is_new"
          render={({ field }) => (
            <Checkbox
              id="is_new"
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor="is_new" className="cursor-pointer">
          Mark as NEW
        </Label>
      </div>

      {/* Variants */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Variants * (size + price)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendVariant({ size: '', price: 0 })}
            className="gap-1 text-xs h-7"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
        {errors.variants?.root && (
          <p className="text-xs text-red-600">{errors.variants.root.message}</p>
        )}
        {variantFields.map((field, i) => (
          <div key={field.id} className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <Input
                placeholder="Size (e.g. Large 400gr)"
                {...register(`variants.${i}.size`)}
                aria-invalid={!!errors.variants?.[i]?.size}
              />
              {errors.variants?.[i]?.size && (
                <p className="text-xs text-red-600">{errors.variants[i]?.size?.message}</p>
              )}
            </div>
            <div className="w-32 space-y-1">
              <Input
                type="number"
                placeholder="Price (IDR)"
                {...register(`variants.${i}.price`, { valueAsNumber: true })}
                aria-invalid={!!errors.variants?.[i]?.price}
              />
              {errors.variants?.[i]?.price && (
                <p className="text-xs text-red-600">{errors.variants[i]?.price?.message}</p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => variantFields.length > 1 && removeVariant(i)}
              disabled={variantFields.length <= 1}
              className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              aria-label="Remove variant"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Ingredients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Ingredients</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIngredient('' as never)}
            className="gap-1 text-xs h-7"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
        {ingredientFields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <Input
              placeholder="e.g. Australian Butter"
              {...register(`ingredients.${i}` as never)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeIngredient(i)}
              className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Toppings — juice only */}
      {watchCategory === 'juice' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Toppings (juice only)</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendTopping('' as never)}
              className="gap-1 text-xs h-7"
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
          {toppingFields.map((field, i) => (
            <div key={field.id} className="flex gap-2">
              <Input
                placeholder="e.g. Chia seeds"
                {...register(`toppings.${i}` as never)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTopping(i)}
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Submit error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isDisabled} className="flex-1">
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isDisabled}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
