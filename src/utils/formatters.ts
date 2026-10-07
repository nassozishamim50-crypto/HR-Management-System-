export function formatCurrency(amount: number | undefined, currency: 'UGX' | 'USD' = 'UGX'): string {
  if (amount === undefined || isNaN(amount)) return '—';
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return `UGX ${new Intl.NumberFormat('en-UG', { maximumFractionDigits: 0 }).format(amount)}`;
}

export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function getDaysUntil(dateString: string | undefined): number | null {
  if (!dateString) return null;
  try {
    const target = new Date(dateString).getTime();
    const today = new Date().setHours(0, 0, 0, 0);
    const diffMs = target - today;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch {
    return null;
  }
}

export type ExpirySeverity = 'expired' | 'critical7' | 'alert14' | 'warning30' | 'notice60' | 'plan90' | 'healthy';

export function getExpiryCategory(days: number | null): {
  severity: ExpirySeverity;
  label: string;
  badgeClass: string;
} {
  if (days === null) {
    return { severity: 'healthy', label: 'Indefinite', badgeClass: 'text-slate-500' };
  }
  if (days < 0) {
    return { severity: 'expired', label: `Expired ${Math.abs(days)}d ago`, badgeClass: 'text-red-700 font-semibold' };
  }
  if (days <= 7) {
    return { severity: 'critical7', label: `${days} days left (Critical)`, badgeClass: 'text-red-700 font-bold' };
  }
  if (days <= 14) {
    return { severity: 'alert14', label: `${days} days left (14d Alert)`, badgeClass: 'text-rose-600 font-semibold' };
  }
  if (days <= 30) {
    return { severity: 'warning30', label: `${days} days left (30d Alert)`, badgeClass: 'text-amber-700 font-medium' };
  }
  if (days <= 60) {
    return { severity: 'notice60', label: `${days} days left (60d Alert)`, badgeClass: 'text-amber-600' };
  }
  if (days <= 90) {
    return { severity: 'plan90', label: `${days} days left (90d Alert)`, badgeClass: 'text-blue-600' };
  }
  return { severity: 'healthy', label: `${days} days left`, badgeClass: 'text-slate-600' };
}

export function exportToCSV(filename: string, data: Record<string, any>[]) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '\\"');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
