import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  onConfirm,
  onCancel,
  loading = false,
}) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="h-6 w-6 text-red-600" />;
      case 'info':
        return <Info className="h-6 w-6 text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-600" />;
      default:
        return <Info className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'destructive':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            {getIcon()}
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription className="text-left">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Convenience hook for delete confirmations
export function useDeleteConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);

  const confirm = (itemToDelete) => {
    setItem(itemToDelete);
    setIsOpen(true);
  };

  const DeleteDialog = ({ onConfirm }) => (
    <ConfirmationDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      variant="destructive"
      title="Delete Item"
      description={
        item
          ? `Are you sure you want to delete "${item.name}"? This action cannot be undone.`
          : ''
      }
      confirmText="Delete"
      loading={loading}
      onConfirm={async () => {
        if (!item) return;
        setLoading(true);
        try {
          await onConfirm(item.id);
          setIsOpen(false);
          setItem(null);
        } finally {
          setLoading(false);
        }
      }}
      onCancel={() => {
        setIsOpen(false);
        setItem(null);
      }}
    />
  );

  return { confirm, DeleteDialog };
}
