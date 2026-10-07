import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, TrustEntity, DUTY_STATIONS } from '../../types';
import {
  X,
  User,
  Briefcase,
  FileText,
  DollarSign,
  Award,
  Clock,
  ShieldCheck,
  Building,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Lock,
  Edit2,
  Check,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntil, getExpiryCategory } from '../../utils/formatters';

interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
  onRenewContract?: (contractId: string) => void;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  employee,
  onClose,
}) => {
  const {
    departments,
    entities,
    permissions,
    contracts,
    documents,
    performance,
    timesheets,
    leaveRecords,
    updateEmployee,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'employment' | 'contracts' | 'documents' | 'leave' | 'payroll' | 'performance' | 'timesheets'
  >('overview');

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>(employee || {});

  if (!employee) return null;

  const empContracts = contracts.filter((c) => c.employeeId === employee.id);
  const empDocs = documents.filter((d) => d.employeeId === employee.id);
  const empPerformance = performance.filter((p) => p.employeeId === employee.id);
  const empTimesheets = timesheets.filter((t) => t.employeeId === employee.id);
  const empLeaves = leaveRecords.filter((l) => l.employeeId === employee.id);

  const handleSave = () => {
    updateEmployee(employee.id, formData);
    setIsEditing(false);
  };

  const daysToContractEnd = getDaysUntil(employee.contractEndDate);
  const expiryInfo = getExpiryCategory(daysToContractEnd);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* SCT Official Dossier Header Banner */}
        <div className="bg-[#111C54] px-4 sm:px-6 py-2.5 border-b border-[#1C2C78] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              className="h-8 w-auto object-contain rounded bg-white p-0.5"
              style={{ aspectRatio: '5 / 4' }}
            />
            <span className="text-xs font-black tracking-tight text-white">
              SPECIAL CHILDREN'S TRUST
            </span>
            <span className="text-[10px] text-[#FFDE00] font-black uppercase tracking-wider">
              · Official Personnel Dossier
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-300 font-bold">
            {employee.employeeNumber}
          </span>
        </div>

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-center gap-4">
            {employee.photograph ? (
              <img
                src={employee.photograph}
                alt={`${employee.firstName} ${employee.lastName}`}
                referrerPolicy="no-referrer"
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-[#111C54] text-[#FFDE00] font-black flex items-center justify-center text-lg border-2 border-[#FFDE00]/40">
                {employee.firstName[0]}
                {employee.lastName[0]}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-black text-[#162365]">
                  {employee.firstName} {employee.middleName || ''} {employee.lastName}
                  {employee.preferredName && (
                    <span className="text-xs font-normal text-slate-500 ml-1.5">
                      ("{employee.preferredName}")
                    </span>
                  )}
                </h3>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[#FFF9D2] text-[#111C54] border border-[#FFDE00]">
                  {employee.employeeNumber}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    employee.employmentStatus === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {employee.employmentStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                <span className="font-semibold text-slate-800">{employee.entity}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#0B1A30] font-bold">{employee.department}</span>
                <span aria-hidden="true">·</span>
                <span>{employee.jobTitle}</span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {employee.dutyStation}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canManageEmployees && (
              <button
                onClick={() => {
                  if (isEditing) {
                    handleSave();
                  } else {
                    setIsEditing(true);
                    setFormData(employee);
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  isEditing
                    ? 'btn-sct-primary'
                    : 'btn-sct-secondary'
                }`}
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                ) : (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Profile</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 gap-2 overflow-x-auto bg-white text-xs font-medium">
          {[
            { id: 'overview', label: 'Personal Details', icon: User },
            { id: 'employment', label: 'Employment Details', icon: Briefcase },
            { id: 'contracts', label: 'Contracts History', icon: FileText },
            { id: 'documents', label: 'Document Vault', icon: ShieldCheck },
            { id: 'leave', label: 'Leave History', icon: Calendar },
            { id: 'payroll', label: 'Compensation', icon: DollarSign, locked: !permissions.canViewSalaries },
            { id: 'performance', label: 'Performance Appraisals', icon: Award },
            { id: 'timesheets', label: 'Timesheet Records', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isLocked = tab.locked;
            return (
              <button
                key={tab.id}
                onClick={() => !isLocked && setActiveTab(tab.id as any)}
                disabled={isLocked}
                className={`flex items-center gap-1.5 py-3 px-2 border-b-2 font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-amber-500 text-[#0B1A30] font-bold'
                    : isLocked
                    ? 'border-transparent text-slate-300 cursor-not-allowed'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : ''}`} />
                <span>{tab.label}</span>
                {isLocked && <Lock className="w-3 h-3 text-slate-300" />}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* TAB 1: OVERVIEW & PERSONAL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-slate-400">Full Name</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {employee.firstName} {employee.middleName} {employee.lastName}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Gender</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.gender}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Date of Birth</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{formatDate(employee.dateOfBirth)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Nationality</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.nationality}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">National ID (NIN)</div>
                      <div className="font-mono font-semibold text-slate-900 mt-0.5">{employee.nationalIdNumber}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Passport Number</div>
                      <div className="font-mono font-semibold text-slate-900 mt-0.5">{employee.passportNumber || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Marital Status</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.maritalStatus}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">District</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.district}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Telephone</div>
                      <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {employee.phone}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Official Email</div>
                      <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {employee.email}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-slate-400">Residential Address</div>
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.residentialAddress}</div>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Custom Fields */}
                <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Emergency Contact (Duty of Care)
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="text-slate-400">Contact Name & Relationship</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {employee.emergencyContact.name} ({employee.emergencyContact.relationship})
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Primary Emergency Phone</div>
                      <div className="font-semibold text-slate-900 mt-0.5">
                        {employee.emergencyContact.phone}
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 pt-4">
                    Special Children's Trust Custom Fields
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {employee.customFields && Object.keys(employee.customFields).length > 0 ? (
                      Object.entries(employee.customFields).map(([key, val]) => (
                        <div key={key}>
                          <div className="text-slate-400">{key}</div>
                          <div className="font-semibold text-slate-900 mt-0.5">{String(val)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 col-span-2">No custom fields filled</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EMPLOYMENT DETAILS */}
          {activeTab === 'employment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                  Institutional Designation
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-slate-400 text-xs">Assigned Entity</div>
                    {isEditing ? (
                      <select
                        value={formData.entity || employee.entity}
                        onChange={(e) => setFormData({ ...formData, entity: e.target.value as TrustEntity })}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/40 font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {entities.map((ent) => (
                          <option key={ent} value={ent}>
                            {ent}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-bold text-emerald-800 mt-0.5">{employee.entity}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Department</div>
                    {isEditing ? (
                      <select
                        value={formData.department || employee.department}
                        onChange={(e) => {
                          const dept = departments.find((d) => d.name === e.target.value);
                          setFormData({
                            ...formData,
                            department: e.target.value,
                            departmentId: dept?.id || formData.departmentId,
                            departmentHead: dept?.departmentHead || formData.departmentHead,
                          });
                        }}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/40 font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>
                            {d.name} ({d.code})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.department}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-400 text-xs">Job Title</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.jobTitle !== undefined ? formData.jobTitle : employee.jobTitle}
                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/40 font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    ) : (
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.jobTitle}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-400">Position</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.position}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Staff Category</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.employeeCategory}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Employment Type</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.employmentType}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Date of Joining</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{formatDate(employee.dateOfJoining)}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Staff Grade</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.staffGrade}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Direct Supervisor</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.supervisor}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Department Head</div>
                    <div className="font-semibold text-slate-900 mt-0.5">{employee.departmentHead}</div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                  Duty Station & Work Location
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="text-slate-400 text-xs">Assigned Duty Station</div>
                    {isEditing ? (
                      <select
                        value={formData.dutyStation || employee.dutyStation}
                        onChange={(e) => setFormData({ ...formData, dutyStation: e.target.value })}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/40 font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
                      >
                        {DUTY_STATIONS.map((station) => (
                          <option key={station} value={station}>
                            {station}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="font-semibold text-slate-900 mt-0.5 text-sm">{employee.dutyStation}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-400 text-xs">Work Location / Specific Campus</div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.workLocation !== undefined ? formData.workLocation : (employee.workLocation || '')}
                        onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                        className="w-full mt-1 px-2.5 py-1.5 text-xs border border-emerald-300 rounded-lg bg-emerald-50/40 font-semibold text-slate-900 outline-none focus:ring-1 focus:ring-emerald-600"
                      />
                    ) : (
                      <div className="font-semibold text-slate-900 mt-0.5">{employee.workLocation || 'Main Unit'}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-slate-400">Years of Service with Trust</div>
                    <div className="font-bold text-slate-900 mt-0.5 tabular-nums">{employee.yearsOfService || 1} Years</div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-slate-400">Contract Validity</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium text-slate-900">
                        {formatDate(employee.contractStartDate)} – {formatDate(employee.contractEndDate)}
                      </span>
                      <span className={`text-[11px] ${expiryInfo.badgeClass}`}>
                        ({expiryInfo.label})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTRACTS */}
          {activeTab === 'contracts' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Contract History & Extensions ({empContracts.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Contract Ref</th>
                      <th className="px-3 py-2">Entity</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Start Date</th>
                      <th className="px-3 py-2">End Date</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empContracts.map((c) => {
                      const days = getDaysUntil(c.endDate);
                      const exp = getExpiryCategory(days);
                      return (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="px-3 py-2 font-mono text-[11px] font-semibold text-slate-900">
                            {c.contractNumber}
                          </td>
                          <td className="px-3 py-2 text-slate-700">{c.entity}</td>
                          <td className="px-3 py-2 text-slate-700">{c.contractType}</td>
                          <td className="px-3 py-2 text-slate-600">{formatDate(c.startDate)}</td>
                          <td className="px-3 py-2 text-slate-900 font-medium">
                            {formatDate(c.endDate)}
                            <span className={`block text-[10px] ${exp.badgeClass}`}>{exp.label}</span>
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-800">{c.renewalStatus}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Personnel Documents Vault ({empDocs.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Document Name</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Upload Date</th>
                      <th className="px-3 py-2">Expiry Date</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-900">{doc.documentName}</td>
                        <td className="px-3 py-2 text-slate-600">{doc.documentType}</td>
                        <td className="px-3 py-2 text-slate-500">{formatDate(doc.uploadDate)}</td>
                        <td className="px-3 py-2 text-slate-600">{formatDate(doc.expiryDate)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
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
                      </tr>
                    ))}
                    {empDocs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          No documents uploaded for this employee yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: LEAVE */}
          {activeTab === 'leave' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Leave History ({empLeaves.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Leave Category</th>
                      <th className="px-3 py-2">Start Date</th>
                      <th className="px-3 py-2">End Date</th>
                      <th className="px-3 py-2">Days</th>
                      <th className="px-3 py-2">Reason</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-900">{l.leaveType}</td>
                        <td className="px-3 py-2 text-slate-700">{formatDate(l.startDate)}</td>
                        <td className="px-3 py-2 text-slate-700">{formatDate(l.endDate)}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{l.numberOfDays}d</td>
                        <td className="px-3 py-2 text-slate-600 line-clamp-1">{l.reason}</td>
                        <td className="px-3 py-2 font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            l.status === 'Approved' ? 'bg-emerald-50 text-emerald-700'
                              : l.status === 'Pending' ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {empLeaves.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-400">
                          No leave applications recorded for this employee.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: PAYROLL / COMPENSATION */}
          {activeTab === 'payroll' && (
            <div className="space-y-4">
              {permissions.canViewSalaries ? (
                <div className="border border-slate-200 rounded-lg p-5 bg-white space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-100 pb-2">
                    Authorized Compensation & Banking Routing
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-slate-400">Monthly Basic Salary</div>
                      <div className="text-lg font-bold text-slate-900 mt-1 tabular-nums">
                        {formatCurrency(employee.basicSalary, employee.currency)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Bank Name</div>
                      <div className="font-semibold text-slate-900 mt-1">
                        {employee.bankDetails?.bankName || 'Stanbic Bank Uganda'}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400">Account Number</div>
                      <div className="font-mono font-semibold text-slate-900 mt-1">
                        {employee.bankDetails?.accountNumber || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-medium">Confidential Financial Data</p>
                  <p className="text-xs text-slate-400">Access limited to HR and Finance Directors.</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: PERFORMANCE */}
          {activeTab === 'performance' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Performance Reviews & Appraisals ({empPerformance.length})
              </h4>
              {empPerformance.map((pr) => (
                <div key={pr.id} className="border border-slate-200 rounded-lg p-4 space-y-3 bg-white">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="font-bold text-slate-900 text-sm">{pr.reviewPeriod}</span>
                    <span className="text-base font-extrabold text-emerald-700 tabular-nums">
                      Rating: {pr.overallRating} / 5.0
                    </span>
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Achievements:</span> {pr.achievements}
                  </div>
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-800">Supervisor Remarks:</span> {pr.supervisorComments}
                  </div>
                </div>
              ))}
              {empPerformance.length === 0 && (
                <div className="text-center py-6 text-slate-400">
                  No performance reviews on file yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 8: TIMESHEETS */}
          {activeTab === 'timesheets' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Timesheet Entries ({empTimesheets.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Project</th>
                      <th className="px-3 py-2">Activity</th>
                      <th className="px-3 py-2 text-right">Hours</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {empTimesheets.map((ts) => (
                      <tr key={ts.id} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2 font-medium text-slate-900">{formatDate(ts.date)}</td>
                        <td className="px-3 py-2 text-slate-700">{ts.project}</td>
                        <td className="px-3 py-2 text-slate-600 line-clamp-1">{ts.activity}</td>
                        <td className="px-3 py-2 text-right font-bold text-slate-900 tabular-nums">{ts.hours} hrs</td>
                        <td className="px-3 py-2 font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            ts.approvalStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {ts.approvalStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {empTimesheets.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-6 text-slate-400">
                          No timesheet entries recorded.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Special Children's Trust · Personnel Records Protocol
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
