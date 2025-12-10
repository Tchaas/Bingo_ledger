import { CheckCircle, X } from "lucide-react";
import { getCategoryById } from "../utils/form990Categories";

interface BulkSuccessToastProps {
  count: number;
  oldCategoryId?: string;
  newCategoryId: string;
  undoTimeRemaining: number;
  onUndo: () => void;
  onViewAuditLog: () => void;
  onClose: () => void;
}

export function BulkSuccessToast({
  count,
  oldCategoryId,
  newCategoryId,
  undoTimeRemaining,
  onUndo,
  onViewAuditLog,
  onClose
}: BulkSuccessToastProps) {
  const oldCategory = oldCategoryId ? getCategoryById(oldCategoryId) : null;
  const newCategory = getCategoryById(newCategoryId);

  return (
    <div className="fixed top-4 right-4 z-50 w-96 bg-white border border-green-200 border-l-4 border-l-green-500 rounded-lg shadow-lg p-4 animate-in slide-in-from-right duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <CheckCircle className="size-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-gray-900">{count} transactions recategorized</p>
            {oldCategory && newCategory && (
              <p className="text-gray-600 text-sm mt-1">
                {oldCategory.name} → {newCategory.name}
              </p>
            )}
            {!oldCategory && newCategory && (
              <p className="text-gray-600 text-sm mt-1">
                Updated to {newCategory.name}
              </p>
            )}

            <div className="flex items-center gap-3 mt-3">
              {undoTimeRemaining > 0 ? (
                <button
                  onClick={onUndo}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Undo ({undoTimeRemaining}s)
                </button>
              ) : (
                <span className="text-gray-400 text-sm">Undo expired</span>
              )}
              <button
                onClick={onViewAuditLog}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                View Audit Log
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <X className="size-5" />
        </button>
      </div>
    </div>
  );
}
