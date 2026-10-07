import React, { useState } from 'react';
import { Employee, TrustEntity } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  FileUp,
  Download,
  AlertTriangle,
  CheckCircle2,
  X,
  AlertCircle,
  FileSpreadsheet,
  Check,
} from 'lucide-react';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (importedCount: number) => void;
}

interface ParsedEmployeeRow {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  entity: TrustEntity;
  department: string;
  jobTitle: string;
  employmentType: string;
  status: 'valid' | 'duplicate_id' | 'duplicate_email' | 'missing_fields' | 'invalid_entity';
  errors: string[];
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { employees, entities, departments, addEmployee } = useApp();

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedEmployeeRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const downloadSampleCsv = () => {
    const header = 'employeeNumber,firstName,lastName,email,phone,entity,department,jobTitle,employmentType\n';
    const sample = [
      'SCT-MF-091,Faith,Namubiru,faith.namubiru@mukisafoundation.org,+256701122334,Mukisa Foundation,Health,Pediatric Physiotherapist,Contract',
      'SCT-DCC-092,Joshua,Kato,joshua.kato@dawncentre.org,+256772998877,Dawn Children\'s Centre,Education,Special Needs Teacher Aide,Permanent',
      'SCT-BMC-093,Dr. Brian,Ssemwogerere,brian.s@berakhahmedical.org,+256755443322,Berakhah Medical Center,Health,Consultant Pediatrician,Contract',
      'SCT-DCC-094,Amina,Nakitto,a.nakitto@dawncentre.org,+256702334890,Dawn Children\'s Centre,House Keeping,Head of Housekeeping & Hygiene,Permanent',
      'SCT-MIV-095,Moses,Ochen,m.ochen@mukisavillage.org,+256782990124,Mukisa Inclusive Village,Security,Chief Security Officer,Permanent',
    ].join('\n');

    const blob = new Blob([header + sample], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sct_employee_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCsvData = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      alert('CSV must contain a header row and at least one staff row.');
      return;
    }

    const existingIds = new Set(employees.map((e) => (e.employeeNumber || e.id).toLowerCase()));
    const existingEmails = new Set(employees.map((e) => e.email.toLowerCase()));

    const seenBatchIds = new Set<string>();
    const seenBatchEmails = new Set<string>();

    const rows: ParsedEmployeeRow[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
      const [
        employeeNumber = '',
        firstName = '',
        lastName = '',
        email = '',
        phone = '',
        entity = 'Mukisa Foundation',
        department = 'Health',
        jobTitle = 'Staff Member',
        employmentType = 'Contract',
      ] = cols;

      const errors: string[] = [];

      if (!employeeNumber || !firstName || !lastName || !email) {
        errors.push('Missing required fields (ID, Name, or Email)');
      }

      const idLower = employeeNumber.toLowerCase();
      if (existingIds.has(idLower) || seenBatchIds.has(idLower)) {
        errors.push(`Duplicate ID: ${employeeNumber} already registered`);
      }

      const emailLower = email.toLowerCase();
      if (existingEmails.has(emailLower) || seenBatchEmails.has(emailLower)) {
        errors.push(`Duplicate Email: ${email} already in database`);
      }

      seenBatchIds.add(idLower);
      seenBatchEmails.add(emailLower);

      rows.push({
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        entity: entity as TrustEntity,
        department,
        jobTitle,
        employmentType,
        status: errors.length > 0 ? 'duplicate_id' : 'valid',
        errors,
      });
    }

    setParsedRows(rows);
    setHasParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
      parseCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) {
      alert('No valid records to import. Please resolve the validation errors.');
      return;
    }

    setIsSaving(true);
    let count = 0;

    const defaultStationForEntity: Record<string, string> = {
      'Mukisa Foundation': 'Mukisa Foundation — Lungujja',
      'Mukisa Inclusive Village': 'Mukisa Inclusive Village — Bussi Island',
      'Dawn Children\'s Centre': 'Dawn Children’s Centre — Bukoto',
      'Berakhah Medical Center': 'Berakhah Medical Center — Kimanya, Wakiso',
    };

