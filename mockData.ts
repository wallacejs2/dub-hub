
import { Ticket, TicketType, Status, Priority, ProductArea, Platform, Dealership, DealershipStatus, ReynoldsSolution, FullpathSolution, DMTProduct, CRMProvider, Resource, ResourceCategory, ResourceScope, Task, TaskStatus } from './types';
import { getTodayDateString } from './utils';

export const mockClients = [
  "Acme Corp",
  "Global Motors",
  "Reynolds Dealership",
  "Fullpath Auto",
  "Prestige Worldwide",
  "TechDrive Inc."
];

// --- DMT Catalog ---
export const DMT_PRODUCTS: DMTProduct[] = [
  // New Category
  { id: 'p1', code: '15391', name: 'Curator SE', defaultPrice: 8275, category: 'New' },
  { id: 'p2', code: '15392', name: 'Managed', defaultPrice: 1750, category: 'New' },
  { id: 'p3', code: '15435', name: 'Addl. Web', defaultPrice: 799, category: 'New' },
  { id: 'p4', code: '15436', name: 'Manag. Addl. Web', defaultPrice: 799, category: 'New' },
  // Old Category
  { id: 'p5', code: '15381', name: 'AA', defaultPrice: 4995, category: 'Old' },
  { id: 'p6', code: '15382', name: 'SE', defaultPrice: 8275, category: 'Old' },
  { id: 'p7', code: '15390', name: 'SMS', defaultPrice: 795, category: 'Old' },
];

// --- Tickets ---

export const createEmptyTicket = (): Ticket => ({
  id: `T-${Math.floor(1000 + Math.random() * 9000)}`,
  type: TicketType.Question,
  title: '',
  startDate: getTodayDateString(),
  lastUpdatedDate: getTodayDateString(),
  submissionDate: getTodayDateString(),
  productArea: ProductArea.Fullpath,
  platform: Platform.FOCUS,
  location: '',
  priority: Priority.P3,
  status: Status.NewWaiting,
  reason: '',
  submitterName: '',
  client: mockClients[0],
  summary: '',
  details: '',
  updates: [],
  isFavorite: false,
});

export const generateMockTickets = (): Ticket[] => {
  return [
    {
      id: 'T-1001',
      type: TicketType.FeatureRequest,
      title: 'Add Dark Mode to Dashboard',
      startDate: '05/01/2024',
      lastUpdatedDate: '05/10/2024',
      submissionDate: '04/28/2024',
      productArea: ProductArea.Fullpath,
      platform: Platform.FOCUS,
      location: 'Settings Page',
      priority: Priority.P2,
      status: Status.Coding,
      reason: 'High user demand',
      submitterName: 'John Doe',
      client: 'Acme Corp',
      summary: 'Implement a system-wide dark mode toggle.',
      details: 'Users want a dark mode toggle in the header. This involves updating CSS variables and persisting state in local storage.',
      updates: [
        { id: 'u1', author: 'Jane Smith', date: '05/02/2024', comment: 'Started working on CSS variables.' }
      ],
      isFavorite: true,
    },
    {
      id: 'T-1002',
      type: TicketType.Issue,
      title: 'Login Timeout Incorrect',
      lastUpdatedDate: '05/11/2024',
      submissionDate: '05/09/2024',
      productArea: ProductArea.Reynolds,
      platform: Platform.UCP,
      location: 'Auth Service',
      priority: Priority.P1,
      status: Status.QATesting,
      reason: 'Security vulnerability',
      submitterName: 'Security Team',
      client: 'Reynolds Dealership',
      fpTicketNumber: 5042,
      summary: 'Session timeouts are not respecting config.',
      details: 'Session expires after 5 minutes instead of 30. This is causing issues for users filling out long forms.',
      updates: [],
      isFavorite: false,
    },
    {
      id: 'T-1003',
      type: TicketType.Question,
      title: 'API Rate Limits',
      lastUpdatedDate: '05/05/2024',
      submissionDate: '05/01/2024',
      productArea: ProductArea.Fullpath,
      platform: Platform.Curator,
      location: 'API Docs',
      priority: Priority.P3,
      status: Status.OnHold,
      reason: 'Waiting for vendor response',
      submitterName: 'Alice Johnson',
      client: 'TechDrive Inc.',
      summary: 'Clarification needed on reporting endpoint limits.',
      details: 'What is the current rate limit for the reporting endpoint? The documentation says 100 req/min but we are seeing 429s at 50 req/min.',
      updates: [],
      isFavorite: true,
    },
    {
      id: 'T-1004',
      type: TicketType.Issue,
      title: 'Export Button Broken',
      lastUpdatedDate: '04/20/2024',
      submissionDate: '04/15/2024',
      productArea: ProductArea.Reynolds,
      platform: Platform.FOCUS,
      location: 'Reports > Sales',
      priority: Priority.P2,
      status: Status.Completed,
      reason: 'Bug fix',
      submitterName: 'Bob Williams',
      client: 'Global Motors',
      summary: 'CSV Export fails with 500 error.',
      details: 'Clicking CSV export throws a 500 error. Logs indicate a null pointer exception in the CSV generator service.',
      updates: [
        { id: 'u2', author: 'Dev Team', date: '04/18/2024', comment: 'Fixed typo in backend handler.' }
      ],
      isFavorite: false,
    },
    {
      id: 'T-1005',
      type: TicketType.FeatureRequest,
      title: 'New Analytics Widget',
      startDate: '06/01/2024',
      lastUpdatedDate: '05/12/2024',
      submissionDate: '05/10/2024',
      productArea: ProductArea.Fullpath,
      platform: Platform.FOCUS,
      location: 'Dashboard',
      priority: Priority.P3,
      status: Status.PendingToDo,
      submitterName: 'Product Team',
      client: 'Prestige Worldwide',
      summary: 'Dashboard widget for MRR visualization.',
      details: 'Add a widget showing monthly recurring revenue. It should allow filtering by date range and export to PDF.',
      updates: [],
      isFavorite: false,
    },
    {
      id: 'T-1006',
      type: TicketType.Issue,
      title: 'Mobile View alignment',
      lastUpdatedDate: '05/12/2024',
      submissionDate: '05/11/2024',
      productArea: ProductArea.Fullpath,
      platform: Platform.Curator,
      location: 'Landing Page',
      priority: Priority.P4,
      status: Status.PMReview,
      submitterName: 'QA Team',
      client: 'TechDrive Inc.',
      summary: 'Logo misalignment on small screens.',
      details: 'Logo is slightly off-center on iPhone SE. Needs to be vertically centered in the navbar.',
      updates: [],
      isFavorite: false,
    },
    {
      id: 'T-1007',
      type: TicketType.Issue,
      title: 'Cancel Request',
      lastUpdatedDate: '05/14/2024',
      submissionDate: '05/11/2024',
      productArea: ProductArea.Fullpath,
      platform: Platform.Curator,
      location: 'Backend',
      priority: Priority.P4,
      status: Status.Cancelled,
      submitterName: 'Support',
      client: 'TechDrive Inc.',
      summary: 'Duplicate request.',
      details: 'This was a duplicate of T-1006.',
      updates: [],
      isFavorite: false,
    },
  ];
};

