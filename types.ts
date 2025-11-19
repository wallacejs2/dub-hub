
// --- Enums ---
export enum TicketType { FeatureRequest = 'Feature Request', Issue = 'Issue', Question = 'Question' }
export enum Status { NotStarted = 'Not Started', InProgress = 'In Progress', PMReview = 'PM Review', DevReview = 'DEV Review', OnHold = 'On Hold', Testing = 'Testing', Completed = 'Completed' }
export enum Priority { P1 = 'P1', P2 = 'P2', P3 = 'P3', P4 = 'P4' }
export enum ProductArea { Reynolds = 'Reynolds', Fullpath = 'Fullpath' }
export enum Platform { FOCUS = 'FOCUS', UCP = 'UCP', Curator = 'Curator' }

// --- Shared Types ---
export interface Update {
  id: string;
  author: string;
  date: string; // Format MM/DD/YYYY
  comment: string;
}

// --- Ticket Entity ---
export interface Ticket {
  id: string;
  type: TicketType;
  title: string; // Ticket Name
  
  // Dates
  startDate?: string; // MM/DD/YYYY
  lastUpdatedDate: string; // MM/DD/YYYY - Auto-updates on ANY change
  submissionDate: string; // MM/DD/YYYY

  // Classification
  productArea: ProductArea;
  platform: Platform;
  location: string; // Text input
  priority: Priority;
  status: Status;
  
  // Context
  reason?: string; // Text input (Visible for ALL statuses)
  submitterName: string;
  client: string; // Selected via Dropdown (from a mock list of client names)
  
  // External References
  fpTicketNumber?: number;
  ticketThreadId?: string; // Text
  pmrNumber?: number;
  pmrLink?: string; // URL
  pmgNumber?: number;
  pmgLink?: string; // URL
  cpmNumber?: number;
  cpmLink?: string; // URL

  // Content
  summary: string; // Short summary
  details: string; // Text area (unified field for Issue/Feature/Question details)
  
  // Activity
  updates: Update[]; // Editable: Name, Date, Comment
  isFavorite?: boolean;
}

export type TicketFilterState = {
  search: string;
  status: Status | 'All';
  priority: Priority | 'All';
  type: TicketType | 'All';
  productArea: ProductArea | 'All';
}

// --- Dealership Types ---

export enum DealershipStatus {
  DMTPending = 'DMT-Pending',
  DMTApproved = 'DMT-Approved',
  Onboarding = 'Onboarding',
  Live = 'Live',
  Cancelled = 'Cancelled'
}

export enum CRMProvider {
  FOCUS = 'FOCUS',
  CDK = 'CDK',
  DealerOwned = 'DealerOwned',
  DealerSocket = 'DealerSocket',
  DriveCentric = 'DriveCentric',
  Elead = 'Elead',
  Momentum = 'Momentum',
  OpLogic = 'OpLogic',
  Tekion = 'Tekion',
  VinSolutions = 'VinSolutions'
}

export enum ReynoldsSolution {
  XTS = 'XTS',
  MMS = 'MMS',
  TRU = 'TRU',
  ADVSVC = 'ADVSVC'
}

export enum FullpathSolution {
  DigAds = 'DigAds',
  VIN = 'VIN',
  WEBEngage = 'WEB Engage',
  DYN = 'DYN'
}

export interface WebsiteLink {
  id: string;
  url: string;
  clientId: string;
}

// DMT Order Types
export interface DMTProduct {
  id: string;
  code: string;
  name: string;
  defaultPrice: number;
  category: 'New' | 'Old';
}

export interface DMTOrderItem {
  id: string;
  receivedDate: string;
  orderNumber: number;
  productId: string; // correlates to DMTProduct.id
  price: number;
  isActive: boolean;
}

export interface Dealership {
  id: string;
  // Core Info
  accountNumber: number; // CIF
  accountName: string;
  status: DealershipStatus;
  goLiveDate: string; // MM/DD/YYYY
  termDate: string; // MM/DD/YYYY

  // Account Details
  enterpriseGroup: string;
  storeNumber: string;
  branchNumber: string;
  eraSystemId?: number;
  ppSysId?: number;
  buId?: number;
  crmProvider: CRMProvider;
  address: string;

  // Links
  websiteLinks: WebsiteLink[];

  // Equity
  equityProvider: string; // Default "Fullpath Kelly Blue Book"

  // Solutions
  reynoldsSolutions: ReynoldsSolution[];
  fullpathSolutions: FullpathSolution[];

  // DMT Orders
  dmtOrders: DMTOrderItem[];

  // Contact
  assignedSpecialist: string;
  salesPerson: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  
  lastUpdated: string;
}