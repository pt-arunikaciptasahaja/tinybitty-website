import { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/lib/supabase';
import {
  hamperFormSchema,
  toHamperFormValues,
  toHamperRow,
  type HamperFormValues,
} from '@/lib/adminUtils';
import type { HamperRow } from '@/types/supabase-models';
import ImageUploader from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';

interface HamperFormProps {
  hamper?: HamperRow;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function HamperForm({ hamper, onSuccess, onCancel }: HamperFormProps) {
  const isEdit = !!hamper;
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HamperFormValues>({
    resolver: zodResolver(hamperFormSchema),
    defaultValues: isEdit
      ? toHamperFormValues(hamper)
      : {
          id: '',
          name: '',
          description: '',
          image: '',
          images: [],
          pricing_mode: 'single',
          price: undefined,
          hamper_variants: [],
          rating: 5.0,
          sales: '',
          seasonal: '',
          whats_included: [''],
        },
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({ control, name: 'hamper_variants' });

  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
    move: moveGallery,
  } = useFieldArray({ control, name: 'images' as never });

  const {
    fields: includedFields,
    append: appendIncluded,
    remove: removeIncluded,
  } = useFieldArray({ control, name: 'whats_included' as never });

  const watchPricingMode = watch('pricing_mode');

  // Clear opposite pricing fields when mode switches
  useEffect(() => {
    if (watchPricingMode === 'single') {
      setValue('hamper_variants', []);
    } else {
      setValue('price', undefined);
    }
  }, [watchPricingMode, setValue]);

  const onSubmit = async (data: HamperFormValues) => {
    setSubmitError(null);
    const row = toHamperRow(data);
    const { error } = await supabase
      .from('hampers')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      setSubmitError(`Failed to save hamper: ${error.message}`);
      return;
    }
    onSuccess();
  };

  const isDisabled = isSubmitting || uploading;
  const galleryImages = watch('images');

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {isEdit ? `Edit — ${hamper.name}` : 'New Hamper'}
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

      {/* ID */}
      <div className="space-y-1.5">
        <Label htmlFor="hamper-id">ID (slug) *</Label>
        <Input id="hamper-id" {...register('id')} aria-invalid={!!errors.id} />
        {errors.id && <p className="text-xs text-red-600">{errors.id.message}</p>}
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="hamper-name">Name *</Label>
        <Input id="hamper-name" {...register('name')} aria-invalid={!!errors.name} />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="hamper-desc">Description *</Label>
        <Textarea
          id="hamper-desc"
          rows={3}
          {...register('description')}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Seasonal tag */}
      <div className="space-y-1.5">
        <Label htmlFor="seasonal">Seasonal Tag *</Label>
        <Input
          id="seasonal"
          placeholder="e.g. Eid Collection"
          {...register('seasonal')}
          aria-invalid={!!errors.seasonal}
        />
        {errors.seasonal && (
          <p className="text-xs text-red-600">{errors.seasonal.message}</p>
        )}
      </div>

      {/* Rating */}
      <div className="space-y-1.5">
        <Label htmlFor="rating">Rating (0.0 – 5.0) *</Label>
        <Input
          id="rating"
          type="number"
          step="0.1"
          min="0"
          max="5"
          {...register('rating', { valueAsNumber: true })}
          aria-invalid={!!errors.rating}
        />
        {errors.rating && <p className="text-xs text-red-600">{errors.rating.message}</p>}
      </div>

      {/* Sales label */}
      <div className="space-y-1.5">
        <Label htmlFor="sales">Sales Label *</Label>
        <Input
          id="sales"
          placeholder="e.g. 89+"
          {...register('sales')}
          aria-invalid={!!errors.sales}
        />
        {errors.sales && <p className="text-xs text-red-600">{errors.sales.message}</p>}
      </div>

      {/* Primary image */}
      <div className="space-y-1.5">
        <Controller
          control={control}
          name="image"
          render={({ field }) => (
            <ImageUploader
              label="Primary Image *"
              value={field.value}
              onChange={field.onChange}
              disabled={isDisabled}
            />
          )}
        />
        {errors.image && <p className="text-xs text-red-600">{errors.image.message}</p>}
      </div>

      {/* Gallery images */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Gallery Images (max 10)</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => galleryFields.length < 10 && appendGallery('' as never)}
            disabled={galleryFields.length >= 10}
            className="gap-1 text-xs h-7"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
        {galleryFields.map((field, i) => (
          <div key={field.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`images.${i}` as never}
              render={({ field: f }: { field: { value: string; onChange: (v: string) => void } }) => (
                <ImageUploader
                  value={f.value}
                  onChange={f.onChange}
                  disabled={isDisabled}
                  label={`Gallery ${i + 1}`}
                />
              )}
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => i > 0 && moveGallery(i, i - 1)}
                disabled={i === 0}
                className="h-7 w-7"
              >
                <ArrowUp className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => i < galleryFields.length - 1 && moveGallery(i, i + 1)}
                disabled={i === galleryFields.length - 1}
                className="h-7 w-7"
              >
                <ArrowDown className="w-3 h-3" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGallery(i)}
                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing mode */}
      <div className="space-y-1.5">
        <Label>Pricing Mode *</Label>
        <Controller
          control={control}
          name="pricing_mode"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single Price</SelectItem>
                <SelectItem value="multi">Multiple Variants</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Single price */}
      {watchPricingMode === 'single' && (
        <div className="space-y-1.5">
          <Label htmlFor="price">Price (IDR) *</Label>
          <Input
            id="price"
            type="number"
            placeholder="e.g. 90000"
            {...register('price', { valueAsNumber: true })}
            aria-invalid={!!errors.price}
          />
          {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
        </div>
      )}

      {/* Multi variants */}
      {watchPricingMode === 'multi' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Price Variants *</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendVariant({ name: '', price: 0 })}
              className="gap-1 text-xs h-7"
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
          {variantFields.map((field, i) => (
            <div key={field.id} className="flex gap-2 items-start">
              <div className="flex-1 space-y-1">
                <Input
                  placeholder="Variant name (e.g. 3 juices)"
                  {...register(`hamper_variants.${i}.name`)}
                  aria-invalid={!!errors.hamper_variants?.[i]?.name}
                />
                {errors.hamper_variants?.[i]?.name && (
                  <p className="text-xs text-red-600">
                    {errors.hamper_variants[i]?.name?.message}
                  </p>
                )}
              </div>
              <div className="w-32 space-y-1">
                <Input
                  type="number"
                  placeholder="Price (IDR)"
                  {...register(`hamper_variants.${i}.price`, { valueAsNumber: true })}
                  aria-invalid={!!errors.hamper_variants?.[i]?.price}
                />
                {errors.hamper_variants?.[i]?.price && (
                  <p className="text-xs text-red-600">
                    {errors.hamper_variants[i]?.price?.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeVariant(i)}
                className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {errors.hamper_variants?.root && (
            <p className="text-xs text-red-600">{errors.hamper_variants.root.message}</p>
          )}
        </div>
      )}

      {/* What's included */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>What&apos;s Included *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => appendIncluded('' as never)}
            className="gap-1 text-xs h-7"
          >
            <Plus className="w-3 h-3" />
            Add
          </Button>
        </div>
        {errors.whats_included?.root && (
          <p className="text-xs text-red-600">{errors.whats_included.root.message}</p>
        )}
        {includedFields.map((field, i) => (
          <div key={field.id} className="flex gap-2">
            <Input
              placeholder="e.g. 2 cookie jars"
              {...register(`whats_included.${i}` as never)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => includedFields.length > 1 && removeIncluded(i)}
              disabled={includedFields.length <= 1}
              className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isDisabled} className="flex-1">
          {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Hamper'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isDisabled}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
