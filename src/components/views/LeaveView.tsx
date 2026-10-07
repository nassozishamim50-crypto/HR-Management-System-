import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveRequest, LeaveType } from '../../types';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  User,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface LeaveViewProps {
  onOpenRequestModal: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const LeaveView: React.FC<LeaveViewProps> = ({
  onOpenRequestModal,
  onSelectEmployee,
}) => {
  const {
    leaveRequests,
    leaveBalances,
    currentUser,
    permissions,
    approveLeaveRequest,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'balances'>('requests');

  const userBalance = leaveBalances[currentUser.id];

  const filteredRequests = leaveRequests.filter((l) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return l.status.startsWith('Pending');
    if (filterStatus === 'approved') return l.status === 'Approved';
    if (filterStatus === 'rejected') return l.status === 'Rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Entitlements */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-amber-500" />
              <span>Leave Management & Field R&R Workflow</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-tiered approvals (Supervisor &rarr; HR), hardship duty station R&R and statutory leave
            </p>
          </div>

          <button
            onClick={onOpenRequestModal}
            className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Leave</span>
          </button>
        </div>

        {/* User's Own Balances */}
        {userBalance && (
          <div className="pt-3 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              My Leave Balances ({currentUser.firstName} {currentUser.lastName})
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-amber-50/60 border border-amber-200 p-3 rounded-lg">
                <div className="text-[11px] text-[#0B1A30] font-bold">Annual Leave Balance</div>
                <div className="text-xl font-extrabold text-[#0B1A30] mt-1 tabular-nums">
                  {userBalance.annualLeave.balance}{' '}
                  <span className="text-xs font-normal text-amber-800">/ {userBalance.annualLeave.entitled} days</span>
                </div>
                <div className="text-[10px] text-amber-800 mt-0.5">
                  Taken: {userBalance.annualLeave.taken}d · Pending: {userBalance.annualLeave.pending}d
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[11px] text-slate-600 font-semibold">Sick Leave</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {userBalance.sickLeave.balance}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {userBalance.sickLeave.entitled} days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Medical certification</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[11px] text-slate-600 font-semibold">Field R&R (Hardship)</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {userBalance.fieldRR.balance}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {userBalance.fieldRR.entitled} days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Rest & Recuperation cycle</div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-[11px] text-slate-600 font-semibold">Study Leave</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1 tabular-nums">
                  {userBalance.studyLeave.balance}{' '}
                  <span className="text-xs font-normal text-slate-400">/ {userBalance.studyLeave.entitled} days</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Examinations & training</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Requests Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">Leave Applications Pipeline</span>
            <span className="text-xs text-slate-400">({filteredRequests.length} records)</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            {['all', 'pending', 'approved', 'rejected'].map((stg) => (
              <button
                key={stg}
                onClick={() => setFilterStatus(stg)}
                className={`px-3 py-1 rounded-md font-bold capitalize transition-colors ${
                  filterStatus === stg
                    ? 'bg-[#0B1A30] text-amber-400 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stg}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Applicant</th>
                <th className="px-4 py-3">Leave Type</th>
                <th className="px-4 py-3">Dates & Duration</th>
                <th className="px-4 py-3">Handover & Reason</th>
                <th className="px-4 py-3">Workflow Status</th>
                <th className="px-4 py-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectEmployee(req.employeeId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {req.employeeName}
                    </button>
                    <span className="text-[11px] text-slate-500">{req.department}</span>
                  </td>

                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {req.leaveType}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 tabular-nums">
                      {formatDate(req.startDate)} – {formatDate(req.endDate)}
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {req.numberOfDays || req.daysCount || 1} working days
                    </span>
                  </td>

                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-slate-800 line-clamp-1">{req.reason}</div>
                    {req.handoverTo && (
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Handover: <span className="font-medium text-slate-600">{req.handoverTo}</span>
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        req.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : req.status.startsWith('Pending')
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {req.status}
                    </span>
                    {(req.approver || (req as any).supervisorApproval) && (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Approved by {req.approver || (req as any).supervisorApproval?.by}
                      </div>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    {req.status.startsWith('Pending') && permissions.canApproveLeave ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            approveLeaveRequest(req.id, 'Approved', `Approved by ${currentUser.firstName} ${currentUser.lastName}`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => approveLeaveRequest(req.id, 'Rejected', 'Declined due to duty station staffing needs')}
                          className="px-2 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-xs">
                        {req.status === 'Approved' ? 'Finalized' : 'Recorded'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No leave requests in this category.
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
