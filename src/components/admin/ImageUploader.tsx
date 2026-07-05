import { useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { validateImageFile } from '@/lib/adminUtils';
import { Button } from '@/components/ui/button';
import { Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  disabled?: boolean;
  label?: string;
}

export default function ImageUploader({
  value,
  onChange,
  bucket = 'product-images',
  disabled = false,
  label = 'Image',
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // Validate before uploading
    const validation = validateImageFile({
      type: file.type,
      size: file.size,
      name: file.name,
    });

    if (!validation.isValid) {
      setUploadError(validation.error ?? 'Invalid file.');
      // Reset input so the same file can be re-selected after fix
      if (inputRef.current) inputRef.current.value = '';
      return;
    }

    setUploading(true);

    try {
      const ext = file.name.split('.').pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: false });

      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
    } catch {
      setUploadError('Image upload failed. Please try again.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleClear = () => {
    onChange('');
    setUploadError(null);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>

      {/* Preview */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-24 h-24 rounded-xl object-cover border border-gray-200"
          />
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || uploading}
            className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors disabled:opacity-50"
            aria-label="Remove image"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Upload area */}
      {!value && (
        <div
          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
          onClick={() => !disabled && !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <ImageIcon className="w-6 h-6 text-gray-400" />
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || uploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
        className="gap-1.5 text-xs"
      >
        <Upload className="w-3 h-3" />
        {uploading ? 'Uploading…' : value ? 'Replace' : 'Upload image'}
      </Button>

      {uploadError && (
        <p className="text-xs text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
