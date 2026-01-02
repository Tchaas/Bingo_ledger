import { useEffect, useMemo, useState } from "react";
import { Search, Download, MoreVertical, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, FileText, BarChart } from "lucide-react";
import { getCategoryById } from "../utils/form990Categories";
import { toast } from "sonner@2.0.3";

interface CategorySummary {
  categoryId: string;
  transactionCount: number;
  totalAmount: number;
  status: "complete" | "needs-review" | "incomplete";
  trend: "up" | "down" | "neutral";
  trendPercent?: number;
}

export function CategoryReviewPage() {
  const [fiscalYear, setFiscalYear] = useState("2024");
  const [categoryTypeFilter, setCategoryTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [form990PartFilter, setForm990PartFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<"category" | "count" | "amount" | "status">("category");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const fetchSummaries = async () => {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (fiscalYear) {
        params.set("year", fiscalYear);
      }
      if (categoryTypeFilter !== "all") {
        params.set("type", categoryTypeFilter);
      }
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }
      if (form990PartFilter !== "all") {
        params.set("form990Part", form990PartFilter);
      }
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      params.set("sort", sortColumn);
      params.set("direction", sortDirection);

      try {
        const response = await fetch(`/api/transactions/category-summary?${params.toString()}`, {
          signal: controller.signal
        });
        if (!response.ok) {
          throw new Error("Unable to load category summaries");
        }
        const data = await response.json();
        setCategorySummaries(data.summaries ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          toast.error("Unable to load category summary data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummaries();
    return () => controller.abort();
  }, [fiscalYear, categoryTypeFilter, statusFilter, form990PartFilter, searchQuery, sortColumn, sortDirection]);

  const filteredSummaries = useMemo(() => {
    return categorySummaries.filter((summary) => {
      const category = getCategoryById(summary.categoryId);
      if (!category) return false;

      // Type filter
      if (categoryTypeFilter === "revenue" && category.type !== "revenue") return false;
      if (categoryTypeFilter === "expense" && category.type !== "expense") return false;

      // Status filter
      if (statusFilter !== "all" && summary.status !== statusFilter) return false;

      // Form 990 Part filter
      if (form990PartFilter !== "all" && !category.part.includes(form990PartFilter)) return false;

      // Search query
      if (searchQuery && !category.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

      return true;
    });
  }, [categorySummaries, categoryTypeFilter, statusFilter, form990PartFilter, searchQuery]);

  const sortedSummaries = useMemo(() => {
    const summaries = [...filteredSummaries];
    const statusOrder: Record<CategorySummary["status"], number> = {
      complete: 0,
      "needs-review": 1,
      incomplete: 2
    };

    summaries.sort((a, b) => {
      if (sortColumn === "category") {
        const nameA = getCategoryById(a.categoryId)?.name ?? a.categoryId;
        const nameB = getCategoryById(b.categoryId)?.name ?? b.categoryId;
        return nameA.localeCompare(nameB);
      }
      if (sortColumn === "count") {
        return a.transactionCount - b.transactionCount;
      }
      if (sortColumn === "amount") {
        return a.totalAmount - b.totalAmount;
      }
      return statusOrder[a.status] - statusOrder[b.status];
    });

    return sortDirection === "asc" ? summaries : summaries.reverse();
  }, [filteredSummaries, sortColumn, sortDirection]);

  // Calculate summary statistics
  const categoriesUsed = filteredSummaries.length;
  const needsReview = filteredSummaries.filter(c => c.status === "needs-review" || c.status === "incomplete").length;
  const percentReady = categoriesUsed
    ? Math.round((filteredSummaries.filter(c => c.status === "complete").length / categoriesUsed) * 100)
    : 0;
  const totalTransactions = filteredSummaries.reduce((sum, c) => sum + c.transactionCount, 0);

  const handleSort = (column: typeof sortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    toast.success("Category report exported successfully");
  };

  const handleBulkRecategorize = () => {
    toast.info("Bulk recategorization feature coming soon");
  };

  const handleViewTransactions = (categoryId: string) => {
    toast.info(`Filtering ledger to show ${getCategoryById(categoryId)?.name} transactions`);
  };

  const handleExportCategory = (categoryId: string) => {
    toast.success(`Exported ${getCategoryById(categoryId)?.name} transactions`);
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-1">Category Review</h1>
          <p className="text-gray-600">Review and manage transaction categories for Form 990 reporting</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="2024">FY 2024</option>
            <option value="2023">FY 2023</option>
            <option value="2022">FY 2022</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 h-10 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="size-4" />
            Export Report
          </button>
          <button
            onClick={handleBulkRecategorize}
            className="flex items-center gap-2 px-4 h-10 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bulk Recategorize
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Categories Used</p>
              <p className="text-gray-900">{categoriesUsed}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart className="size-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Needs Review</p>
              <p className="text-amber-600">{needsReview}</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Form 990 Ready</p>
              <p className="text-green-600">{percentReady}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <div className="relative size-5">
                <svg className="size-5 transform -rotate-90">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#D1FAE5"
                    strokeWidth="4"
                    fill="none"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="#10B981"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${percentReady * 0.502} ${100 * 0.502}`}
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">Total Transactions</p>
              <p className="text-gray-900">{totalTransactions}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="size-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Category Type</label>
            <select
              value={categoryTypeFilter}
              onChange={(e) => setCategoryTypeFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expenses</option>
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
            <label className="block text-gray-700 mb-2">Form 990 Part</label>
            <select
              value={form990PartFilter}
              onChange={(e) => setForm990PartFilter(e.target.value)}
              className="w-full h-10 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Parts</option>
              <option value="Part VIII">Part VIII - Revenue</option>
              <option value="Part IX">Part IX - Expenses</option>
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
                placeholder="Search categories..."
                className="w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category summary table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("category")}
                >
                  Category Name
                </th>
                <th 
                  className="px-6 py-3 text-left text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("count")}
                >
                  Transaction Count
                </th>
                <th 
                  className="px-6 py-3 text-left text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("amount")}
                >
                  Total Amount
                </th>
                <th 
                  className="px-6 py-3 text-left text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("status")}
                >
                  Status
                </th>
                <th className="px-6 py-3 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    Loading category summaries...
                  </td>
                </tr>
              ) : sortedSummaries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                    No category summaries match your filters.
                  </td>
                </tr>
              ) : (
                sortedSummaries.map((summary) => {
                  const category = getCategoryById(summary.categoryId);
                  if (!category) return null;

                  return (
                    <tr key={summary.categoryId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.form990Reference}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900">{summary.transactionCount}</span>
                          {summary.trend === "up" && summary.trendPercent !== undefined && (
                            <span className="flex items-center gap-0.5 text-green-600 text-xs">
                              <TrendingUp className="size-3" />
                              {summary.trendPercent}%
                            </span>
                          )}
                          {summary.trend === "down" && summary.trendPercent !== undefined && (
                            <span className="flex items-center gap-0.5 text-red-600 text-xs">
                              <TrendingDown className="size-3" />
                              {summary.trendPercent}%
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">
                        ${summary.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm ${
                          summary.status === "complete"
                            ? "bg-green-100 text-green-700"
                            : summary.status === "needs-review"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {summary.status === "complete" && <CheckCircle className="size-3" />}
                          {summary.status === "needs-review" && <AlertTriangle className="size-3" />}
                          {summary.status === "incomplete" && <AlertTriangle className="size-3" />}
                          {summary.status === "complete" ? "Complete" : summary.status === "needs-review" ? "Needs Review" : "Incomplete"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative group">
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="size-5" />
                          </button>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                              onClick={() => handleViewTransactions(summary.categoryId)}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                            >
                              View All Transactions
                            </button>
                            <button
                              onClick={handleBulkRecategorize}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                            >
                              Bulk Recategorize
                            </button>
                            <button
                              onClick={() => handleExportCategory(summary.categoryId)}
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                            >
                              Export Category
                            </button>
                            <button
                              className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
                            >
                              Add Note
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form 990 Visual Map */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h2 className="text-gray-900 mb-6">Form 990 Overview</h2>
        
        <div className="grid grid-cols-3 gap-6">
          {/* Part VIII - Revenue */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="mb-4">
              <h3 className="text-gray-900 mb-1">Part VIII</h3>
              <p className="text-sm text-gray-600">Revenue</p>
            </div>
            
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-green-600" style={{ width: "87%" }}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">87% Ready</span>
              <CheckCircle className="size-5 text-green-600" />
            </div>
          </div>

          {/* Part IX - Expenses */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer">
            <div className="mb-4">
              <h3 className="text-gray-900 mb-1">Part IX</h3>
              <p className="text-sm text-gray-600">Expenses</p>
            </div>
            
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-amber-600" style={{ width: "65%" }}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">65% Ready</span>
              <AlertTriangle className="size-5 text-amber-600" />
            </div>
          </div>

          {/* Part X - Balance Sheet */}
          <div className="border border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer opacity-50">
            <div className="mb-4">
              <h3 className="text-gray-900 mb-1">Part X</h3>
              <p className="text-sm text-gray-600">Balance Sheet</p>
            </div>
            
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gray-400" style={{ width: "0%" }}></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">0% Ready</span>
              <div className="size-5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
