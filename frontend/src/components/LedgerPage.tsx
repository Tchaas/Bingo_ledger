import { useState, useMemo, useEffect, useCallback } from "react";
import { Plus, Search, TrendingDown, TrendingUp, Shuffle, Download, Printer, Edit, Trash2, Info, X, ChevronDown, ChevronUp, Lightbulb, AlertTriangle, CheckCircle, FileText, Tag, Minus } from "lucide-react";
import { toast } from "sonner";
import { FORM_990_CATEGORIES, getCategoryById, suggestCategory, type Category } from "../utils/form990Categories";
import { BulkRecategorizeModal } from "./BulkRecategorizeModal";
import { BulkSuccessToast } from "./BulkSuccessToast";
import { apiClient } from "../utils/api";

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

interface TransactionResponse {
  id: number;
  transaction_id: string;
  date: string;
  description: string;
  category_id?: string | null;
  subcategory?: string | null;
  debit?: number | null;
  credit?: number | null;
  balance?: number | null;
  status?: "complete" | "needs-review" | "incomplete";
  additional_fields?: Record<string, string> | null;
}

export function LedgerPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showDebitCreditNote, setShowDebitCreditNote] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Bulk selection state
  const [selectedTransactionIds, setSelectedTransactionIds] = useState<string[]>([]);
  const [showBulkRecategorizeModal, setShowBulkRecategorizeModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkConfirmed, setBulkConfirmed] = useState(false);
  const [showTransactionPreview, setShowTransactionPreview] = useState(false);

  // Undo state
  const [lastBulkAction, setLastBulkAction] = useState<{
    transactionIds: string[];
    oldCategories: Record<string, { categoryId?: string; subcategory?: string }>;
    newCategory: string;
    timestamp: number;
  } | null>(null);
  const [undoTimeRemaining, setUndoTimeRemaining] = useState(0);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    categoryId: "",
    subcategory: "",
    type: "revenue",
    amount: "",
    additionalFields: {} as Record<string, string>
  });

  const [showCategoryHelp, setShowCategoryHelp] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [suggestedCategory, setSuggestedCategory] = useState<{ category: Category; confidence: number } | null>(null);

  // Calculate totals dynamically
  const { totalDebits, totalCredits, totalBalance, transactionCount } = useMemo(() => {
    const debits = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const credits = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const balance = debits - credits;
    return {
      totalDebits: debits,
      totalCredits: credits,
      totalBalance: balance,
      transactionCount: transactions.length,
    };
  }, [transactions]);

  // Generate new transaction ID
  const generateTransactionId = () => {
    const year = new Date().getFullYear();
    const maxId = transactions.reduce((max, t) => {
      const idNum = parseInt(t.transactionId.split("-")[2]);
      return idNum > max ? idNum : max;
    }, 0);
    return `TXN-${year}-${String(maxId + 1).padStart(3, "0")}`;
  };

  const mapTransaction = (transaction: TransactionResponse): Transaction => ({
    id: String(transaction.id),
    date: transaction.date,
    transactionId: transaction.transaction_id,
    description: transaction.description,
    categoryId: transaction.category_id ?? undefined,
    subcategory: transaction.subcategory ?? undefined,
    debit: transaction.debit ?? undefined,
    credit: transaction.credit ?? undefined,
    balance: transaction.balance ?? 0,
    status: transaction.status ?? "complete",
    additionalFields: transaction.additional_fields ?? undefined
  });

  const buildQueryParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (categoryFilter !== "all") params.set("category_id", categoryFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (yearFilter !== "all") params.set("year", yearFilter);
    if (monthFilter !== "all") params.set("month", monthFilter);
    params.set("sort_by", "date");
    params.set("sort_dir", "desc");
    return params;
  };

  const fetchTransactions = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const params = buildQueryParams();
      const data = await apiClient.get<{ transactions: TransactionResponse[] }>(
        `/transactions?${params.toString()}`
      );
      setTransactions((data.transactions || []).map(mapTransaction));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to load transactions.";
      setListError(message);
      toast.error(message);
    } finally {
      setListLoading(false);
    }
  }, [searchQuery, categoryFilter, statusFilter, typeFilter, yearFilter, monthFilter]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAddTransaction = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      date: today,
      description: "",
      categoryId: "",
      subcategory: "",
      type: "revenue",
      amount: "",
      additionalFields: {}
    });
    setCreateError(null);
    setSuggestedCategory(null);
    setShowCategoryHelp(false);
    setShowWarning(true);
    setShowAddModal(true);
  };

  const handleDescriptionChange = (value: string) => {
    setFormData({ ...formData, description: value });

    // Suggest category based on description
    if (value.length > 3) {
      const suggestion = suggestCategory(value);
      setSuggestedCategory(suggestion);
    } else {
      setSuggestedCategory(null);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    const newType = category ? (category.type === "revenue" ? "revenue" : "expense") : "revenue";

    setFormData({
      ...formData,
      categoryId,
      subcategory: "",
      additionalFields: {},
      type: newType
    });
    setShowCategoryHelp(!!categoryId);
  };

  const handleUseSuggestion = () => {
    if (suggestedCategory) {
      handleCategoryChange(suggestedCategory.category.id);
      setSuggestedCategory(null);
    }
  };

  const getSelectedCategory = (): Category | undefined => {
    return formData.categoryId ? getCategoryById(formData.categoryId) : undefined;
  };

  const getCategoryWarning = (): string | undefined => {
    const category = getSelectedCategory();
    return category?.warning;
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.description || !formData.amount || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    try {
      await apiClient.post("/transactions", {
        transaction_id: generateTransactionId(),
        date: formData.date,
        description: formData.description,
        category_id: formData.categoryId,
        subcategory: formData.subcategory || null,
        debit: formData.type === "expense" ? parseFloat(formData.amount) : null,
        credit: formData.type === "revenue" ? parseFloat(formData.amount) : null,
        status: "complete",
        additional_fields: formData.additionalFields
      });
      setShowAddModal(false);
      await fetchTransactions();
      toast.success("Transaction added successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to add transaction.";
      setCreateError(message);
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEdit = (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      const category = transaction.categoryId ? getCategoryById(transaction.categoryId) : undefined;
      const transactionType = category ? (category.type === "revenue" ? "revenue" : "expense") : (transaction.credit ? "revenue" : "expense");

      setEditingTransaction(transaction);
      setUpdateError(null);
      setFormData({
        date: transaction.date,
        description: transaction.description,
        categoryId: transaction.categoryId || "",
        subcategory: transaction.subcategory || "",
        type: transactionType,
        amount: String(transaction.debit || transaction.credit || ""),
        additionalFields: transaction.additionalFields || {}
      });
      setShowCategoryHelp(!!transaction.categoryId);
      setShowWarning(true);
      setShowEditModal(true);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !formData.date || !formData.description || !formData.amount || !formData.categoryId) {
      toast.error("Please fill in all required fields");
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);
    try {
      await apiClient.put(`/transactions/${editingTransaction.id}`, {
        date: formData.date,
        description: formData.description,
        category_id: formData.categoryId,
        subcategory: formData.subcategory || null,
        debit: formData.type === "expense" ? parseFloat(formData.amount) : null,
        credit: formData.type === "revenue" ? parseFloat(formData.amount) : null,
        additional_fields: formData.additionalFields,
        status: "complete"
      });
      setShowEditModal(false);
      setEditingTransaction(null);
      await fetchTransactions();
      toast.success("Transaction updated successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to update transaction.";
      setUpdateError(message);
      toast.error(message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteLoadingId(id);
    setDeleteError(null);
    try {
      await apiClient.delete(`/transactions/${id}`);
      await fetchTransactions();
      toast.success("Transaction deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to delete transaction.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const handleExport = () => {
    toast.success("Transactions exported successfully");
  };

  const handlePrint = () => {
    toast.info("Print dialog would open here");
  };

  // Determine balance color
  const balanceColor = totalBalance >= 0 ? "text-green-600" : "text-red-600";
  const balanceIcon = totalBalance >= 0 ? TrendingUp : TrendingDown;
  const balanceBgColor = totalBalance >= 0 ? "bg-green-100" : "bg-red-100";
  const balanceIconColor = totalBalance >= 0 ? "text-green-600" : "text-red-600";
  const BalanceIcon = balanceIcon;

  const selectedCategory = getSelectedCategory();
  const categoryWarning = getCategoryWarning();
  const selectedTransactions = useMemo(
    () => transactions.filter((transaction) => selectedTransactionIds.includes(transaction.id)),
    [transactions, selectedTransactionIds]
  );

  // Bulk recategorize
  const handleBulkRecategorize = () => {
    if (selectedTransactionIds.length === 0) {
      toast.error("Please select transactions to recategorize");
      return;
    }
    setShowBulkRecategorizeModal(true);
  };

  const handleBulkCategoryChange = (categoryId: string) => {
    setBulkCategory(categoryId);
  };

  const handleBulkConfirm = async () => {
    if (bulkCategory === "") {
      toast.error("Please select a category");
      return;
    }

    const oldCategories: Record<string, { categoryId?: string; subcategory?: string }> = {};
    transactions.forEach((transaction) => {
      if (selectedTransactionIds.includes(transaction.id)) {
        oldCategories[transaction.id] = {
          categoryId: transaction.categoryId,
          subcategory: transaction.subcategory
        };
      }
    });

    try {
      await Promise.all(
        selectedTransactionIds.map(async (transactionId) => {
          await apiClient.put(`/transactions/${transactionId}`, {
            category_id: bulkCategory,
            subcategory: "",
            status: "needs-review"
          });
        })
      );
      setLastBulkAction({
        transactionIds: selectedTransactionIds,
        oldCategories,
        newCategory: bulkCategory,
        timestamp: Date.now()
      });
      setUndoTimeRemaining(10);
      setBulkConfirmed(true);
      setShowBulkRecategorizeModal(false);
      await fetchTransactions();
      toast.success("Transactions recategorized successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to recategorize transactions.";
      toast.error(message);
    }
  };

  const handleUndoBulkAction = async () => {
    if (!lastBulkAction) return;

    try {
      await Promise.all(
        lastBulkAction.transactionIds.map(async (transactionId) => {
          const previousCategory = lastBulkAction.oldCategories[transactionId];
          await apiClient.put(`/transactions/${transactionId}`, {
            category_id: previousCategory?.categoryId || null,
            subcategory: previousCategory?.subcategory || null,
            status: "complete"
          });
        })
      );
      setLastBulkAction(null);
      setUndoTimeRemaining(0);
      await fetchTransactions();
      toast.success("Bulk action undone");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to undo bulk action.";
      toast.error(message);
    }
  };

  useEffect(() => {
    if (undoTimeRemaining > 0) {
      const timer = setTimeout(() => {
        setUndoTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [undoTimeRemaining]);

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Financial Ledger</h1>
          <p className="text-gray-600">Track and manage all your financial transactions</p>
        </div>
        <button
          onClick={handleAddTransaction}
          className="flex items-center gap-2 px-6 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="size-4" />
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900">Filters</h2>
          <button
            onClick={() => {
              setYearFilter("all");
              setMonthFilter("all");
              setTypeFilter("all");
              setCategoryFilter("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-5 gap-6 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Year</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Years</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Months</option>
              <option value="12">December</option>
              <option value="11">November</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              <optgroup label="Revenue">
                {FORM_990_CATEGORIES.filter(c => c.type === "revenue").map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </optgroup>
              <optgroup label="Expenses">
                {FORM_990_CATEGORIES.filter(c => c.type === "expense").map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Statuses</option>
              <option value="complete">Complete</option>
              <option value="needs-review">Needs Review</option>
              <option value="incomplete">Incomplete</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Quick filter chips */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTypeFilter(typeFilter === "debit" ? "all" : "debit")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${typeFilter === "debit"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Debits Only
          </button>
          <button
            onClick={() => setTypeFilter(typeFilter === "credit" ? "all" : "credit")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${typeFilter === "credit"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Credits Only
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === "needs-review" ? "all" : "needs-review")}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${statusFilter === "needs-review"
              ? "bg-amber-100 text-amber-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
          >
            Needs Review
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Balance</p>
              <p className={balanceColor}>${Math.abs(totalBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className={balanceBgColor + " p-3 rounded-lg"}>
              <BalanceIcon className={`size-5 ${balanceIconColor}`} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Debits</p>
              <p className="text-green-600">${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="size-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Credits</p>
              <p className="text-red-600">${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingDown className="size-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Transactions</p>
              <p className="text-gray-900">{transactionCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Shuffle className="size-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Transaction table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Transaction History</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDebitCreditNote(true)}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Info className="size-4" />
                Debit/Credit Info
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Download className="size-4" />
                Export
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <Printer className="size-4" />
                Print
              </button>
            </div>
          </div>
          {(listError || deleteError) && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {listError || deleteError}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700">Date</th>
                <th className="px-6 py-3 text-left text-gray-700">Transaction ID</th>
                <th className="px-6 py-3 text-left text-gray-700">Description</th>
                <th className="px-6 py-3 text-left text-gray-700">Category</th>
                <th className="px-6 py-3 text-left text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <span>Expense (Debit)</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <span>Revenue (Credit)</span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Balance</th>
                <th className="px-6 py-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {listLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => {
                  const category = transaction.categoryId ? getCategoryById(transaction.categoryId) : undefined;
                  const statusIcon = transaction.status === "complete" ? CheckCircle : transaction.status === "needs-review" ? AlertTriangle : Info;
                  const StatusIcon = statusIcon;
                  const isExpense = category?.type === "expense";
                  const isRevenue = category?.type === "revenue";

                  return (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-gray-900">{new Date(transaction.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.transactionId}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.description}</td>
                      <td className="px-6 py-4">
                        {category ? (
                          <div className="group relative">
                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full ${category.type === "revenue" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                              }`}>
                              <Tag className="size-3" />
                              <span className="text-sm">{category.name}</span>
                              {transaction.status === "complete" && <CheckCircle className="size-3" />}
                            </div>
                            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="size-3" />
                                  <span>{category.form990Reference}</span>
                                </div>
                                <p className="text-gray-300">{category.description}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Type: {category.type === "revenue" ? "Revenue" : "Expense"}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-sm">
                            Uncategorized
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 ${isExpense ? "text-red-600" : "text-gray-400"}`}>
                        {transaction.debit ? `$${transaction.debit.toFixed(2)}` : "-"}
                      </td>
                      <td className={`px-6 py-4 ${isRevenue ? "text-green-600" : "text-gray-400"}`}>
                        {transaction.credit ? `$${transaction.credit.toFixed(2)}` : "-"}
                      </td>
                      <td className={`px-6 py-4 ${transaction.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                        ${Math.abs(transaction.balance).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(transaction.id)}
                            className="p-1 text-blue-600 hover:text-blue-700"
                            disabled={updateLoading || deleteLoadingId === transaction.id}
                          >
                            <Edit className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(transaction.id)}
                            className="p-1 text-red-600 hover:text-red-700"
                            disabled={deleteLoadingId === transaction.id}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-600">Showing {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <TransactionModal
          mode="add"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitAdd}
          onClose={() => setShowAddModal(false)}
          isSubmitting={createLoading}
          errorMessage={createError}
          suggestedCategory={suggestedCategory}
          onUseSuggestion={handleUseSuggestion}
          onDescriptionChange={handleDescriptionChange}
          showCategoryHelp={showCategoryHelp}
          setShowCategoryHelp={setShowCategoryHelp}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
          categoryWarning={categoryWarning}
          transactionId={generateTransactionId()}
        />
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && editingTransaction && (
        <TransactionModal
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmitEdit}
          onClose={() => {
            setShowEditModal(false);
            setEditingTransaction(null);
          }}
          isSubmitting={updateLoading}
          errorMessage={updateError}
          onDescriptionChange={handleDescriptionChange}
          showCategoryHelp={showCategoryHelp}
          setShowCategoryHelp={setShowCategoryHelp}
          showWarning={showWarning}
          setShowWarning={setShowWarning}
          onCategoryChange={handleCategoryChange}
          selectedCategory={selectedCategory}
          categoryWarning={categoryWarning}
          transactionId={editingTransaction.transactionId}
        />
      )}

      {/* Debit/Credit Info Dialog */}
      {showDebitCreditNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-gray-900">Debits and Credits System</h2>
                <button
                  onClick={() => setShowDebitCreditNote(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <div className="p-8">
              <p className="text-gray-600 mb-8">
                Accounts are increased and decreased with a debit or credit. Understanding the debit and credit system is essential for accurate bookkeeping.
              </p>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Debit Column */}
                  <div>
                    <div className="mb-6 pb-4 border-b-4 border-green-600">
                      <h3 className="text-green-600">DEBIT</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="text-green-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">ASSETS</p>
                          <p className="text-gray-600">Increase</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-green-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">LIABILITY</p>
                          <p className="text-gray-600">Decrease</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-green-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">EQUITY</p>
                          <p className="text-gray-600">Decrease</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-green-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">EXPENSES</p>
                          <p className="text-gray-600">Increase</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Credit Column */}
                  <div>
                    <div className="mb-6 pb-4 border-b-4 border-red-600">
                      <h3 className="text-red-600">CREDIT</h3>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="text-red-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">ASSETS</p>
                          <p className="text-gray-600">Decrease</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-red-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">LIABILITY</p>
                          <p className="text-gray-600">Increase</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-red-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">EQUITY</p>
                          <p className="text-gray-600">Increase</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-red-600">
                          <svg className="size-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-gray-900">REVENUE</p>
                          <p className="text-gray-600">Increase</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowDebitCreditNote(false)}
                  className="px-6 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Recategorize Modal */}
      {showBulkRecategorizeModal && (
        <BulkRecategorizeModal
          selectedTransactions={selectedTransactions}
          bulkCategory={bulkCategory}
          setBulkCategory={handleBulkCategoryChange}
          bulkConfirmed={bulkConfirmed}
          setBulkConfirmed={setBulkConfirmed}
          onConfirm={handleBulkConfirm}
          onClose={() => setShowBulkRecategorizeModal(false)}
        />
      )}

      {/* Bulk Success Toast */}
      {bulkConfirmed && (
        <BulkSuccessToast
          count={selectedTransactionIds.length}
          oldCategoryId={lastBulkAction?.oldCategories[selectedTransactionIds[0]]?.categoryId}
          newCategoryId={bulkCategory}
          undoTimeRemaining={undoTimeRemaining}
          onUndo={handleUndoBulkAction}
          onViewAuditLog={() => toast.info("Audit log would open here.")}
          onClose={() => setBulkConfirmed(false)}
        />
      )}
    </div>
  );
}

// Transaction Modal Component
interface TransactionModalProps {
  mode: "add" | "edit";
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
  errorMessage?: string | null;
  suggestedCategory?: { category: Category; confidence: number } | null;
  onUseSuggestion?: () => void;
  onDescriptionChange: (value: string) => void;
  showCategoryHelp: boolean;
  setShowCategoryHelp: (show: boolean) => void;
  showWarning: boolean;
  setShowWarning: (show: boolean) => void;
  onCategoryChange: (categoryId: string) => void;
  selectedCategory?: Category;
  categoryWarning?: string;
  transactionId: string;
}

function TransactionModal({
  mode,
  formData,
  setFormData,
  onSubmit,
  onClose,
  isSubmitting,
  errorMessage,
  suggestedCategory,
  onUseSuggestion,
  onDescriptionChange,
  showCategoryHelp,
  setShowCategoryHelp,
  showWarning,
  setShowWarning,
  onCategoryChange,
  selectedCategory,
  categoryWarning,
  transactionId
}: TransactionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">{mode === "add" ? "Add Transaction" : "Edit Transaction"}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {/* Transaction ID */}
          <div>
            <label className="block text-gray-700 mb-2">Transaction ID</label>
            <input
              type="text"
              value={transactionId}
              disabled
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 mb-2">Description *</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter transaction description"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Smart Category Suggestion */}
          {suggestedCategory && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-900">
                    Suggested: <span className="font-semibold">{suggestedCategory.category.name}</span>
                  </p>
                  <p className="text-xs text-gray-600">{suggestedCategory.confidence}% confidence</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onUseSuggestion}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                Use this
              </button>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-gray-700 mb-2 flex items-center gap-1.5">
              Category *
              <button
                type="button"
                onClick={() => setShowCategoryHelp(!showCategoryHelp)}
                className="text-blue-600 hover:text-blue-700"
              >
                <Info className="size-4" />
              </button>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
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

          {/* Category Help Panel */}
          {showCategoryHelp && selectedCategory && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="size-5 text-gray-600" />
                  <h4 className="text-gray-900">Form 990 Context</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCategoryHelp(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <ChevronUp className="size-4" />
                </button>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">{selectedCategory.form990Reference}</p>
                <p className="text-sm text-gray-700">{selectedCategory.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-700 mb-2">What qualifies?</p>
                <ul className="space-y-1">
                  {selectedCategory.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-blue-600">•</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Subcategory - Dynamic */}
          {selectedCategory?.subcategories && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-gray-700 mb-2">Subcategory</label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Select a subcategory</option>
                {selectedCategory.subcategories.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Required Fields */}
          {selectedCategory?.requiredFields && selectedCategory.requiredFields.map(field => (
            <div key={field.field} className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-gray-700 mb-2">{field.label} *</label>
              <input
                type={field.type}
                placeholder={field.format || ""}
                value={formData.additionalFields?.[field.field] || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  additionalFields: {
                    ...formData.additionalFields,
                    [field.field]: e.target.value
                  }
                })}
                className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              />
            </div>
          ))}

          {/* Type - Auto-synced with category */}
          <div>
            <label className="block text-gray-700 mb-2">Type *</label>
            <input
              type="text"
              value={formData.type === "revenue" ? "Revenue" : formData.type === "expense" ? "Expense" : ""}
              disabled
              className="w-full h-10 px-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              placeholder="Select a category first"
            />
            <p className="text-xs text-gray-500 mt-1">Automatically set based on category selection</p>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-gray-700 mb-2">Amount *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              required
            />
          </div>

          {/* Validation Warning Banner */}
          {categoryWarning && showWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3 animate-in fade-in duration-200">
              <AlertTriangle className="size-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700 flex-1">{categoryWarning}</p>
              <button
                type="button"
                onClick={() => setShowWarning(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : mode === "add" ? "Add Transaction" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
