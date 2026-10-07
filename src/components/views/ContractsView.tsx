import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContractRecord } from '../../types';
import {
  FileText,
  AlertTriangle,
  RefreshCw,
  Search,
  Download,
  Clock,
  CheckCircle2,
  Calendar,
  DollarSign,
  Lock,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntil, getExpiryCategory, exportToCSV } from '../../utils/formatters';

interface ContractsViewProps {
  onOpenRenewModal: (contractId: string) => void;
  onSelectEmployee: (empId: string) => void;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  onOpenRenewModal,
  onSelectEmployee,
}) => {
  const { contracts, permissions, currentOrg } = useApp();

  const [activeBucket, setActiveBucket] = useState<
    'all' | '7days' | '14days' | '30days' | '60days' | '90days'
  >('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Process contracts with days until expiry
  const enrichedContracts = useMemo(() => {
    return contracts.map((c) => {
      const days = getDaysUntil(c.endDate);
      const exp = getExpiryCategory(days);
      return {
        ...c,
        daysUntil: days,
        expiryLabel: exp.label,
        expirySeverity: exp.severity,
        expiryBadgeClass: exp.badgeClass,
      };
    });
  }, [contracts]);

  // Buckets calculation
  const critical7 = enrichedContracts.filter((c) => c.daysUntil !== null && c.daysUntil <= 7 && c.daysUntil >= 0);
  const urgent14 = enrichedContracts.filter((c) => c.daysUntil !== null && c.daysUntil <= 14 && c.daysUntil >= 0);
  const warning30 = enrichedContracts.filter((c) => c.daysUntil !== null && c.daysUntil <= 30 && c.daysUntil >= 0);
  const notice60 = enrichedContracts.filter((c) => c.daysUntil !== null && c.daysUntil <= 60 && c.daysUntil >= 0);
  const plan90 = enrichedContracts.filter((c) => c.daysUntil !== null && c.daysUntil <= 90 && c.daysUntil >= 0);

  // Filtered
  const filteredContracts = useMemo(() => {
    return enrichedContracts.filter((c) => {
      const matchesSearch =
        searchQuery === '' ||
        c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.project || c.entity).toLowerCase().includes(searchQuery.toLowerCase());

      if (activeBucket === '7days') return matchesSearch && c.daysUntil !== null && c.daysUntil <= 7 && c.daysUntil >= 0;
      if (activeBucket === '14days') return matchesSearch && c.daysUntil !== null && c.daysUntil <= 14 && c.daysUntil >= 0;
      if (activeBucket === '30days') return matchesSearch && c.daysUntil !== null && c.daysUntil <= 30 && c.daysUntil >= 0;
      if (activeBucket === '60days') return matchesSearch && c.daysUntil !== null && c.daysUntil <= 60 && c.daysUntil >= 0;
      if (activeBucket === '90days') return matchesSearch && c.daysUntil !== null && c.daysUntil <= 90 && c.daysUntil >= 0;

      return matchesSearch;
    });
  }, [enrichedContracts, activeBucket, searchQuery]);

  const handleExportCSV = () => {
    const rows = filteredContracts.map((c) => ({
      'Contract Ref': c.contractNumber,
      'Staff Name': c.employeeName,
      'Job Title': c.jobTitle,
      'Contract Type': c.contractType,
      'Start Date': c.startDate,
      'End Date': c.endDate,
      'Days Until Expiry': c.daysUntil,
      'Notice Period': `${c.noticePeriodDays} days`,
      'Funding Project': c.project || c.entity,
      'Donor Fund': c.fundingSource || 'Special Children Trust',
      'Renewal Status': c.renewalStatus,
      'Monthly Salary': permissions.canViewSalaries ? c.salary : 'Confidential',
    }));
    exportToCSV(`${currentOrg.acronym}_Contracts_Report`, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Expiry Radar Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-700" />
              <span>Contract Lifecycle & Expiry Alerts Radar</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated 90d, 60d, 30d, 14d and 7d notifications for timely renewals & donor continuity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Contracts</span>
            </button>
          </div>
        </div>

        {/* Expiration Radar Interactive Filter Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setActiveBucket('all')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === 'all'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold opacity-80">All Active</div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{contracts.length}</div>
          </button>

          <button
            onClick={() => setActiveBucket('7days')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === '7days'
                ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                : 'bg-rose-50/50 text-rose-800 border-rose-200 hover:bg-rose-100/60'
            }`}
          >
            <div className="text-[10px] uppercase font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>&le; 7 Days</span>
            </div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{critical7.length}</div>
          </button>

          <button
            onClick={() => setActiveBucket('14days')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === '14days'
                ? 'bg-rose-600 text-white border-rose-600 font-semibold'
                : 'bg-rose-50/30 text-rose-700 border-rose-200 hover:bg-rose-100/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">14-Day Alert</div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{urgent14.length}</div>
          </button>

          <button
            onClick={() => setActiveBucket('30days')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === '30days'
                ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                : 'bg-amber-50/50 text-amber-800 border-amber-200 hover:bg-amber-100/60'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">30-Day Warning</div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{warning30.length}</div>
          </button>

          <button
            onClick={() => setActiveBucket('60days')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === '60days'
                ? 'bg-amber-500 text-white border-amber-500 font-semibold'
                : 'bg-amber-50/30 text-amber-700 border-amber-200 hover:bg-amber-100/50'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">60-Day Notice</div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{notice60.length}</div>
          </button>

          <button
            onClick={() => setActiveBucket('90days')}
            className={`p-2.5 rounded-lg border text-left transition-colors ${
              activeBucket === '90days'
                ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                : 'bg-blue-50/50 text-blue-800 border-blue-200 hover:bg-blue-100/60'
            }`}
          >
            <div className="text-[10px] uppercase font-bold">90-Day Plan</div>
            <div className="text-base font-extrabold mt-0.5 tabular-nums">{plan90.length}</div>
          </button>
        </div>

        {/* Live Search */}
        <div className="relative pt-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search contracts by employee name, contract reference, project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Contract Ref</th>
                <th className="px-4 py-3">Employee & Role</th>
                <th className="px-4 py-3">Contract Type</th>
                <th className="px-4 py-3">Funding Project</th>
                <th className="px-4 py-3">Contract Validity</th>
                <th className="px-4 py-3">Remuneration</th>
                <th className="px-4 py-3">Renewal Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900 text-xs">
                    {c.contractNumber}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectEmployee(c.employeeId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {c.employeeName}
                    </button>
                    <span className="text-[11px] text-slate-500">{c.jobTitle}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    <span className="font-medium">{c.contractType}</span>
                    <span className="block text-[10px] text-slate-400">Notice: {c.noticePeriodDays}d</span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 max-w-[200px] truncate">{c.project || c.entity}</div>
                    <div className="text-[11px] text-slate-500">Fund: {c.fundingSource || 'Core Trust'}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 tabular-nums">
                      {formatDate(c.startDate)} – {formatDate(c.endDate)}
                    </div>
                    <div className={`text-[11px] font-medium mt-0.5 ${c.expiryBadgeClass}`}>
                      {c.expiryLabel}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    {permissions.canViewSalaries ? (
                      <span className="font-bold text-slate-900 tabular-nums">
                        {formatCurrency(c.salary, c.currency)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px] flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Confidential</span>
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        c.renewalStatus === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : c.renewalStatus === 'Pending Renewal'
                          ? 'bg-rose-50 text-rose-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {c.renewalStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    {permissions.canManageContracts ? (
                      <button
                        onClick={() => onOpenRenewModal(c.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors inline-flex items-center gap-1 shadow-xs"
                      >
                        <RefreshCw className="w-3 h-3 text-emerald-700" />
                        <span>Renew / Extend</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">View Only</span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No contracts found in this alert filter category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
