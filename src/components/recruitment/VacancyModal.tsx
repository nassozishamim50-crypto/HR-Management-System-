import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { EmploymentType, DUTY_STATIONS } from '../../types';
import { X, Briefcase, Check } from 'lucide-react';

interface VacancyModalProps {
  onClose: () => void;
}

export const VacancyModal: React.FC<VacancyModalProps> = ({ onClose }) => {
  const { departments, projects, createVacancy } = useApp();

  const [formData, setFormData] = useState({
    jobTitle: '',
    department: departments[0]?.name || 'Health',
    project: projects[0]?.name || 'Pediatric Rehabilitation & Assistive Mobility Program',
    donor: projects[0]?.donor || 'USAID Uganda',
    dutyStation: DUTY_STATIONS[0],
    employmentType: 'Fixed-term' as EmploymentType,
    openings: 1,
    deadline: '2026-11-15',
    description: '',
    requirement1: 'Relevant university degree in specialized field.',
    requirement2: 'Minimum 3 years direct field experience in African NGO sector.',
    requirement3: 'Demonstrated fluency in donor reporting and safeguarding compliance.',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.jobTitle || !formData.description) {
      alert('Please fill in Job Title and Description.');
      return;
    }

    createVacancy({
      position: formData.jobTitle,
      jobTitle: formData.jobTitle,
      department: formData.department,
      donor: formData.donor,
      openings: Number(formData.openings),
      closingDate: formData.deadline,
      jobDescription: formData.description,
      description: formData.description,
      minimumQualifications: [formData.requirement1, formData.requirement2, formData.requirement3].filter(Boolean).join('. '),
      experience: '3+ years experience',
      hiringManager: 'Head of Department',
      entity: 'Mukisa Foundation',
    } as any);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Create NGO Vacancy
              </h3>
              <p className="text-xs text-slate-500">
                Publish job opening for recruitment pipeline
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700">
          <div>
            <label className="block text-slate-600 font-semibold mb-1">Job Title *</label>
            <input
              type="text"
              required
              value={formData.jobTitle}
              onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Field MEAL Officer"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Duty Station</label>
              <select
                value={formData.dutyStation}
                onChange={(e) => setFormData({ ...formData, dutyStation: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
              >
                {DUTY_STATIONS.map((station) => (
                  <option key={station} value={station}>
                    {station}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Donor Project</label>
              <select
                value={formData.project}
                onChange={(e) => {
                  const p = projects.find((proj) => proj.name === e.target.value);
                  setFormData({
                    ...formData,
                    project: e.target.value,
                    donor: p?.donor || formData.donor,
                  });
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Funding Donor</label>
              <input
                type="text"
                value={formData.donor}
                onChange={(e) => setFormData({ ...formData, donor: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Contract Type</label>
              <select
                value={formData.employmentType}
                onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
              >
                <option value="Fixed-term">Fixed-term</option>
                <option value="Permanent">Permanent</option>
                <option value="Project-based">Project-based</option>
                <option value="Consultancy">Consultancy</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Openings</label>
              <input
                type="number"
                min="1"
                value={formData.openings}
                onChange={(e) => setFormData({ ...formData, openings: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Closing Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Role Scope & Core Duties *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="Outline project objectives, reporting lines, and expected impact..."
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Key Requirements</label>
            <div className="space-y-1.5">
              <input
                type="text"
                value={formData.requirement1}
                onChange={(e) => setFormData({ ...formData, requirement1: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                placeholder="Requirement 1"
              />
              <input
                type="text"
                value={formData.requirement2}
                onChange={(e) => setFormData({ ...formData, requirement2: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                placeholder="Requirement 2"
              />
              <input
                type="text"
                value={formData.requirement3}
                onChange={(e) => setFormData({ ...formData, requirement3: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none"
                placeholder="Requirement 3"
              />
            </div>
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
              <span>Publish Vacancy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
