// Form 990 Category definitions and mappings

export interface Category {
  id: string;
  name: string;
  form990Reference: string;
  type: "revenue" | "expense";
  part: string;
  line: string;
  description: string;
  examples: string[];
  subcategories?: string[];
  requiredFields?: {
    field: string;
    label: string;
    type: string;
    format?: string;
  }[];
  warning?: string;
}

export const FORM_990_CATEGORIES: Category[] = [
  // Revenue Categories (Part VIII)
  {
    id: "contributions",
    name: "Contributions & Grants",
    form990Reference: "Part VIII, Line 1",
    type: "revenue",
    part: "Part VIII",
    line: "Line 1",
    description: "Contributions, gifts, grants, and similar amounts received",
    examples: [
      "Individual donations",
      "Foundation grants",
      "Corporate sponsorships",
      "Government grants",
      "Fundraising event proceeds"
    ],
    subcategories: ["Unrestricted", "Restricted", "In-Kind"],
    warning: "Donations over $5,000 may require Schedule B documentation for donor anonymity"
  },
  {
    id: "program-service-revenue",
    name: "Program Service Revenue",
    form990Reference: "Part VIII, Line 2",
    type: "revenue",
    part: "Part VIII",
    line: "Line 2",
    description: "Program service revenue including fees, government contracts, and related income",
    examples: [
      "Service fees",
      "Government contracts",
      "Program-related sales",
      "Membership dues (if program-related)",
      "Tuition and course fees"
    ],
    subcategories: ["Program A", "Program B", "Program C", "Other"]
  },
  {
    id: "investment-income",
    name: "Investment Income",
    form990Reference: "Part VIII, Line 3-4",
    type: "revenue",
    part: "Part VIII",
    line: "Line 3-4",
    description: "Investment income including dividends, interest, and other investment revenue",
    examples: [
      "Dividend income",
      "Interest income from savings",
      "Bond interest",
      "Investment gains",
      "Rental income from investments"
    ],
    subcategories: ["Dividends", "Interest", "Capital Gains", "Other"]
  },
  {
    id: "other-revenue",
    name: "Other Revenue",
    form990Reference: "Part VIII, Line 8-11",
    type: "revenue",
    part: "Part VIII",
    line: "Line 8-11",
    description: "Other revenue not classified in major categories",
    examples: [
      "Fundraising events",
      "Gaming revenue",
      "Miscellaneous revenue",
      "Special events income",
      "Other income sources"
    ],
    subcategories: ["Fundraising Events", "Gaming", "Miscellaneous", "Other"]
  },

  // Expense Categories (Part IX)
  {
    id: "grants-domestic",
    name: "Grants & Allocations - Domestic",
    form990Reference: "Part IX, Line 1",
    type: "expense",
    part: "Part IX",
    line: "Line 1",
    description: "Grants and similar amounts paid to domestic organizations and individuals",
    examples: [
      "Grants to other nonprofits",
      "Scholarship payments",
      "Direct assistance to individuals",
      "Program grants",
      "Partnership allocations"
    ],
    subcategories: ["Organizations", "Individuals", "Scholarships"],
    requiredFields: [
      { field: "recipientName", label: "Recipient Organization Name", type: "text" },
      { field: "recipientEin", label: "Recipient EIN", type: "text", format: "XX-XXXXXXX" }
    ],
    warning: "Grants over $5,000 require Schedule I documentation"
  },
  {
    id: "grants-international",
    name: "Grants & Allocations - International",
    form990Reference: "Part IX, Line 2",
    type: "expense",
    part: "Part IX",
    line: "Line 2",
    description: "Grants and similar amounts paid to international organizations",
    examples: [
      "International nonprofit grants",
      "Foreign government grants",
      "International relief efforts",
      "Global partnership funding"
    ],
    requiredFields: [
      { field: "recipientName", label: "Recipient Organization Name", type: "text" },
      { field: "country", label: "Country", type: "text" }
    ],
    warning: "International grants require additional Schedule F reporting"
  },
  {
    id: "compensation-officers",
    name: "Officer Compensation",
    form990Reference: "Part IX, Line 5",
    type: "expense",
    part: "Part IX",
    line: "Line 5",
    description: "Compensation of current officers, directors, trustees, and key employees",
    examples: [
      "Executive Director salary",
      "Board member compensation",
      "Officer bonuses",
      "Key employee salaries",
      "Trustee fees"
    ],
    requiredFields: [
      { field: "employeeName", label: "Officer Name", type: "text" },
      { field: "title", label: "Title/Position", type: "text" }
    ],
    warning: "This compensation will appear in Part VII - Officer Compensation section"
  },
  {
    id: "compensation-employees",
    name: "Employee Compensation",
    form990Reference: "Part IX, Line 6-7",
    type: "expense",
    part: "Part IX",
    line: "Line 6-7",
    description: "Salaries, wages, and other compensation to employees",
    examples: [
      "Staff salaries",
      "Hourly wages",
      "Employee bonuses",
      "Payroll expenses",
      "Benefits and allowances"
    ],
    subcategories: ["Salaries", "Wages", "Bonuses", "Benefits"],
    requiredFields: [
      { field: "employeeName", label: "Employee Name", type: "text" },
      { field: "title", label: "Title/Position", type: "text" }
    ]
  },
  {
    id: "professional-fees",
    name: "Professional Fees",
    form990Reference: "Part IX, Line 11",
    type: "expense",
    part: "Part IX",
    line: "Line 11",
    description: "Fees for professional services including legal, accounting, and consulting",
    examples: [
      "Legal fees",
      "Accounting services",
      "Consulting fees",
      "Audit costs",
      "Professional advisors"
    ],
    subcategories: ["Legal", "Accounting", "Consulting", "IT Services", "Other"]
  },
  {
    id: "occupancy",
    name: "Occupancy",
    form990Reference: "Part IX, Line 16",
    type: "expense",
    part: "Part IX",
    line: "Line 16",
    description: "Rent, utilities, maintenance, and other occupancy costs",
    examples: [
      "Office rent",
      "Utilities (electric, water, gas)",
      "Building maintenance",
      "Property insurance",
      "Janitorial services"
    ],
    subcategories: ["Rent", "Utilities", "Maintenance", "Insurance", "Other"]
  },
  {
    id: "depreciation",
    name: "Depreciation & Amortization",
    form990Reference: "Part IX, Line 22",
    type: "expense",
    part: "Part IX",
    line: "Line 22",
    description: "Depreciation and amortization expenses",
    examples: [
      "Equipment depreciation",
      "Building depreciation",
      "Vehicle depreciation",
      "Intangible asset amortization",
      "Software amortization"
    ],
    subcategories: ["Equipment", "Buildings", "Vehicles", "Intangibles"]
  },
  {
    id: "other-expenses",
    name: "Other Expenses",
    form990Reference: "Part IX, Line 24",
    type: "expense",
    part: "Part IX",
    line: "Line 24",
    description: "Other expenses not classified in major categories",
    examples: [
      "Office supplies",
      "Travel expenses",
      "Meeting costs",
      "Printing and publications",
      "Miscellaneous expenses"
    ],
    subcategories: ["Office Supplies", "Travel", "Meetings", "Printing", "Other"]
  }
];

