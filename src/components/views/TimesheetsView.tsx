import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TimesheetEntry } from '../../types';
import {
  Timer,
  Plus,
  Download,
  CheckCircle2,
  Calendar,
  Building,
  Filter,
  Check,
  Search,
} from 'lucide-react';
import { formatDate, exportToCSV } from '../../utils/formatters';

interface TimesheetsViewProps {
  onOpenAddTimesheet: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const TimesheetsView: React.FC<TimesheetsViewProps> = ({
  onOpenAddTimesheet,
  onSelectEmployee,
}) => {
  const { timesheets, projects, permissions, currentUser, approveTimesheet, currentOrg } = useApp();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimesheets = useMemo(() => {
    return timesheets.filter((t) => {
      const projId = t.projectId || t.project;
      const status = t.approvalStatus || t.status || 'Pending';
      const matchesProj = selectedProjectId === 'all' || projId === selectedProjectId;
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'pending'
          ? (status as string) === 'Pending' || (status as string) === 'Submitted'
          : (status as string).includes('Approved');
      const matchesSearch =
        searchQuery === '' ||
        t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.activity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.grant || '').toLowerCase().includes(searchQuery.toLowerCase());

      return matchesProj && matchesStatus && matchesSearch;
    });
  }, [timesheets, selectedProjectId, selectedStatus, searchQuery]);

  // Aggregate hours by project
  const hoursByProject = useMemo(() => {
    const acc: Record<string, { id: string; name: string; donor: string; grant: string; totalHours: number }> = {};
    timesheets.forEach((t) => {
      const key = t.projectId || t.project || 'General';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          name: t.projectName || t.project || 'General Trust Program',
          donor: t.donor || 'Core Trust Funds',
          grant: t.grant || 'SCT-2026',
          totalHours: 0,
        };
      }
      acc[key].totalHours += t.hours;
    });
    return Object.values(acc);
  }, [timesheets]);

  const handleExportCSV = () => {
    const rows = filteredTimesheets.map((t) => ({
      'Date': t.date,
      'Staff Name': t.employeeName,
      'Project': t.projectName || t.project,
      'Grant Number': t.grant || 'SCT-2026',
      'Funding Donor': t.donor || 'Core Trust Funds',
      'Activity': t.activity,
      'Hours Worked': t.hours,
      'Duty Location': t.location,
      'Deliverable Description': t.description,
      'Approval Status': t.approvalStatus || t.status || 'Pending',
      'Approved By': t.approvedBy || '',
    }));
    exportToCSV(`${currentOrg.acronym}_Donor_Timesheets_Audit_Log`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-500" />
              <span>Donor Timesheets & Grant Level of Effort (LOE)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict USAID, EU ECHO, UNHCR and Global Fund audit-compliant timesheet accounting
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Timesheet Schedule</span>
            </button>

            <button
              onClick={onOpenAddTimesheet}
              className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Timesheet</span>
            </button>
          </div>
        </div>

        {/* Project Grant Hours Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {hoursByProject.map((p, idx) => (
            <div key={`${p.id}-${p.grant}-${idx}`} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.donor}</div>
              <div className="text-base font-bold text-slate-900 mt-0.5 tabular-nums">
                {p.totalHours} billable hrs
              </div>
              <div className="text-[11px] text-slate-600 truncate mt-0.5 font-medium">{p.name}</div>
              <div className="text-[10px] font-mono text-slate-400 mt-0.5">{p.grant}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff, activity, grant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none"
          >
            <option value="all">All Funding Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.grant || p.code})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Submitted (Pending Approval)</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Timesheet Entries Register */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Timesheets Activity Log</h3>
          <span className="text-xs text-slate-400">({filteredTimesheets.length} records)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Project & Grant Code</th>
                <th className="px-4 py-3">Activity & Deliverables</th>
                <th className="px-4 py-3 text-right">Hours</th>
                <th className="px-4 py-3">Duty Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">PM Sign-off</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTimesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">
                    {formatDate(ts.date)}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectEmployee(ts.employeeId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {ts.employeeName}
                    </button>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 truncate max-w-[200px]">{ts.projectName || ts.project}</div>
                    <div className="text-[11px] font-mono text-slate-500">{ts.grant || 'SCT-2026'} · {ts.donor || 'Trust Funds'}</div>
                  </td>

                  <td className="px-4 py-3 max-w-sm">
                    <div className="font-semibold text-slate-800">{ts.activity}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{ts.description}</div>
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                    {ts.hours} hrs
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {ts.location}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        (ts.approvalStatus || ts.status || '').includes('Approved')
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {ts.approvalStatus || ts.status || 'Pending'}
                    </span>
                    {ts.approvedBy && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        By {ts.approvedBy}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {((ts.approvalStatus as string) === 'Pending' || (ts.approvalStatus as string) === 'Submitted') && permissions.canApproveTimesheets ? (
                      <button
                        onClick={() =>
                          approveTimesheet(
                            ts.id,
                            'Approved',
                            `Signed off by ${currentUser.firstName} ${currentUser.lastName}`
                          )
                        }
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3 h-3" />
                        <span>Sign Off</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        {(ts.approvalStatus || ts.status || '').includes('Approved') ? 'Verified' : 'Pending PM'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredTimesheets.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    No timesheets found matching the selected filter criteria.
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
