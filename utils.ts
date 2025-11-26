
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

export const getDaysActive = (startDate?: string) => {
  if (!startDate) return 0;
  const parts = startDate.split('/');
  if (parts.length !== 3) return 0;
  
  const [mm, dd, yyyy] = parts.map(Number);
  const start = new Date(yyyy, mm - 1, dd);
  const today = new Date();
  
  // Reset time to ensure only date difference is calculated
  start.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // If start date is in the future, return 0
  return diffDays < 0 ? 0 : diffDays;
};

// CSV Export Helper
import { Ticket } from './types';

export const exportTicketsToCSV = (tickets: Ticket[]) => {
  // Define Headers
  const headers = [
    'ID',
    'Name',
    'Type',
    'Status',
    'Priority',
    'Product Area',
    'Platform',
    'Location',
    'Submitter',
    'Client',
    'Start Date',
    'Last Updated',
    'PMR #',
    'PMG #',
    'CPM #',
    'FP Ticket Number',
    'Ticket Thread ID',
    'Summary',
    'Details'
  ];

  // Map Data
  const rows = tickets.map(t => [
    t.id,
    t.title,
    t.type,
    t.status,
    t.priority,
    t.productArea,
    t.platform,
    t.location,
    t.submitterName,
    t.client,
    t.startDate || '',
    t.lastUpdatedDate,
    t.pmrNumber || '',
    t.pmgNumber || '',
    t.cpmNumber || '',
    t.fpTicketNumber || '',
    t.ticketThreadId || '',
    t.summary || '',
    t.details || ''
  ]);

  // Helper to escape fields containing commas/quotes
  const escapeCsvField = (field: any) => {
    if (field === null || field === undefined) return '';
    const stringValue = String(field);
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

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
