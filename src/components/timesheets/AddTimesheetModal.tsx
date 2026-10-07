import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Timer, Check } from 'lucide-react';

interface AddTimesheetModalProps {
  onClose: () => void;
}

export const AddTimesheetModal: React.FC<AddTimesheetModalProps> = ({ onClose }) => {
  const { currentUser, projects, submitTimesheet } = useApp();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    projectId: projects[0]?.id || '',
    activity: '',
    hours: 8,
    location: currentUser.dutyStation,
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.activity || !formData.description) {
      alert('Please fill in Activity and Description.');
      return;
    }

    const proj: any = projects.find((p: any) => p.id === formData.projectId) || projects[0] || {};

    submitTimesheet({
      employeeId: currentUser.id,
      employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
      entity: currentUser.entity,
      department: currentUser.department,
      project: proj.name || 'General Program',
      program: proj.department || 'Community Healthcare',
      date: formData.date,
      weekStartDate: formData.date,
      projectId: proj.id,
      projectName: proj.name,
      projectCode: proj.code,
      grant: proj.grantNumber || proj.grant || proj.code,
      donor: proj.donor || 'Special Children Trust',
      activity: formData.activity,
      hours: Number(formData.hours),
      location: formData.location,
      description: formData.description,
      supervisor: currentUser.supervisor,
      approvalStatus: 'Pending',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Timer className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Log NGO Project Timesheet
              </h3>
              <p className="text-xs text-slate-500">
                Record grant-billable hours for donor auditing
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Work Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Hours Worked *</label>
              <input
                type="number"
                min="0.5"
                max="24"
                step="0.5"
                required
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-medium tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Donor Project & Grant Code *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.donor} · {p.grantNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Activity Milestone *
            </label>
            <input
              type="text"
              required
              value={formData.activity}
              onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Community Hygiene Committee Session / Water Testing"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Duty Location *</label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              placeholder="e.g. Mukisa Foundation — Lungujja"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Detailed Deliverable Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="Document specific outputs, participants met, or field data gathered..."
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
              <span>Submit Timesheet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
