import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingRecord, TrainingCategory } from '../../types';
import {
  GraduationCap,
  Plus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Award,
  Search,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface TrainingViewProps {
  onOpenAddTraining: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  onOpenAddTraining,
  onSelectEmployee,
}) => {
  const { trainings, permissions, currentOrg } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: TrainingCategory[] = [
    'Safeguarding',
    'Child Protection',
    'Gender & Inclusion',
    'PSEA',
    'Code of Conduct',
    'Field Security & Hostile Environment',
    'First Aid',
    'Data Protection',
    'Project Management',
    'Monitoring & Evaluation',
    'Leadership',
  ];

  const filteredTrainings = trainings.filter((t) => {
    const cat = t.trainingCategory || t.category;
    const matchesCategory = selectedCategory === 'all' || cat === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.trainingTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.provider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const mandatoryTrainings = trainings.filter((t) => t.isMandatory);
  const overdueCount = mandatoryTrainings.filter((t) => t.status === 'Overdue').length;
  const expiringCount = mandatoryTrainings.filter((t) => t.status === 'Expiring Soon').length;
  const completedCount = mandatoryTrainings.filter((t) => t.status === 'Completed').length;
  const complianceRate =
    mandatoryTrainings.length > 0
      ? Math.round((completedCount / mandatoryTrainings.length) * 100)
      : 100;

  return (
    <div className="space-y-6">
      {/* Top Banner & Compliance Scorecard */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-500" />
              <span>Mandatory Training & PSEA Compliance Center</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Safeguarding, child protection, HEAT field security, and Uganda Data Protection compliance
            </p>
          </div>

          {permissions.canManageTrainings && (
            <button
              onClick={onOpenAddTraining}
              className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Training</span>
            </button>
          )}
        </div>

        {/* Compliance Radar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg">
            <div className="text-[11px] font-bold text-[#0B1A30]">Compliance Rate</div>
            <div className="text-2xl font-extrabold text-[#0B1A30] mt-0.5 tabular-nums">
              {complianceRate}%
            </div>
            <div className="text-[10px] text-amber-800 mt-0.5">Donor audit threshold: 90%</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-600">Certified Staff Records</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-0.5 tabular-nums">
              {completedCount}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Valid certifications on file</div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-lg">
            <div className="text-[11px] font-semibold text-amber-800">Expiring Certifications</div>
            <div className="text-2xl font-extrabold text-amber-950 mt-0.5 tabular-nums">
              {expiringCount}
            </div>
            <div className="text-[10px] text-amber-700 mt-0.5">Renewal required within 60 days</div>
          </div>

          <div className="bg-rose-50/50 border border-rose-200 p-3 rounded-lg">
            <div className="text-[11px] font-semibold text-rose-800">Overdue Compliance</div>
            <div className="text-2xl font-extrabold text-rose-950 mt-0.5 tabular-nums">
              {overdueCount}
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">Critical audit alert: immediate refresher</div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search training title, staff name, provider..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none"
          >
            <option value="all">All Compliance Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Trainings Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Training Module</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Compliance Category</th>
                <th className="px-4 py-3">Provider & Cert Ref</th>
                <th className="px-4 py-3">Completion & Expiry</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrainings.map((tr) => (
                <tr key={tr.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 text-xs">{tr.trainingTitle}</div>
                    {tr.isMandatory && (
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                        Mandatory Donor Requirement
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectEmployee(tr.employeeId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {tr.employeeName}
                    </button>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-700">
                    {tr.trainingCategory || tr.category}
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-800">{tr.provider}</div>
                    <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                      {tr.certificateNumber || tr.certificate || 'Verified in-person'}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-slate-700 font-medium tabular-nums">
                      Completed: {formatDate(tr.completionDate || tr.endDate)}
                    </div>
                    {tr.expiryDate && (
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Expires: {formatDate(tr.expiryDate)}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        tr.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700'
                          : tr.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {tr.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
