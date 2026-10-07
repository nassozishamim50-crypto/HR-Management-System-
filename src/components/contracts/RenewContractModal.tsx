import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ContractRecord } from '../../types';
import { X, RefreshCw, Check } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface RenewContractModalProps {
  contract: ContractRecord | null;
  onClose: () => void;
}

export const RenewContractModal: React.FC<RenewContractModalProps> = ({
  contract,
  onClose,
}) => {
  const { currentOrg, renewContract } = useApp();

  const [newEndDate, setNewEndDate] = useState(
    contract ? new Date(new Date(contract.endDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : ''
  );
  const [newSalary, setNewSalary] = useState(contract?.salary || 4000000);
  const [renewalStatus, setRenewalStatus] = useState<'Renewed' | 'Under Review' | 'Active'>('Renewed');

  if (!contract) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    renewContract(contract.id, newEndDate, Number(newSalary), renewalStatus);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Renew / Extend Contract
              </h3>
              <p className="text-xs text-slate-500">
                {contract.employeeName} · {contract.contractNumber}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Contract End:</span>
              <span className="font-semibold text-slate-900">{formatDate(contract.endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Current Salary / Fee:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {formatCurrency(contract.salary, contract.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Funding Project:</span>
              <span className="text-slate-800">{contract.project}</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              New Contract Expiry Date *
            </label>
            <input
              type="date"
              required
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Revised Monthly Salary / Honorarium ({contract.currency}) *
            </label>
            <input
              type="number"
              required
              value={newSalary}
              onChange={(e) => setNewSalary(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600 tabular-nums"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Renewal Decision Status
            </label>
            <select
              value={renewalStatus}
              onChange={(e) => setRenewalStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="Renewed">Renewed & Endorsed</option>
              <option value="Under Review">Under Review (Donor Budget Verification)</option>
              <option value="Active">Active</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sct-primary px-5 py-2 text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Contract Extension</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
