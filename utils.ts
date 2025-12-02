
import { Ticket, Dealership, DMTProduct } from './types';

export const getTodayDateString = (): string => {
  const today = new Date();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const yyyy = today.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
};

// Convert MM/DD/YYYY (stored) to YYYY-MM-DD (input type="date")
export const toInputDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length !== 3) return '';
  return `${parts[2]}-${parts[0]}-${parts[1]}`;
};

// Convert YYYY-MM-DD (input type="date") to MM/DD/YYYY (stored)
export const fromInputDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  return `${parts[1]}/${parts[2]}/${parts[0]}`;
};

export const getDaysActive = (startDate?: string, endDate?: string) => {
  if (!startDate) return 0;
  const parts = startDate.split('/');
  if (parts.length !== 3) return 0;
  
  const [mm, dd, yyyy] = parts.map(Number);
  const start = new Date(yyyy, mm - 1, dd);
  
  let end = new Date();
  if (endDate) {
      const endParts = endDate.split('/');
      if (endParts.length === 3) {
          const [emm, edd, eyyyy] = endParts.map(Number);
          end = new Date(eyyyy, emm - 1, edd);
      }
  }
  
  // Reset time to ensure only date difference is calculated
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If start date is in the future relative to end, return 0
  return diffDays < 0 ? 0 : diffDays;
};

// CSV Export Helper

export const exportTicketsToCSV = (tickets: Ticket[]) => {
  // Define Headers
  const headers = [
    'startDate',
    'updatedDate',
    'closed',
    'priority',
    'productArea',
    'platform',
    'location',
    'name',
    'status',
    'reason',
    'release',
    'submitter',
    'client',
    'pmr',
    'fpTicket',
    'threadID',
    'summary',
    'activity'
  ];

  // Helper to escape fields containing commas/quotes
  const escapeCsvField = (field: any) => {
    if (field === null || field === undefined) return '';
    const stringValue = String(field);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Map Data
  const rows = tickets.map(t => {
      let recentActivity = '';
      if (t.updates && t.updates.length > 0) {
          const latest = t.updates[0];
          recentActivity = `${latest.date}: [${latest.author}] ${latest.comment}`;
      }

      return [
        t.startDate || '',
        t.lastUpdatedDate,
        t.closedDate || '',
        t.priority,
        t.productArea,
        t.platform,
        t.location,
        t.title,
        t.status,
        t.reason || '',
        t.release || '',
        t.submitterName,
        t.client,
        t.pmrNumber || '',
        t.fpTicketNumber || '',
        t.ticketThreadId || '',
        t.summary || '',
        recentActivity
      ];
  });

  // Construct CSV String
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvField).join(','))
  ].join('\n');

  // Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `tickets_export_${getTodayDateString().replace(/\//g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportDealershipsToCSV = (dealerships: Dealership[], products: DMTProduct[]) => {
  // specific product columns requested
  const productCols = [
      { header: '15381-AA', code: '15381' },
      { header: '15382-SE', code: '15382' },
      { header: '15390-SMS', code: '15390' },
      { header: '15391-SE', code: '15391' },
      { header: '15392-MNG', code: '15392' },
      { header: '15435-AWeb', code: '15435' },
      { header: '15436-MGADWEB', code: '15436' },
  ];

  // Define Headers in exact order requested
  const headers = [
    'status',
    'accountNumber',
    'name',
    'enterprise',
    'storeNumber',
    'branchNumber',
    'address',
    'orderReceivedDate',
    'orderNumber',
    ...productCols.map(p => p.header),
    'goLiveDate',
    'termDate',
    'eraSystemId',
    'ppSysId',
    'buId',
    'assignedSpecialist',
    'sales',
    'pocName',
    'pocEmail',
    'pocPhone',
    'clientID1',
    'websiteLink1',
    'clientID2',
    'websiteLink2'
  ];

  // Helper to escape fields containing commas/quotes
  const escapeCsvField = (field: any) => {
    if (field === null || field === undefined) return '';
    const stringValue = String(field);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // Map Data
  const rows = dealerships.map(d => {
    // 1. Resolve Orders
    // Join all unique received dates and order numbers found on this dealership
    const activeOrders = d.dmtOrders; // Export all orders associated
    const uniqueDates = Array.from(new Set(activeOrders.map(o => o.receivedDate).filter(Boolean)));
    const uniqueOrderNums = Array.from(new Set(activeOrders.map(o => o.orderNumber).filter(n => n > 0)));

    const orderReceivedDate = uniqueDates.join('; ');
    const orderNumber = uniqueOrderNums.join('; ');

    // 2. Resolve Product Columns
    const productValues = productCols.map(col => {
        // Find product definition to get ID
        const productDef = products.find(p => p.code === col.code);
        if (!productDef) return '';
        
        // Check if dealership has an order for this product ID
        // We'll return the price if found, or empty string
        const matchingOrder = d.dmtOrders.find(o => o.productId === productDef.id && o.isActive);
        return matchingOrder ? matchingOrder.price : '';
    });

    // 3. Resolve Links (First 2)
    const link1 = d.websiteLinks[0];
    const link2 = d.websiteLinks[1];

    return [
        d.status,
        d.accountNumber, // CIF
        d.accountName,
        d.enterpriseGroup,
        d.storeNumber,
        d.branchNumber,
        d.address,
        orderReceivedDate,
        orderNumber,
        ...productValues,
        d.goLiveDate,
        d.termDate,
        d.eraSystemId || '',
        d.ppSysId || '',
        d.buId || '',
        d.assignedSpecialist,
        d.salesPerson,
        d.pocName,
        d.pocEmail,
        d.pocPhone,
        link1 ? link1.clientId : '',
        link1 ? link1.url : '',
        link2 ? link2.clientId : '',
        link2 ? link2.url : ''
    ];
  });

  // Construct CSV String
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCsvField).join(','))
  ].join('\n');

  // Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `dealerships_export_${getTodayDateString().replace(/\//g, '-')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
