import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Department, ProgramActivity, TrustEntity } from '../../types';
import {
  Building2,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Users,
  Plus,
  Edit2,
  Power,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  UserCheck,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';

interface DepartmentViewProps {
  initialDeptName?: string;
  onSelectEmployee?: (empId: string) => void;
}

export const DepartmentView: React.FC<DepartmentViewProps> = ({
  initialDeptName,
  onSelectEmployee,
}) => {
  const {
    departments,
    employees,
    programActivities,
    selectedEntityFilter,
    entities,
    addDepartment,
    updateDepartment,
    deactivateDepartment,
    addProgramActivity,
    deleteProgramActivity,
    permissions,
  } = useApp();

  // Find active department from initial name or default to first
  const [selectedDeptId, setSelectedDeptId] = useState<string>(() => {
    if (initialDeptName) {
      const match = departments.find(
        (d) => d.name.toLowerCase() === initialDeptName.toLowerCase()
      );
      if (match) return match.id;
    }
    return departments[0]?.id || 'dept-health';
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'activities' | 'projects'>('overview');
  const [searchEmp, setSearchEmp] = useState('');
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);

  // Form states
  const [deptForm, setDeptForm] = useState({
    name: '',
    departmentHead: '',
    description: '',
    locations: 'Kampala Hub, Mukisa Village',
  });

  const [actForm, setActForm] = useState({
    title: '',
    entity: 'Mukisa Foundation' as TrustEntity,
    category: 'Therapy & Medical Outreach',
    description: '',
    responsibleStaff: '',
    location: 'Community Hub',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '2026-12-31',
    beneficiaryCount: 40,
  });

  const currentDept = departments.find((d) => d.id === selectedDeptId) || departments[0];

  // Filter employees belonging to this department and entity
  const deptEmployees = employees.filter((e) => {
    const matchesDept = e.department.toLowerCase() === currentDept?.name.toLowerCase();
    const matchesEntity =
      selectedEntityFilter === 'All Entities' || e.entity === selectedEntityFilter;
    const matchesSearch =
      searchEmp === '' ||
      `${e.firstName} ${e.lastName} ${e.jobTitle}`.toLowerCase().includes(searchEmp.toLowerCase());
    return matchesDept && matchesEntity && matchesSearch;
  });

  // Filter activities belonging to this department
  const deptActivities = programActivities.filter((a) => {
    const matchesDept = a.department.toLowerCase() === currentDept?.name.toLowerCase();
    const matchesEntity =
      selectedEntityFilter === 'All Entities' || a.entity === selectedEntityFilter;
    return matchesDept && matchesEntity;
  });

  const getDeptIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('health')) return Stethoscope;
    if (lower.includes('education')) return GraduationCap;
    if (lower.includes('social') || lower.includes('employment')) return Briefcase;
    if (lower.includes('house') || lower.includes('keeping')) return Sparkles;
    if (lower.includes('security')) return ShieldCheck;
    return Building2;
  };

  const handleSaveNewDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deptForm.name) return;
    addDepartment({
      name: deptForm.name as any,
      departmentHead: deptForm.departmentHead || 'Trust Directorate',
      description: deptForm.description,
      locations: deptForm.locations.split(',').map((s) => s.trim()),
    });
    setIsAddDeptOpen(false);
    setDeptForm({ name: '', departmentHead: '', description: '', locations: '' });
  };

  const handleSaveEditDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDept) return;
    updateDepartment(currentDept.id, {
      name: deptForm.name as any,
      departmentHead: deptForm.departmentHead,
      description: deptForm.description,
      locations: deptForm.locations.split(',').map((s) => s.trim()),
    });
    setIsEditDeptOpen(false);
  };

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actForm.title || !currentDept) return;
    addProgramActivity({
      ...actForm,
      department: currentDept.name,
      status: 'Active',
    });
    setIsAddActivityOpen(false);
    setActForm({
      title: '',
      entity: 'Mukisa Foundation',
      category: 'Therapy & Medical Outreach',
      description: '',
      responsibleStaff: '',
      location: 'Community Hub',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2026-12-31',
      beneficiaryCount: 40,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B1A30] mb-1">
              <Building2 className="w-4 h-4 text-amber-500" />
              <span>Special Children's Trust — Organizational Structure</span>
            </div>
            <h1 className="text-2xl font-black text-[#0B1A30]">
              Departments & Program Activities
            </h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Governing Health, Education, Social and Economic Employment, Administration, House Keeping, and Security across all four entities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {permissions.canManageDepartments && (
              <button
                onClick={() => {
                  setDeptForm({
                    name: '',
                    departmentHead: '',
                    description: '',
                    locations: 'Kampala Hub, Mukisa Village',
                  });
                  setIsAddDeptOpen(true);
                }}
                className="btn-sct-primary inline-flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg shadow-2xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Department</span>
              </button>
            )}
          </div>
        </div>

        {/* Department Pills / Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
          {departments.map((d) => {
            const Icon = getDeptIcon(d.name);
            const isSelected = d.id === selectedDeptId;
            const empCount = employees.filter((e) => e.department.toLowerCase() === d.name.toLowerCase()).length;
            return (
              <button
                key={d.id}
                onClick={() => {
                  setSelectedDeptId(d.id);
                  setActiveTab('overview');
                }}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#0B1A30] text-amber-300 border-[#0B1A30] shadow-sm font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-[#0B1A30]'}`} />
                <span>{d.name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-amber-400 text-[#0B1A30]' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {empCount}
                </span>
                {d.status === 'Inactive' && (
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded uppercase font-bold">
                    Inactive
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {currentDept && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Profile Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    currentDept.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}>
                    {currentDept.status === 'Active' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                    <span>{currentDept.status} Department</span>
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {currentDept.name}
                  </h2>
                </div>

                {permissions.canManageDepartments && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setDeptForm({
                          name: currentDept.name,
                          departmentHead: currentDept.departmentHead,
                          description: currentDept.description,
                          locations: currentDept.locations?.join(', ') || '',
                        });
                        setIsEditDeptOpen(true);
                      }}
                      title="Edit Department"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deactivateDepartment(currentDept.id)}
                      title={currentDept.status === 'Active' ? 'Deactivate Department' : 'Activate Department'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        currentDept.status === 'Active'
                          ? 'text-amber-600 hover:text-amber-700 hover:bg-amber-50'
                          : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {currentDept.description}
              </p>

              <div className="pt-3 border-t border-slate-100 space-y-3 text-sm">
                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Department Head
                  </div>
                  <div className="font-semibold text-slate-900 mt-0.5 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-700" />
                    <span>{currentDept.departmentHead}</span>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Operational Locations
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {(currentDept.locations || ['Kampala Headquarters']).map((loc, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-slate-100 text-slate-700 font-medium"
                      >
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                    <div className="text-lg font-bold text-slate-900">{deptEmployees.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Staff</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                    <div className="text-lg font-bold text-emerald-800">{deptActivities.length}</div>
                    <div className="text-[11px] text-slate-500 font-medium">Activities</div>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-lg text-center border border-slate-100">
                    <div className="text-lg font-bold text-blue-800">
                      {deptActivities.reduce((acc, a) => acc + (a.beneficiaryCount || 0), 0)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Beneficiaries</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Button for Activities */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Add Program Activity</h4>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Register specialized interventions or field events.
                </p>
              </div>
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors shrink-0"
              >
                + Activity
              </button>
            </div>
          </div>

          {/* Department Tabs & Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* View Sub-Tabs */}
            <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-2.5 transition-colors border-b-2 ${
                  activeTab === 'overview'
                    ? 'border-emerald-800 text-emerald-900'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Department Overview
              </button>
              <button
                onClick={() => setActiveTab('employees')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'employees'
                    ? 'border-amber-500 text-[#0B1A30] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Department Staff</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {deptEmployees.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('activities')}
                className={`pb-2.5 transition-colors border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'activities'
                    ? 'border-amber-500 text-[#0B1A30] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Program Activities</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {deptActivities.length}
                </span>
              </button>
            </div>

            {/* TAB: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <FolderKanban className="w-4 h-4 text-emerald-700" />
                    <span>Specialized Department Objectives & Scope</span>
                  </h3>
                  <div className="text-sm text-slate-700 space-y-3 leading-relaxed">
                    {currentDept.name.toLowerCase().includes('health') && (
                      <p>
                        Berakhah Medical Center & Medical Rehabilitation: Coordinates pediatric assessments, neurological therapies, physical and occupational therapy, speech and language pathology, assistive devices, clinical evaluations, and family healthcare counseling across all Special Children's Trust centres.
                      </p>
                    )}
                    {currentDept.name.toLowerCase().includes('education') && (
                      <p>
                        Dawn Children's Centre & Mukisa Inclusive Village: Leads individualized education programs (IEPs), specialized inclusive classrooms, teacher aides, neurodivergent developmental curricula, sensory integration, and educational transition planning for children with physical and cognitive diversities.
                      </p>
                    )}
                    {currentDept.name.toLowerCase().includes('social') && (
                      <p>
                        Social and Economic Employment (SEE): Drives parent support networks, family empowerment workshops, vocational livelihood initiatives, community disability sensitization, caregiver mental health, and inclusive employment linkages for families of children with special needs.
                      </p>
                    )}
                    {currentDept.name.toLowerCase().includes('admin') && (
                      <p>
                        Trust Administration & HR: Centralized stewardship over governance, donor compliance, child safeguarding clearances, financial control, facilities management, personnel contracts, and trust-wide logistics across Uganda.
                      </p>
                    )}
                    {currentDept.name.toLowerCase().includes('house') && (
                      <p>
                        House Keeping & Environmental Hygiene: Safeguards clinical-grade sanitization, specialized pediatric sensory room disinfection, residential dormitory hygiene, laundry services, waste management, and dignified therapeutic environments across all Special Children's Trust facilities.
                      </p>
                    )}
                    {currentDept.name.toLowerCase().includes('security') && (
                      <p>
                        Security & Premises Protection: Enforces strict child safeguarding perimeter monitoring, 24/7 security watch, visitor credential verification, transport safety oversight, and emergency evacuation readiness across all four trust entities.
                      </p>
                    )}
                  </div>
                </div>

                {/* Key Activities Highlight */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Recent Program Activities & Milestones
                    </h3>
                    <button
                      onClick={() => setActiveTab('activities')}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 hover:underline"
                    >
                      View All ({deptActivities.length})
                    </button>
                  </div>

                  {deptActivities.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      No activities registered yet for {currentDept.name}. Click "+ Activity" to create one.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {deptActivities.slice(0, 3).map((act) => (
                        <div
                          key={act.id}
                          className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                {act.entity}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {act.category}
                              </span>
                            </div>
                            <h4 className="text-sm font-bold text-slate-900 mt-1">
                              {act.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                              {act.description}
                            </p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-xs font-semibold text-slate-800">
                              {act.beneficiaryCount} Beneficiaries
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              <span>{act.startDate}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB: Employees */}
            {activeTab === 'employees' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder={`Search ${currentDept.name} staff by name or job title...`}
                      value={searchEmp}
                      onChange={(e) => setSearchEmp(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-emerald-800 bg-slate-50"
                    />
                  </div>
                  <div className="text-xs font-medium text-slate-500">
                    Showing {deptEmployees.length} staff member{deptEmployees.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {deptEmployees.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No employees found matching the filters for this department.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Staff Member</th>
                          <th className="py-2.5 px-3">Entity</th>
                          <th className="py-2.5 px-3">Position</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Safeguarding</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deptEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-slate-900">
                                {emp.firstName} {emp.lastName}
                              </div>
                              <div className="text-[11px] text-slate-400">{emp.employeeNumber || emp.id}</div>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-medium text-slate-800">{emp.entity}</span>
                            </td>
                            <td className="py-2.5 px-3">{emp.jobTitle}</td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                emp.employmentStatus === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {emp.employmentStatus}
                              </span>
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                                emp.safeguardingPoliceClearanceNo
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}>
                                {emp.safeguardingPoliceClearanceNo ? 'Police Cleared' : 'Pending Verification'}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {onSelectEmployee && (
                                <button
                                  onClick={() => onSelectEmployee(emp.id)}
                                  className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:underline"
                                >
                                  View Dossier
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Activities */}
            {activeTab === 'activities' && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    All Program Activities for {currentDept.name}
                  </h3>
                  <button
                    onClick={() => setIsAddActivityOpen(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Activity</span>
                  </button>
                </div>

                {deptActivities.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-sm">
                    No activities registered for {currentDept.name} under current filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {deptActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:shadow-2xs transition-all space-y-2"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              {act.entity}
                            </span>
                            <span className="text-xs font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {act.category}
                            </span>
                            <span className="text-xs font-bold text-emerald-700">
                              Status: {act.status}
                            </span>
                          </div>

                          {permissions.canManageDepartments && (
                            <button
                              onClick={() => deleteProgramActivity(act.id)}
                              className="text-xs text-rose-600 hover:text-rose-800 font-medium self-end sm:self-auto"
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <h4 className="text-base font-bold text-slate-900">{act.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{act.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-500">
                          <div>
                            <span className="font-semibold text-slate-700">Lead Staff:</span>{' '}
                            {act.responsibleStaff}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-700">Location:</span>{' '}
                            {act.location}
                          </div>
                          <div className="sm:text-right">
                            <span className="font-semibold text-slate-700">Target:</span>{' '}
                            <span className="font-bold text-emerald-800">{act.beneficiaryCount}</span> children/families
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Add Department */}
      {isAddDeptOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add Organizational Department
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a specialized structural department to Special Children's Trust.
            </p>
            <form onSubmit={handleSaveNewDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advocacy & Legal Rights"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Head *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Sarah Kyomugisha"
                  value={deptForm.departmentHead}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentHead: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Locations (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Kampala Hub, Mukisa Village, Dawn Centre"
                  value={deptForm.locations}
                  onChange={(e) => setDeptForm({ ...deptForm, locations: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Description & Mandate
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the clinical, pedagogical, or community role of this department..."
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDeptOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors"
                >
                  Create Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Department */}
      {isEditDeptOpen && currentDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Edit Department: {currentDept.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Update leadership, locations, and mandate details.
            </p>
            <form onSubmit={handleSaveEditDept} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Head
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.departmentHead}
                  onChange={(e) => setDeptForm({ ...deptForm, departmentHead: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operational Locations (comma-separated)
                </label>
                <input
                  type="text"
                  value={deptForm.locations}
                  onChange={(e) => setDeptForm({ ...deptForm, locations: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department Description & Mandate
                </label>
                <textarea
                  rows={3}
                  value={deptForm.description}
                  onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditDeptOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Program Activity */}
      {isAddActivityOpen && currentDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Add Activity to {currentDept.name}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Schedule a therapy clinic, educational workshop, or community outreach.
            </p>
            <form onSubmit={handleCreateActivity} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Specialized Hydrotherapy Clinic for Cerebral Palsy"
                  value={actForm.title}
                  onChange={(e) => setActForm({ ...actForm, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Entity
                  </label>
                  <select
                    value={actForm.entity}
                    onChange={(e) => setActForm({ ...actForm, entity: e.target.value as TrustEntity })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800 bg-white"
                  >
                    {entities.map((ent) => (
                      <option key={ent} value={ent}>{ent}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Beneficiaries
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={actForm.beneficiaryCount}
                    onChange={(e) => setActForm({ ...actForm, beneficiaryCount: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lead Staff Member
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Grace Tumusiime"
                    value={actForm.responsibleStaff}
                    onChange={(e) => setActForm({ ...actForm, responsibleStaff: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Berakhah Medical Center Wing B"
                    value={actForm.location}
                    onChange={(e) => setActForm({ ...actForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Activity Description & Objectives
                </label>
                <textarea
                  rows={2}
                  placeholder="Clinical goals, sensory milestones, or parent coaching curriculum..."
                  value={actForm.description}
                  onChange={(e) => setActForm({ ...actForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddActivityOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg shadow-2xs transition-colors"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
