
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