export function getCategoryById(id: string): Category | undefined {
  return FORM_990_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoriesByType(type: "revenue" | "expense"): Category[] {
  return FORM_990_CATEGORIES.filter(cat => cat.type === type);
}

export function suggestCategory(description: string): { category: Category; confidence: number } | null {
  const descLower = description.toLowerCase();
  
  // Simple keyword matching for suggestions
  const keywords: { [key: string]: string[] } = {
    "contributions": ["donation", "gift", "grant", "contribution", "fundrais"],
    "program-service-revenue": ["service", "fee", "program", "contract", "membership"],
    "investment-income": ["dividend", "interest", "investment", "capital gain"],
    "grants-domestic": ["grant paid", "scholarship", "assistance"],
    "compensation-officers": ["executive", "director", "officer", "ceo", "president"],
    "compensation-employees": ["salary", "wage", "payroll", "employee"],
    "professional-fees": ["legal", "accounting", "consulting", "audit", "attorney"],
    "occupancy": ["rent", "utility", "utilities", "maintenance", "lease"],
    "other-expenses": ["supplies", "office", "equipment", "travel"]
  };

  for (const [categoryId, words] of Object.entries(keywords)) {
    for (const word of words) {
      if (descLower.includes(word)) {
        const category = getCategoryById(categoryId);
        if (category) {
          return { category, confidence: 85 };
        }
      }
    }
  }

  return null;
}
