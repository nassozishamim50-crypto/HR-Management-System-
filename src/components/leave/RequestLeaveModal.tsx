import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LeaveType } from '../../types';
import { X, CalendarDays, Check } from 'lucide-react';

interface RequestLeaveModalProps {
  onClose: () => void;
}

export const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({ onClose }) => {
  const { currentUser, employees, leaveBalances, submitLeaveRequest } = useApp();

  const userBalance = leaveBalances[currentUser.id];

  const [formData, setFormData] = useState({
    leaveType: 'Annual Leave' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysCount: 3,
    handoverTo: '',
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) {
      alert('Please provide a reason for the leave request.');
      return;
    }

    submitLeaveRequest({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      entity: currentUser.entity,
      department: currentUser.department,
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      numberOfDays: Number(formData.daysCount),
      daysCount: Number(formData.daysCount),
      reason: formData.reason,
      handoverTo: formData.handoverTo || undefined,
      status: 'Pending',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Submit Staff Leave Request
              </h3>
              <p className="text-xs text-slate-500">
                {currentUser.firstName} {currentUser.lastName} · {currentUser.departmentName}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          {/* Quick Balance Banner */}
          {userBalance && (
            <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-lg flex items-center justify-between">
              <span className="text-emerald-900 font-medium">Your Remaining Annual Leave:</span>
              <span className="font-bold text-emerald-900 text-sm tabular-nums">
                {userBalance.annualLeave.balance} days
              </span>
            </div>
          )}

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Leave Category *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="Annual Leave">Annual Leave</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Maternity Leave">Maternity Leave (60 days)</option>
              <option value="Paternity Leave">Paternity Leave (7 days)</option>
              <option value="Compassionate Leave">Compassionate Leave</option>
              <option value="Study Leave">Study Leave</option>
              <option value="Field R&R (Rest & Recuperation)">Field R&R (Hardship Duty Station)</option>
              <option value="Special Leave">Special Emergency Leave</option>
              <option value="Unpaid Leave">Unpaid Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Total Days *</label>
              <input
                type="number"
                min="1"
                required
                value={formData.daysCount}
                onChange={(e) => setFormData({ ...formData, daysCount: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-medium tabular-nums"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Handover Colleague
              </label>
              <select
                value={formData.handoverTo}
                onChange={(e) => setFormData({ ...formData, handoverTo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
              >
                <option value="">Select Colleague (Optional)</option>
                {employees
                  .filter((e) => e.id !== currentUser.id)
                  .map((e) => (
                    <option key={e.id} value={`${e.firstName} ${e.lastName}`}>
                      {e.firstName} {e.lastName} ({e.jobTitle})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Purpose & Reason for Leave *
            </label>
            <textarea
              required
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Provide context for supervisor and HR manager review..."
            />
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
              <span>Submit to Supervisor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