    for (const row of validRows) {
      try {
        await addEmployee({
          employeeNumber: row.employeeNumber,
          firstName: row.firstName,
          lastName: row.lastName,
          email: row.email,
          phone: row.phone,
          entity: row.entity,
          department: row.department,
          dutyStation: defaultStationForEntity[row.entity] || 'Mukisa Foundation — Lungujja',
          jobTitle: row.jobTitle,
          employmentType: row.employmentType as any,
          employmentStatus: 'Active',
          currency: 'UGX',
        });
        count++;
      } catch (err) {
        console.error('Import error for row:', row, err);
      }
    }

    setIsSaving(false);
    onSuccess(count);
    onClose();
  };

  const validCount = parsedRows.filter((r) => r.errors.length === 0).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* SCT Header */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              className="h-11 w-auto object-contain rounded bg-white p-0.5"
              style={{ aspectRatio: '5 / 4' }}
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-[#162365]">SPECIAL CHILDREN'S TRUST</span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FFF9D2] text-[#111C54] border border-[#FFDE00]">HR Ingestion</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Bulk CSV Staff Import & Pre-Validation Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-2 space-y-4 flex-1 overflow-y-auto">
          {!hasParsed ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Download Official CSV Template</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Includes all 6 departments: Health, Education, Social and Economic Employment, Administration, House Keeping, Security
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleCsv}
                  className="btn-sct-secondary px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Template.csv</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select CSV File to Inspect & Validate:
                </label>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#0B1A30] file:text-white hover:file:bg-[#132744] cursor-pointer border border-dashed border-slate-300 p-3 rounded-xl bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Paste Raw CSV Data Directly:
                </label>
                <textarea
                  rows={6}
                  placeholder={`employeeNumber,firstName,lastName,email,phone,entity,department,jobTitle,employmentType\nSCT-MF-099,Sarah,Nalubega,sarah.n@mukisafoundation.org,+256700000000,Mukisa Foundation,Education,Special Needs Teacher,Contract\nSCT-DCC-100,Amina,Nakitto,a.nakitto@dawncentre.org,+256702334890,Dawn Children's Centre,House Keeping,Housekeeper,Permanent\nSCT-MIV-101,Moses,Ochen,m.ochen@mukisavillage.org,+256782990124,Mukisa Inclusive Village,Security,Security Guard,Permanent`}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3 font-mono text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 bg-slate-50"
                />
                <button
                  type="button"
                  disabled={!rawText.trim()}
                  onClick={() => parseCsvData(rawText)}
                  className="mt-2 px-4 py-2 text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors disabled:opacity-50"
                >
                  Validate & Preview Data
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Validation Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center">
                  <div className="text-xl font-bold text-slate-900">{parsedRows.length}</div>
                  <div className="text-[11px] text-slate-500">Total Rows Detected</div>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <div className="text-xl font-bold text-emerald-800">{validCount}</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Valid & Ready to Import</div>
                </div>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-center">
                  <div className="text-xl font-bold text-rose-700">{invalidCount}</div>
                  <div className="text-[11px] text-rose-600 font-semibold">Duplicates / Erroneous</div>
                </div>
              </div>

              {/* Table preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Status</th>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Email</th>
                      <th className="p-2.5">Entity</th>
                      <th className="p-2.5">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className={row.errors.length > 0 ? 'bg-rose-50/50' : 'bg-white'}>
                        <td className="p-2.5">
                          {row.errors.length === 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded" title={row.errors.join('; ')}>
                              <AlertCircle className="w-3 h-3" /> Error
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-800">{row.employeeNumber}</td>
                        <td className="p-2.5">{row.firstName} {row.lastName}</td>
                        <td className="p-2.5 text-slate-500">{row.email}</td>
                        <td className="p-2.5">{row.entity}</td>
                        <td className="p-2.5 text-slate-600">{row.jobTitle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {invalidCount > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                  <div>
                    <span className="font-bold">Safeguard Guarantee:</span> {invalidCount} duplicate or incomplete records will be skipped automatically to prevent overwriting existing staff records. Only the {validCount} verified new records will be saved.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          {hasParsed ? (
            <button
              type="button"
              onClick={() => {
                setHasParsed(false);
                setParsedRows([]);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              &larr; Choose Different File
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            {hasParsed && (
              <button
                type="button"
                disabled={validCount === 0 || isSaving}
                onClick={handleConfirmImport}
                className="btn-sct-primary px-4 py-2 text-xs rounded-lg shadow-2xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isSaving ? (
                  <span>Saving to Firestore...</span>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Confirm & Import ({validCount}) Staff</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