// --- Dealerships ---

export const createEmptyDealership = (): Dealership => ({
  id: `D-${Math.floor(10000 + Math.random() * 90000)}`,
  accountNumber: 0,
  accountName: '',
  status: DealershipStatus.DMTPending,
  goLiveDate: '',
  termDate: '',
  enterpriseGroup: '',
  storeNumber: '',
  branchNumber: '',
  address: '',
  crmProvider: CRMProvider.FOCUS,
  websiteLinks: [{ id: Date.now().toString(), url: '', clientId: '' }],
  equityProvider: 'Fullpath Kelly Blue Book',
  reynoldsSolutions: [],
  fullpathSolutions: [],
  dmtOrders: [],
  assignedSpecialist: '',
  salesPerson: '',
  pocName: '',
  pocEmail: '',
  pocPhone: '',
  lastUpdated: getTodayDateString()
});

export const generateMockDealerships = (): Dealership[] => {
  return [
    {
      id: 'D-98213',
      accountNumber: 10245,
      accountName: 'North Georgia Toyota',
      status: DealershipStatus.Live,
      goLiveDate: '01/15/2024',
      termDate: '01/15/2026',
      enterpriseGroup: 'Georgia Auto Group',
      storeNumber: '120',
      branchNumber: '01',
      eraSystemId: 4492,
      ppSysId: 8821,
      buId: 101,
      crmProvider: CRMProvider.VinSolutions,
      address: '123 Peachtree Ln, Atlanta, GA 30301',
      websiteLinks: [
        { id: 'l1', url: 'https://www.northgatoyota.com', clientId: 'NGT-001' }
      ],
      equityProvider: 'Fullpath Kelly Blue Book',
      reynoldsSolutions: [ReynoldsSolution.XTS, ReynoldsSolution.MMS],
      fullpathSolutions: [FullpathSolution.DigAds, FullpathSolution.VIN],
      dmtOrders: [
          { id: 'o1', receivedDate: '01/01/2024', orderNumber: 5521, productId: 'p1', price: 8275, isActive: true },
          { id: 'o2', receivedDate: '01/01/2024', orderNumber: 5521, productId: 'p2', price: 1750, isActive: true }
      ],
      assignedSpecialist: 'Sarah Connor',
      salesPerson: 'Kyle Reese',
      pocName: 'Bill Lumbergh',
      pocEmail: 'bill@ngtoyota.com',
      pocPhone: '(404) 555-0199',
      lastUpdated: '05/15/2024'
    },
    {
      id: 'D-55123',
      accountNumber: 55102,
      accountName: 'Miami Lakes Automall',
      status: DealershipStatus.Onboarding,
      goLiveDate: '06/01/2024',
      termDate: '',
      enterpriseGroup: 'Miami Motors',
      storeNumber: '300',
      branchNumber: '05',
      eraSystemId: 9921,
      crmProvider: CRMProvider.FOCUS,
      address: '500 Ocean Dr, Miami, FL 33101',
      websiteLinks: [],
      equityProvider: 'Kelly Blue Book',
      reynoldsSolutions: [ReynoldsSolution.ADVSVC],
      fullpathSolutions: [FullpathSolution.WEBEngage],
      dmtOrders: [],
      assignedSpecialist: 'Tony Stark',
      salesPerson: 'Pepper Potts',
      pocName: 'Happy Hogan',
      pocEmail: 'happy@miamilakes.com',
      pocPhone: '(305) 555-0122',
      lastUpdated: '05/10/2024'
    }
  ]
}

