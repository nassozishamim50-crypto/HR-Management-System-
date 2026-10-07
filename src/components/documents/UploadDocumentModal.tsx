import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import { X, UploadCloud, Check } from 'lucide-react';

interface UploadDocumentModalProps {
  onClose: () => void;
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({ onClose }) => {
  const { employees, uploadDocument } = useApp();

  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    docType: 'Employment Contract' as DocumentRecord['docType'],
    title: '',
    fileName: '',
    expiryDate: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Please provide a document title.');
      return;
    }
    const emp = employees.find((e) => e.id === formData.employeeId);

    uploadDocument({
      employeeId: formData.employeeId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Staff',
      docType: formData.docType,
      title: formData.title,
      fileName: formData.fileName || `${formData.title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileSize: `${(Math.random() * 2 + 0.8).toFixed(1)} MB`,
      expiryDate: formData.expiryDate || undefined,
      version: 'v1.0',
      status: 'Valid',
      verificationStatus: 'Verified',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <UploadCloud className="w-5 h-5 text-emerald-700" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Upload to Employee Document Vault
              </h3>
              <p className="text-xs text-slate-500">
                Secure NGO personnel storage with encryption
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
            <label className="block text-slate-600 font-semibold mb-1">
              Select Staff Member *
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} ({emp.employeeNumber}) · {emp.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Document Classification *
            </label>
            <select
              value={formData.docType}
              onChange={(e) => setFormData({ ...formData, docType: e.target.value as any })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
            >
              <option value="Employment Contract">Employment Contract</option>
              <option value="Offer Letter">Offer Letter</option>
              <option value="CV / Resume">CV / Resume</option>
              <option value="Academic Transcripts">Academic Transcripts</option>
              <option value="National ID / Passport">National ID / Passport</option>
              <option value="Professional Certificate">Professional Certificate</option>
              <option value="Job Description">Job Description</option>
              <option value="Performance Review">Performance Review</option>
              <option value="Disciplinary Document">Disciplinary Document</option>
              <option value="Training Certificate">Training Certificate</option>
              <option value="PSEA & Safeguarding Policy Signed">PSEA & Safeguarding Policy Signed</option>
              <option value="Code of Conduct Form">Code of Conduct Form</option>
              <option value="Work Permit / Visa">Work Permit / Visa</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. 2026 Signed PSEA Code of Conduct"
            />
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              File Attachment (.pdf, .docx, .scanned)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center hover:border-amber-400 transition-colors bg-slate-50 cursor-pointer">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <div className="text-slate-600 font-medium">Click to select local file or drop file here</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Maximum size 25MB · Encrypted storage</div>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Document Expiry Date (if applicable)
            </label>
            <input
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-amber-400"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Triggers automated alerts before expiry for contracts, police clearance, and certifications.
            </span>
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
              <span>Save & Index Document</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
