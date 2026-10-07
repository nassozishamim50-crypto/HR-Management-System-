import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { DUTY_STATIONS } from '../../types';
import {
  Users,
  UserCheck,
  CalendarDays,
  FileText,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Building,
  CheckCircle2,
  DollarSign,
  Plus,
} from 'lucide-react';
import { formatCurrency, formatDate, getDaysUntil, getExpiryCategory } from '../../utils/formatters';
import { NavView } from '../layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (view: NavView) => void;
  onSelectEmployee: (empId: string) => void;
  onOpenAddEmployee: () => void;
  onOpenRenewContract: (contractId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectEmployee,
  onOpenAddEmployee,
  onOpenRenewContract,
}) => {
  const {
    currentOrg,
    employees,
    contracts,
    leaveRequests,
    departments,
    projects,
    trainings,
    timesheets,
    permissions,
    currentUser,
  } = useApp();

  // Metrics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.employmentStatus === 'Active').length;
  const onLeaveEmployees = employees.filter((e) => e.employmentStatus === 'On Leave').length;
  const femaleCount = employees.filter((e) => e.gender === 'Female').length;
  const maleCount = employees.filter((e) => e.gender === 'Male').length;
  const femaleRatio = totalEmployees > 0 ? Math.round((femaleCount / totalEmployees) * 100) : 0;

  // Contracts expiring within 30 days
  const urgentContracts = useMemo(() => {
    return contracts
      .map((c) => {
        const days = getDaysUntil(c.endDate);
        return { ...c, daysUntil: days };
      })
      .filter((c) => c.daysUntil !== null && c.daysUntil <= 30 && c.daysUntil >= 0)
      .sort((a, b) => (a.daysUntil ?? 0) - (b.daysUntil ?? 0));
  }, [contracts]);

  // Contracts expiring within 90 days
  const contractsIn90Days = useMemo(() => {
    return contracts.filter((c) => {
      const days = getDaysUntil(c.endDate);
      return days !== null && days <= 90 && days >= 0;
    });
  }, [contracts]);

  // Pending leaves
  const pendingLeaves = leaveRequests.filter((l) => l.status.startsWith('Pending'));
  const pendingTimesheets = timesheets.filter((t) => t.status === 'Submitted');

  // Mandatory training compliance
  const mandatoryTrainings = trainings.filter((t) => t.isMandatory);
  const completedMandatory = mandatoryTrainings.filter((t) => t.status === 'Completed').length;
  const trainingComplianceRate =
    mandatoryTrainings.length > 0
      ? Math.round((completedMandatory / mandatoryTrainings.length) * 100)
      : 100;

  // Total gross payroll cost (if authorized)
  const totalStaffCost = employees.reduce((sum, e) => {
    if (!e.payroll) return sum;
    const allowances =
      (e.payroll.allowances?.hardship || 0) +
      (e.payroll.allowances?.transport || 0) +
      (e.payroll.allowances?.housing || 0) +
      (e.payroll.allowances?.airtimeAndData || 0);
    return sum + e.payroll.basicSalary + allowances;
  }, 0);

  // Department distribution
  const deptBreakdown = useMemo(() => {
    return departments.map((d) => {
      const count = employees.filter(
        (e) => e.departmentId === d.id || e.department?.toLowerCase() === d.name.toLowerCase()
      ).length;
      return {
        id: d.id,
        name: d.name,
        code: d.code,
        count,
        percentage: totalEmployees > 0 ? Math.round((count / totalEmployees) * 100) : 0,
      };
    });
  }, [departments, employees, totalEmployees]);

  // Duty stations
  const dutyStations = DUTY_STATIONS;

  return (
    <div className="space-y-6">
      {/* Top Banner with NGO Identity & Quick Stats */}
      <div className="bg-white border-b-4 border-[#FFDE00] rounded-xl p-5 shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              referrerPolicy="no-referrer"
              className="h-16 w-auto object-contain rounded-lg border border-slate-200 bg-white p-1 shadow-2xs"
              style={{ aspectRatio: '5 / 4' }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-[#162365] tracking-tight">
                  SPECIAL CHILDREN'S TRUST
                </h2>
                <span className="text-[11px] font-black text-[#111C54] bg-[#FFF9D2] border border-[#FFDE00] px-2.5 py-0.5 rounded-full">
                  NGO Bureau Reg: {currentOrg.regNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Integrated HR Management System &bull; {currentOrg.headquarters} &bull; Currency: {currentOrg.currency}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canManageEmployees && (
              <button
                onClick={onOpenAddEmployee}
                className="btn-sct-primary flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Enroll Staff Member</span>
              </button>
            )}
            <button
              onClick={() => onNavigate('contracts')}
              className="btn-sct-secondary flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Contracts Radar</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI 4-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Active Staff */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Total Staff Strength</span>
            <Users className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {totalEmployees}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({activeEmployees} Active · {onLeaveEmployees} On Leave)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span>Gender: {femaleRatio}% Female</span>
            <span aria-hidden="true">·</span>
            <span>{100 - femaleRatio}% Male</span>
          </div>
        </div>

        {/* KPI 2: Contracts Expiring Horizon */}
        <div
          onClick={() => onNavigate('contracts')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">Contracts Expiring (90d)</span>
            <AlertTriangle className={`w-4 h-4 ${urgentContracts.length > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold tabular-nums ${urgentContracts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
              {contractsIn90Days.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              ({urgentContracts.length} urgent &le; 30d)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-medium flex items-center gap-1">
            <span>Critical alerts active</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* KPI 3: Mandatory Safeguarding & PSEA */}
        <div
          onClick={() => onNavigate('training')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">PSEA / Safeguarding Audit</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {trainingComplianceRate}%
            </span>
            <span className="text-xs text-slate-500 font-medium">Compliant</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span>{completedMandatory} of {mandatoryTrainings.length} certified</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Donor Audit Ready</span>
          </div>
        </div>

        {/* KPI 4: Pending Operations / Payroll Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-medium">
              {permissions.canViewSalaries ? 'Monthly Personnel Cost' : 'Pending Operations'}
            </span>
            {permissions.canViewSalaries ? (
              <DollarSign className="w-4 h-4 text-emerald-700" />
            ) : (
              <Clock className="w-4 h-4 text-amber-600" />
            )}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {permissions.canViewSalaries ? (
              <span className="text-xl font-extrabold text-slate-900 tabular-nums">
                {formatCurrency(totalStaffCost, currentOrg.currency)}
              </span>
            ) : (
              <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                {pendingLeaves.length + pendingTimesheets.length}
              </span>
            )}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-2">
            <span>{pendingLeaves.length} Leave Approvals</span>
            <span aria-hidden="true">·</span>
            <span>{pendingTimesheets.length} Timesheets</span>
          </div>
        </div>
      </div>

      {/* Contracts Expiring Soon - Alert Horizon Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Contracts Expiring Soon — Renewal Action Horizon
            </h3>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
              {urgentContracts.length} Urgent Actions
            </span>
          </div>
          <button
            onClick={() => onNavigate('contracts')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
          >
            <span>View All Contracts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 divide-y divide-slate-100">
          {urgentContracts.map((c) => {
            const exp = getExpiryCategory(c.daysUntil ?? 0);
            return (
              <div
                key={c.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-rose-50 text-rose-700 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectEmployee(c.employeeId)}
                        className="font-bold text-slate-900 text-xs hover:text-emerald-700 text-left"
                      >
                        {c.employeeName}
                      </button>
                      <span className="text-[10px] font-mono text-slate-400">
                        {c.contractNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span>{c.jobTitle}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-slate-700 font-medium">{c.project || c.entity}</span>
                      <span aria-hidden="true">·</span>
                      <span>Fund: {c.fundingSource || 'Trust Funds'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pl-11 sm:pl-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block">
                      Expires {formatDate(c.endDate)}
                    </span>
                    <span className={`text-[11px] ${exp.badgeClass}`}>{exp.label}</span>
                  </div>

                  {permissions.canManageContracts && (
                    <button
                      onClick={() => onOpenRenewContract(c.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                    >
                      Renew / Extend
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {urgentContracts.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <span>No contracts expiring within the next 30 days. All staff records current.</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Staff Allocation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Staff Distribution by Department
            </h3>
            <span className="text-xs text-slate-500">{departments.length} Units</span>
          </div>

          <div className="mt-4 space-y-3">
            {deptBreakdown.map((dept) => (
              <div key={dept.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800">{dept.name}</span>
                  <span className="text-slate-500 font-medium tabular-nums">
                    {dept.count} staff ({dept.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(5, dept.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Donor Projects & Grants Staffing */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">
              Active Donor Projects & Operations
            </h3>
            <button
              onClick={() => onNavigate('reports')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <span>Reports & Audits</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {projects.map((proj: any) => {
              const assigned = employees.filter((e) =>
                (e.projectAllocations || []).some((p: any) => p.projectId === proj.id) ||
                e.department === proj.department ||
                e.entity === proj.entity
              ).length;

              return (
                <div key={proj.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{proj.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {proj.donor} · Grant: <span className="font-mono text-slate-700">{proj.grant || proj.grantNumber || proj.code}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs text-slate-900 tabular-nums">
                      {assigned} Staff
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      Budget: {formatCurrency(proj.budget, proj.currency)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Operational Actions & Duty Station Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals Widget */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Pending Authorizations</h3>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
              {pendingLeaves.length + pendingTimesheets.length} Pending
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {pendingLeaves.slice(0, 3).map((l) => (
              <div key={l.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">{l.employeeName}</div>
                  <div className="text-[11px] text-slate-500">
                    {l.leaveType} · {l.numberOfDays || l.daysCount || 1} days ({l.status})
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('leave')}
                  className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                >
                  Review
                </button>
              </div>
            ))}

            {pendingTimesheets.slice(0, 2).map((t) => (
              <div key={t.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-slate-900">{t.employeeName}</div>
                  <div className="text-[11px] text-slate-500">
                    Timesheet: {t.project || t.projectCode} · {t.hours} hrs
                  </div>
                </div>
                <button
                  onClick={() => onNavigate('timesheets')}
                  className="px-2.5 py-1 text-xs font-semibold text-blue-800 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                >
                  Approve
                </button>
              </div>
            ))}

            {pendingLeaves.length === 0 && pendingTimesheets.length === 0 && (
              <p className="text-center py-4 text-xs text-slate-400">
                All leave requests and timesheets are cleared.
              </p>
            )}
          </div>
        </div>

        {/* Duty Station Footprint */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Duty Station Footprint</h3>
            <span className="text-xs text-slate-500">SCT Official Duty Stations</span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {dutyStations.map((station) => {
              const staffInStation = employees.filter((e) =>
                e.dutyStation === station ||
                (e.dutyStation && station.toLowerCase().includes(e.dutyStation.toLowerCase())) ||
                (e.dutyStation && e.dutyStation.toLowerCase().includes(station.split(' — ')[0].toLowerCase()))
              );
              return (
                <div key={station} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-semibold text-slate-800">{station}</span>
                  </div>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    {staffInStation.length} Staff
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Birthdays & Milestones */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Staff Care & Birthdays</h3>
            <span className="text-xs text-slate-500">October 2026</span>
          </div>

          <div className="mt-3 space-y-2">
            {employees
              .filter((e) => {
                const month = e.dateOfBirth?.split('-')[1];
                return month === '10' || month === '11';
              })
              .slice(0, 4)
              .map((e) => (
                <div key={e.id} className="p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-slate-900">
                      {e.firstName} {e.lastName}
                    </div>
                    <div className="text-[11px] text-slate-500">{e.jobTitle}</div>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {formatDate(e.dateOfBirth)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};
