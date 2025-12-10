import { useState } from "react";
import { X, Info, ChevronDown } from "lucide-react";
import { FORM_990_CATEGORIES, getCategoryById, type Category } from "../utils/form990Categories";

interface Transaction {
  id: string;
  date: string;
  transactionId: string;
  description: string;
  categoryId?: string;
  subcategory?: string;
  debit?: number;
  credit?: number;
  balance: number;
  additionalFields?: Record<string, string>;
  status?: "complete" | "needs-review" | "incomplete";
}

interface BulkRecategorizeModalProps {
  selectedTransactions: Transaction[];
  bulkCategory: string;
  setBulkCategory: (categoryId: string) => void;
  bulkConfirmed: boolean;
  setBulkConfirmed: (confirmed: boolean) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export function BulkRecategorizeModal({
  selectedTransactions,
  bulkCategory,
  setBulkCategory,
  bulkConfirmed,
  setBulkConfirmed,
  onClose,
  onConfirm
}: BulkRecategorizeModalProps) {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Calculate summary data
  const totalAmount = selectedTransactions.reduce((sum, t) => sum + (t.debit || t.credit || 0), 0);
  const dateRange = selectedTransactions.length > 0 ? {
    start: new Date(Math.min(...selectedTransactions.map(t => new Date(t.date).getTime()))),
    end: new Date(Math.max(...selectedTransactions.map(t => new Date(t.date).getTime())))
  } : null;

  // Group by current category
  const categoryGroups = selectedTransactions.reduce((acc, t) => {
    const categoryId = t.categoryId || "uncategorized";
    const category = categoryId !== "uncategorized" ? getCategoryById(categoryId) : null;
    const categoryName = category ? category.name : "Uncategorized";
    
    if (!acc[categoryName]) {
      acc[categoryName] = 0;
    }
    acc[categoryName]++;
    return acc;
  }, {} as Record<string, number>);

  // Calculate Form 990 impact
  const newCategory = bulkCategory ? getCategoryById(bulkCategory) : null;
  
  // Get old categories with amounts
  const oldCategoryImpact = Object.entries(categoryGroups).map(([name, count]) => {
    const cat = FORM_990_CATEGORIES.find(c => c.name === name);
    const amount = selectedTransactions
      .filter(t => {
        const tCat = t.categoryId ? getCategoryById(t.categoryId) : null;
        return (tCat?.name || "Uncategorized") === name;
      })
      .reduce((sum, t) => sum + (t.debit || t.credit || 0), 0);
    
    return {
      name,
      reference: cat?.form990Reference || "Not categorized",
      amount,
      count
    };
  });

  const transactionsToShow = showAllTransactions 
    ? selectedTransactions 
    : selectedTransactions.slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">
              Recategorize {selectedTransactions.length} Transaction{selectedTransactions.length !== 1 ? 's' : ''}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Selection Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            <p className="text-gray-900">Currently Selected:</p>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''}</li>
              {dateRange && (
                <li>
                  • Date range: {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </li>
              )}
              <li>• Total amount: ${totalAmount.toFixed(2)}</li>
            </ul>

            {Object.keys(categoryGroups).length > 1 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-gray-900 text-sm mb-1">Current Categories:</p>
                <ul className="space-y-1 text-sm text-gray-700">
                  {Object.entries(categoryGroups).map(([name, count]) => (
                    <li key={name}>
                      • {count} transaction{count !== 1 ? 's' : ''}: "{name}"
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* New Category Selector */}
          <div>
            <label className="block text-gray-700 mb-2">New Category *</label>
            <select
              value={bulkCategory}
              onChange={(e) => setBulkCategory(e.target.value)}
              className="w-full h-12 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Select a category</option>
              <optgroup label="Revenue Categories">
                {FORM_990_CATEGORIES.filter(c => c.type === "revenue").map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.form990Reference})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Expense Categories">
                {FORM_990_CATEGORIES.filter(c => c.type === "expense").map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.form990Reference})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Form 990 Impact Panel */}
          {newCategory && (
            <div className="bg-blue-50 border border-blue-200 border-l-4 border-l-blue-500 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Info className="size-5 text-blue-600" />
                <h4 className="text-blue-900">Form 990 Impact</h4>
              </div>

              <p className="text-gray-700 text-sm">This will affect your Form 990 reporting:</p>

              <div className="space-y-3">
                <div>
                  <p className="text-gray-900 font-medium text-sm mb-1">Before:</p>
                  {oldCategoryImpact.map((impact, idx) => (
                    <div key={idx} className="text-sm text-gray-700 ml-3">
                      • {impact.reference}
                      <br />
                      <span className="ml-2">Amount: ${impact.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-gray-900 font-medium text-sm mb-1">After:</p>
                  <div className="text-sm text-gray-700 ml-3">
                    • {newCategory.form990Reference}: {newCategory.name}
                    <br />
                    <span className="ml-2">Amount: ${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {newCategory.warning && (
                <div className="flex items-start gap-2 pt-2 border-t border-blue-200">
                  <span className="text-amber-500">⚠️</span>
                  <p className="text-sm text-gray-700 flex-1">
                    Note: {newCategory.warning}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Transaction Preview */}
          <div>
            <p className="text-gray-700 mb-3">
              Preview Changes (showing {transactionsToShow.length} of {selectedTransactions.length}):
            </p>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="max-h-80 overflow-y-auto">
                {transactionsToShow.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid grid-cols-3 gap-4 px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 text-sm"
                  >
                    <span className="text-gray-600">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                    <span className="text-gray-900 truncate">
                      {transaction.description}
                    </span>
                    <span className="text-gray-900 text-right">
                      ${(transaction.debit || transaction.credit || 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {selectedTransactions.length > 5 && !showAllTransactions && (
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setShowAllTransactions(true)}
                    className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  >
                    ... and {selectedTransactions.length - 5} more transactions
                    <ChevronDown className="size-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={bulkConfirmed}
              onChange={(e) => setBulkConfirmed(e.target.checked)}
              className="mt-0.5 w-5 h-5 border-gray-300 rounded text-blue-600 focus:ring-2 focus:ring-blue-600"
            />
            <span className="text-gray-700 text-sm">
              I understand this will update {selectedTransactions.length} transaction{selectedTransactions.length !== 1 ? 's' : ''} and
              affect Form 990 tax reporting. This action will be logged in the audit trail.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 h-12 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!bulkConfirmed || !bulkCategory}
              className={`px-6 h-12 rounded-lg transition-colors ${
                bulkConfirmed && bulkCategory
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Confirm Recategorization
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