// --- Resources ---

export const createEmptyResource = (): Resource => ({
  id: `R-${Math.floor(1000 + Math.random() * 9000)}`,
  title: '',
  date: getTodayDateString(),
  version: 'v1.0',
  category: ResourceCategory.PDF,
  scope: ResourceScope.Internal,
  topics: '',
  description: '',
  linkUrl: '',
  navigationPath: '',
  lastUpdated: getTodayDateString()
});

export const generateMockResources = (): Resource[] => {
  return [
    {
      id: 'R-101',
      title: 'Integration Guide - Fullpath',
      date: '01/10/2024',
      version: 'v2.1',
      category: ResourceCategory.PDF,
      scope: ResourceScope.External,
      topics: 'Integration, API, Setup',
      description: 'Complete guide for integrating Fullpath services with the Dealer Management System.',
      linkUrl: 'https://example.com/guide.pdf',
      navigationPath: 'Docs > Integrations',
      lastUpdated: '02/15/2024'
    },
    {
      id: 'R-102',
      title: 'Q1 2024 Sales Deck',
      date: '03/01/2024',
      version: 'v1.0',
      category: ResourceCategory.PPT,
      scope: ResourceScope.Internal,
      topics: 'Sales, Marketing, Quarterly Review',
      description: 'Presentation deck for the Q1 sales review meeting.',
      linkUrl: 'https://example.com/deck.ppt',
      navigationPath: 'Sales > Decks',
      lastUpdated: '03/01/2024'
    },
    {
      id: 'R-103',
      title: 'Inventory Schema Specification',
      date: '12/05/2023',
      version: 'v3.0',
      category: ResourceCategory.XML,
      scope: ResourceScope.External,
      topics: 'Schema, Data, Inventory',
      description: 'Technical specification for the XML inventory data feed.',
      linkUrl: 'https://example.com/schema.xml',
      navigationPath: 'Tech > Specs',
      lastUpdated: '12/05/2023'
    }
  ];
};

// --- Tasks ---

export const createEmptyTask = (): Task => ({
  id: `TASK-${Date.now()}`,
  title: '',
  description: '',
  status: TaskStatus.ToDo,
  priority: Priority.P3,
  dueDate: '',
  assignee: 'Me',
  createdDate: getTodayDateString(),
  lastUpdatedDate: getTodayDateString()
});

export const generateMockTasks = (): Task[] => {
  return [
    {
      id: 'TASK-001',
      title: 'Review Q3 Sales Data',
      description: 'Analyze the Q3 spreadsheet and prepare a summary slide.',
      status: TaskStatus.ToDo,
      priority: Priority.P2,
      dueDate: '06/15/2024',
      assignee: 'Me',
      createdDate: '06/01/2024',
      lastUpdatedDate: '06/01/2024'
    },
    {
      id: 'TASK-002',
      title: 'Update API Documentation',
      description: 'Add new endpoints for the v2 release.',
      status: TaskStatus.InProgress,
      priority: Priority.P1,
      dueDate: '06/10/2024',
      assignee: 'Me',
      createdDate: '05/28/2024',
      lastUpdatedDate: '06/02/2024'
    },
    {
      id: 'TASK-003',
      title: 'Client Onboarding Call',
      description: 'Kickoff call with North Georgia Toyota.',
      status: TaskStatus.Completed,
      priority: Priority.P3,
      dueDate: '05/30/2024',
      assignee: 'Jane Doe',
      createdDate: '05/20/2024',
      lastUpdatedDate: '05/30/2024'
    }
  ];
};
