import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrainingCategory } from '../../types';
import { X, GraduationCap, Check } from 'lucide-react';

interface AddTrainingModalProps {
  onClose: () => void;
}

export const AddTrainingModal: React.FC<AddTrainingModalProps> = ({ onClose }) => {
  const { currentOrg, employees, addTraining } = useApp();

  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    trainingTitle: '',
    category: 'Safeguarding' as TrainingCategory,
    provider: 'Uganda Humanitarian PSEA Network',
    completionDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    cost: 800000,
    isMandatory: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trainingTitle) {
      alert('Please enter training title.');
      return;
    }
    const emp = employees.find((e) => e.id === formData.employeeId);

    addTraining({
      employeeId: formData.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Staff',
      trainingTitle: formData.trainingTitle,
      category: formData.category,
      provider: formData.provider,
      completionDate: formData.completionDate,
      expiryDate: formData.expiryDate || undefined,
      cost: Number(formData.cost),
      currency: currentOrg.currency,
      isMandatory: formData.isMandatory,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <GraduationCap className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Record Staff Training & Certification
              </h3>
              <p className="text-xs text-slate-500">
                PSEA, Safeguarding and donor compliance tracking
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
            <label className="block text-slate-600 font-semibold mb-1">Select Employee *</label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.departmentName})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Compliance Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="Safeguarding">Safeguarding</option>
              <option value="Child Protection">Child Protection</option>
              <option value="Gender & Inclusion">Gender & Inclusion</option>
              <option value="PSEA">PSEA (Protection from Sexual Exploitation & Abuse)</option>
              <option value="Code of Conduct">Code of Conduct & Humanitarian Ethics</option>
              <option value="Field Security & Hostile Environment">Field Security & Hostile Environment (HEAT)</option>
              <option value="First Aid">First Aid & Emergency Response</option>
              <option value="Data Protection">Data Protection (Uganda DPPA 2019)</option>
              <option value="Project Management">Project Management & Donor Rules</option>
              <option value="Monitoring & Evaluation">Monitoring & Evaluation (MEL)</option>
              <option value="Leadership">Leadership & Team Governance</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Training Title *</label>
            <input
              type="text"
              required
              value={formData.trainingTitle}
              onChange={(e) => setFormData({ ...formData, trainingTitle: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Annual PSEA Refresher & Reporting Protocol"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">Training Provider *</label>
            <input
              type="text"
              required
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              placeholder="e.g. UN Women / Red Cross / Internal Institute"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Completion Date *</label>
              <input
                type="date"
                required
                value={formData.completionDate}
                onChange={(e) => setFormData({ ...formData, completionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Certificate Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">
                Cost ({currentOrg.currency})
              </label>
              <input
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none font-medium tabular-nums"
              />
            </div>
            <div className="pt-4 flex items-center gap-2">
              <input
                type="checkbox"
                id="isMandatory"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <label htmlFor="isMandatory" className="text-slate-700 font-medium">
                Mandatory NGO Requirement
              </label>
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
              <span>Record Training</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
