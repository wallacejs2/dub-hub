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