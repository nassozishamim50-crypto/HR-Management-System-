import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmploymentType, EmploymentStatus, DUTY_STATIONS } from '../../types';
import {
  Search,
  Plus,
  Download,
  Filter,
  Eye,
  MoreVertical,
  MapPin,
  Briefcase,
  Layers,
  Phone,
  Mail,
  ChevronDown,
  FileSpreadsheet,
  Power,
  Archive,
} from 'lucide-react';
import { formatDate, exportToCSV } from '../../utils/formatters';

interface EmployeesViewProps {
  onSelectEmployee: (empId: string) => void;
  onOpenAddEmployee: () => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  onSelectEmployee,
  onOpenAddEmployee,
}) => {
  const {
    employees,
    departments,
    projects,
    permissions,
    currentOrg,
    setIsBulkImportOpen,
    deactivateEmployee,
    reactivateEmployee,
    archiveEmployee,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        searchQuery === '' ||
        emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.dutyStation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.donorFundedProject || emp.entity || '').toLowerCase().includes(searchQuery.toLowerCase());

      const selectedDeptObj = departments.find(
        (d) => d.id === selectedDept || d.name.toLowerCase() === selectedDept.toLowerCase()
      );
      const matchesDept =
        selectedDept === 'all' ||
        emp.departmentId === selectedDept ||
        emp.department === selectedDept ||
        (selectedDeptObj &&
          (emp.department?.toLowerCase() === selectedDeptObj.name.toLowerCase() ||
            emp.departmentId === selectedDeptObj.id));
      const matchesStation =
        selectedStation === 'all' ||
        emp.dutyStation === selectedStation ||
        (emp.dutyStation && emp.dutyStation.toLowerCase().includes(selectedStation.toLowerCase())) ||
        (selectedStation.toLowerCase().includes((emp.dutyStation || '').toLowerCase()));
      const matchesType = selectedType === 'all' || emp.employmentType === selectedType;
      const matchesStatus = selectedStatus === 'all' || emp.employmentStatus === selectedStatus;

      return matchesSearch && matchesDept && matchesStation && matchesType && matchesStatus;
    });
  }, [employees, searchQuery, selectedDept, selectedStation, selectedType, selectedStatus]);

  const handleExportCSV = () => {
    const rows = filteredEmployees.map((e) => ({
      'Employee Number': e.employeeNumber,
      'First Name': e.firstName,
      'Middle Name': e.middleName || '',
      'Last Name': e.lastName,
      'Gender': e.gender,
      'Date of Birth': e.dateOfBirth,
      'Job Title': e.jobTitle,
      'Department': e.departmentName || e.department,
      'Entity': e.entity,
      'Duty Station': e.dutyStation,
      'Employment Type': e.employmentType,
      'Status': e.employmentStatus,
      'Date Joined': e.dateJoined || e.dateOfJoining,
      'Contract End Date': e.contractEndDate,
      'Supervisor': e.supervisorName || e.supervisor,
      'Primary Project': e.donorFundedProject || e.entity,
      'Grant Number': e.grant || 'SCT-2026',
      'Donor': e.fundingSource || 'Special Children Trust',
      'Phone': e.phone,
      'Email': e.email,
      'Uganda TIN': e.bankDetails?.tinNumber || (e.payroll as any)?.bankDetails?.tinNumber || '',
      'NSSF Number': e.bankDetails?.nssfNumber || (e.payroll as any)?.bankDetails?.nssfNumber || '',
    }));
    exportToCSV(`${currentOrg.acronym}_Staff_Master_Database`, rows);
  };

  const dutyStations = DUTY_STATIONS;

  return (
    <div className="space-y-5">
      {/* Top Header & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Employee Master Database ({filteredEmployees.length} of {employees.length})
            </h2>
            <p className="text-xs text-slate-500">
              Centralized personnel records, duty stations and grant allocations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>

            {permissions.canManageEmployees && (
              <>
                <button
                  onClick={() => setIsBulkImportOpen(true)}
                  className="btn-sct-secondary flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors shadow-2xs cursor-pointer"
                  title="Bulk CSV Staff Import"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
                  <span>Bulk Import</span>
                </button>

                <button
                  onClick={onOpenAddEmployee}
                  className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Employee</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID, position, grant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-400 focus:border-[#0B1A30] bg-slate-50/50"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All Duty Stations</option>
            {dutyStations.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="all">All Contract Types</option>
            <option value="Fixed-term">Fixed-term</option>
            <option value="Permanent">Permanent</option>
            <option value="Project-based">Project-based</option>
            <option value="Consultancy">Consultancy</option>
            <option value="Internship">Internship</option>
            <option value="Volunteer">Volunteer</option>
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Table View
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex-1 py-1 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Cards View
            </button>
          </div>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Department & Position</th>
                  <th className="px-4 py-3">Duty Station</th>
                  <th className="px-4 py-3">Donor Project / Grant</th>
                  <th className="px-4 py-3">Contract End</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={emp.id}
                    onClick={() => onSelectEmployee(emp.id)}
                    className="hover:bg-slate-50/70 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {(emp.photograph || emp.avatarUrl) ? (
                          <img
                            src={emp.photograph || emp.avatarUrl}
                            alt={emp.firstName}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                            {emp.firstName[0]}
                            {emp.lastName[0]}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {emp.employeeNumber} · {emp.gender[0]}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                      <div className="text-[11px] text-slate-500">{emp.departmentName || emp.department} · {emp.entity}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{emp.dutyStation}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900 max-w-[200px] truncate">
                        {emp.donorFundedProject || emp.entity}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {emp.fundingSource || 'Core Funds'} ({emp.grant || 'SCT-2026'})
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800 tabular-nums">
                        {formatDate(emp.contractEndDate)}
                      </span>
                      <span className="block text-[10px] text-slate-400">
                        {emp.employmentType}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          emp.employmentStatus === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {emp.employmentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-[#0B1A30] hover:bg-amber-100 rounded-lg transition-colors"
                          title="View Full Profile Dossier"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {permissions.canManageEmployees && (
                          <>
                            {emp.employmentStatus === 'Active' ? (
                              <button
                                onClick={() => {
                                  if (confirm(`Deactivate staff member ${emp.firstName} ${emp.lastName}?`)) {
                                    deactivateEmployee(emp.id, 'Administrative Deactivation');
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title="Deactivate Staff Account"
                              >
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  if (confirm(`Reactivate staff member ${emp.firstName} ${emp.lastName}?`)) {
                                    reactivateEmployee(emp.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title="Reactivate Staff Account"
                              >
                                <Power className="w-3.5 h-3.5 text-emerald-600" />
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm(`Archive staff dossier for ${emp.firstName} ${emp.lastName}?`)) {
                                  archiveEmployee(emp.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Archive Staff Record"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      {employees.length === 0 ? (
                        <div className="space-y-3">
                          <p className="font-semibold text-slate-700 text-sm">No employee records in the system.</p>
                          <p className="text-xs text-slate-500 max-w-md mx-auto">
                            The database is ready for real personnel records. Click &quot;Register Staff&quot; or use &quot;Bulk Import&quot; to add staff members.
                          </p>
                          {permissions.canManageEmployees && (
                            <button
                              onClick={onOpenAddEmployee}
                              className="btn-sct-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg mt-2 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Register Staff</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        <div>No staff members match the selected filters or duty station.</div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARDS VIEW */
        filteredEmployees.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            {employees.length === 0 ? (
              <div className="space-y-3">
                <p className="font-semibold text-slate-700 text-sm">No employee records in the system.</p>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  The database is ready for real personnel records. Click &quot;Register Staff&quot; or use &quot;Bulk Import&quot; to add staff members.
                </p>
                {permissions.canManageEmployees && (
                  <button
                    onClick={onOpenAddEmployee}
                    className="btn-sct-primary inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg mt-2 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Register Staff</span>
                  </button>
                )}
              </div>
            ) : (
              <div>No staff members match the selected filters or duty station.</div>
            )}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={emp.id}
              onClick={() => onSelectEmployee(emp.id)}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 cursor-pointer transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {(emp.photograph || emp.avatarUrl) ? (
                      <img
                        src={emp.photograph || emp.avatarUrl}
                        alt={emp.firstName}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-sm">
                        {emp.firstName[0]}
                        {emp.lastName[0]}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {emp.firstName} {emp.lastName}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400">{emp.employeeNumber}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      emp.employmentStatus === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {emp.employmentStatus}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="font-semibold text-slate-800">{emp.jobTitle}</div>
                  <div className="text-slate-500 text-[11px]">{emp.departmentName || emp.department} · {emp.entity}</div>

                  <div className="flex items-center gap-1 text-slate-600 text-[11px] pt-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{emp.dutyStation}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 text-[11px]">
                    <div className="text-slate-400">Project / Program:</div>
                    <div className="font-medium text-slate-800 truncate">{emp.donorFundedProject || emp.entity}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Contract End: {formatDate(emp.contractEndDate)}</span>
                <span className="text-[#0B1A30] font-bold hover:text-amber-600 transition-colors">View Dossier &rarr;</span>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
};
