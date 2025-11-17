export const STAFFING_API_URL = "https://staffing.whiteprompt.com";

export const EXPENSE_CONCEPTS = [
  { value: "administration-services", label: "Administration Services" },
  { value: "advertising", label: "Advertising" },
  { value: "air-ticket", label: "Air Ticket" },
  { value: "bank-fees", label: "Bank Fees" },
  { value: "bonus", label: "Bonus" },
  { value: "business-insurance", label: "Business Insurance" },
  { value: "cleaning", label: "Cleaning" },
  { value: "communication", label: "Communication" },
  { value: "company-representation", label: "Company representation" },
  { value: "covid-test", label: "Covid Test" },
  { value: "employee-benefits", label: "Employee Benefits" },
  { value: "exchange-rate-expense", label: "Exchange rate Expense" },
  { value: "expenses", label: "Expenses" },
  {
    value: "external-professional-services",
    label: "External professional services",
  },
  { value: "food-drinks", label: "Food & Drinks" },
  { value: "hackaton-bonus", label: "Hackaton Bonus" },
  { value: "health-insurance", label: "Health Insurance" },
  { value: "hotel", label: "Hotel" },
  { value: "incentfit", label: "IncentFit" },
  { value: "learning-courses", label: "Learning & Courses" },
  { value: "licenses", label: "Licenses" },
  { value: "md-expenses", label: "MD Expenses" },
  { value: "meals-entertainment", label: "Meals & Entertainment" },
  { value: "office-equipment", label: "Office Equipment" },
  {
    value: "office-equipment-repairs-maintenance",
    label: "Office Equipment repairs & maintenance",
  },
  { value: "office-maintenance", label: "Office Maintenance" },
  { value: "people-care", label: "People Care" },
  { value: "personal-insurance", label: "Personal Insurance" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "postage", label: "Postage" },
  { value: "professional-services", label: "Professional Services" },
  { value: "recruiting", label: "Recruiting" },
  { value: "rent-lease", label: "Rent or Lease" },
  { value: "sales-commisions", label: "Sales commisions" },
  { value: "security-vigilance", label: "Security and vigilance" },
  { value: "shipping-couriers", label: "Shipping & Couriers" },
  { value: "social-events", label: "Social Events" },
  { value: "stationery", label: "Stationery" },
  { value: "team-member-referral", label: "Team Member Referral" },
  { value: "transportation", label: "Transportation" },
  { value: "travel", label: "Travel" },
  { value: "uncategorized-adjustments", label: "Uncategorized Adjustments" },
];

export const CURRENCIES = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "ARS", label: "ARS - Argentine Peso" },
  { value: "BRL", label: "BRL - Brazilian Real" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
];

export interface ExpenseRefundForm {
  title: string;
  description: string;
  amount: string;
  currency: string;
  concept: string;
  submittedDate: string;
  receiptFile?: File;
  exchangeRate: string;
  teamMemberEmail: string;
}

export interface Allocation {
  project: {
    accountManager: string;
    clientName: string;
    id: string;
    projectName: string;
  };
  start: string;
  end?: string;
  active?: boolean;
}

export interface Contract {
  concept: string;
  dailyHours: number;
  amountType: string;
  amount: number;
  start: string;
  end?: string;
  active?: boolean;
  isActive?: boolean;
  type?: string;
  paidAnnualLeave?: number;
}

export interface AccessTool {
  toolName: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  countryAcronym: string;
  email: string;
  startDate: string;
  personalEmail: string;
  mobile: string;
  identificationType: string;
  identificationNumber: string;
  annualLeavesBalance?: number;
  contracts?: Contract[];
  allocations?: Allocation[];
  accesses?: string[];
  accessTools?: AccessTool[];
}

export interface ExtractedData {
  amount?: string;
  date?: string;
  description?: string;
  vendor?: string;
  tax?: string;
  currency?: string;
  exchangeRate?: string;
  concept?: string;
}
