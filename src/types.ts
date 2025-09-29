export interface Allocation {
  project: string;
  start: string;
  end?: string;
}

export interface Contract {
  concept: string;
  dailyHours: number;
  amountType: string;
  amount: number;
  start: string;
  end?: string;
  active?: boolean;
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
  contracts?: Contract[];
  allocations?: Allocation[];
  accesses?: string[];
  accessTools?: AccessTool[];
}
