import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function formatDate(d: string) {
  try { return format(parseISO(d), 'dd MMM yyyy'); } catch { return d; }
}
export function formatTime(t: string) {
  try {
    const [h, m] = t.split(':');
    const hr = parseInt(h); const ampm = hr >= 12 ? 'PM' : 'AM';
    return `${hr % 12 || 12}:${m} ${ampm}`;
  } catch { return t; }
}
export function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
}
export function statusColor(s: string) {
  if (s === 'Completed') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if (s === 'Upcoming') return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
  if (s === 'In Progress') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
  if (s === 'Cancelled') return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
}
export function payColor(s: string) {
  if (s === 'Paid') return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
  if (s === 'Partial Paid') return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
}
export function waLink(phone: string, msg: string) {
  const n = phone.replace(/\D/g, '');
  return `https://wa.me/${n.startsWith('91') ? n : '91' + n}?text=${encodeURIComponent(msg)}`;
}
export function exportCSV(rows: (string | number)[][], filename: string) {
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
}
