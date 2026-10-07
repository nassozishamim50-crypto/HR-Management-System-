import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DocumentRecord } from '../../types';
import {
  FolderLock,
  UploadCloud,
  Search,
  Download,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Eye,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface DocumentsViewProps {
  onOpenUploadModal: () => void;
  onSelectEmployee: (empId: string) => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  onOpenUploadModal,
  onSelectEmployee,
}) => {
  const { documents, permissions, deleteDocument } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const docTypes = [
    'Employment Contract',
    'Offer Letter',
    'CV / Resume',
    'Academic Transcripts',
    'National ID / Passport',
    'Professional Certificate',
    'Job Description',
    'Performance Review',
    'Training Certificate',
    'PSEA & Safeguarding Policy Signed',
    'Code of Conduct Form',
    'Work Permit / Visa',
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const name = doc.documentName || doc.title || '';
      const type = doc.documentType || doc.docType || '';
      const matchesSearch =
        searchQuery === '' ||
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        type.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === 'all' || type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [documents, searchQuery, selectedType]);

  const handleDownload = (doc: DocumentRecord) => {
    alert(`Secure Download: Verifying token for [${doc.fileName}]. File decrypted and saved securely.`);
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-amber-500" />
              <span>Secure Employee Document Vault</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Encrypted NGO personnel dossiers, PSEA acknowledgments and statutory credentials
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canManageDocuments && (
              <button
                onClick={onOpenUploadModal}
                className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search documents by title, employee name, classification..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
            />
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none"
          >
            <option value="all">All Document Types</option>
            {docTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Document Title & File</th>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Classification</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3">Validity & Expiry</th>
                <th className="px-4 py-3">Compliance Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{doc.documentName || doc.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                          <span>{doc.fileName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{doc.fileSize}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-emerald-700">{doc.version}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => onSelectEmployee(doc.employeeId)}
                      className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                    >
                      {doc.employeeName}
                    </button>
                    <span className="text-[10px] text-slate-400">By: {doc.uploadedBy}</span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="font-medium text-slate-700">{doc.documentType || doc.docType}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-600 font-medium">
                    {formatDate(doc.uploadDate)}
                  </td>

                  <td className="px-4 py-3">
                    {doc.expiryDate ? (
                      <span className="font-medium text-slate-800 tabular-nums">
                        {formatDate(doc.expiryDate)}
                      </span>
                    ) : (
                      <span className="text-slate-400">No Expiry (Permanent)</span>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        doc.status === 'Valid'
                          ? 'bg-emerald-50 text-emerald-700'
                          : doc.status === 'Expiring Soon'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Simulate Secure Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download Encrypted Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      {permissions.canManageDocuments && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete document "${doc.documentName || doc.title}"?`)) {
                              deleteDocument(doc.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredDocs.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No documents found matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Encrypted Personnel Document Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Close
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <div className="font-bold text-sm text-slate-900">{previewDoc.documentName || previewDoc.title}</div>
              <div className="text-slate-600">Employee: <span className="font-semibold">{previewDoc.employeeName}</span></div>
              <div className="text-slate-600">Category: {previewDoc.documentType || previewDoc.docType}</div>
              <div className="text-slate-600">File Name: <span className="font-mono">{previewDoc.fileName}</span> ({previewDoc.fileSize})</div>
              <div className="text-slate-600">Verification: <span className="text-emerald-700 font-semibold">{previewDoc.verificationStatus || previewDoc.status}</span></div>
            </div>

            <div className="border border-slate-200 rounded-lg p-8 text-center bg-white space-y-2">
              <FileText className="w-12 h-12 text-emerald-700 mx-auto" />
              <div className="font-bold text-slate-800">Verified NGO Human Resources Document</div>
              <p className="text-slate-500 max-w-md mx-auto text-[11px]">
                This digital asset is stored in the organization's encrypted vault under compliance protocol ISO/IEC 27001 and Uganda DPPA 2019.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handleDownload(previewDoc)}
                className="px-4 py-2 font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Verified Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
