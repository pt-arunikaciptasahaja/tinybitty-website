import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
  open: boolean;
  itemName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  open,
  itemName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (err) {
      setDeleteError('Deletion failed. Please try again.');
      setIsDeleting(false);
      // Re-throw so parent can handle if needed
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      setDeleteError(null);
      onCancel();
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{itemName}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The item will be permanently removed
            from the database.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {deleteError && (
          <p className="text-sm text-red-600 px-1">{deleteError}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
