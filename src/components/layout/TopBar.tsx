import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, TrustEntity } from '../../types';
import {
  Building2,
  ChevronDown,
  Clock,
  Bell,
  CheckCircle2,
  Shield,
  Layers,
  Heart,
  Menu,
} from 'lucide-react';
import { getDaysUntil } from '../../utils/formatters';

interface TopBarProps {
  onToggleSidebar: () => void;
  activeViewTitle: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, activeViewTitle }) => {
  const {
    trustName,
    entities,
    selectedEntityFilter,
    setSelectedEntityFilter,
    currentRole,
    currentUser,
    switchRole,
    contracts,
    leaveRecords,
    timesheets,
    recordAttendance,
    attendance,
    authUser,
    userProfile,
    setIsAuthModalOpen,
    setIsNotificationsOpen,
    isFirestoreConnected,
  } = useApp();

  const [entityDropdownOpen, setEntityDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  // Check today's attendance for current user
  const today = new Date().toISOString().split('T')[0];
  const userTodayAttendance = attendance.find(
    (a) => a.employeeId === currentUser.id && a.date === today
  );
  const isCheckedIn = !!userTodayAttendance?.checkInTime && !userTodayAttendance?.checkOutTime;

  // Alerts calculation
  const urgentContracts = contracts.filter((c) => {
    const days = getDaysUntil(c.endDate);
    return days !== null && days <= 30 && days >= 0;
  });
  const pendingLeaves = leaveRecords.filter((l) => l.status === 'Pending');
  const pendingTimesheets = timesheets.filter((t) => t.approvalStatus === 'Pending');
  const totalAlertCount = urgentContracts.length + pendingLeaves.length + pendingTimesheets.length;

  const roleLabels: Record<string, { label: string; desc: string }> = {
    'System Administrator': { label: 'System Administrator', desc: 'Full authorized management & security audit' },
    'HR Administrator': { label: 'HR Administrator', desc: 'Manage employees, contracts, leave and compliance' },
    'Executive/Director': { label: 'Executive / Director', desc: 'Organization-level dashboards and trust reports' },
    'Department Head': { label: 'Department Head', desc: 'Department team, approvals and reviews' },
    'HR Officer': { label: 'HR Officer', desc: 'Assigned HR operations, dossiers and onboarding' },
    Employee: { label: 'Staff Member', desc: 'Self-service dossier, leave, and timesheets' },
    SUPER_ADMIN: { label: 'Super Admin', desc: 'Trust-wide technical and governance control' },
    TRUST_DIRECTOR: { label: 'Trust Executive Director', desc: 'Overarching leadership across all 4 entities' },
    ENTITY_DIRECTOR: { label: 'Entity Director (Medical)', desc: 'Directs Berakhah Medical Center operations' },
    EDUCATION_COORDINATOR: { label: 'Education Lead', desc: 'Oversees Dawn Children\'s Centre & IEPs' },
    SOCIAL_EMPLOYMENT_LEAD: { label: 'Social & Employment Lead', desc: 'Directs Mukisa Foundation family & village programs' },
    HR_MANAGER: { label: 'Head of HR & Admin', desc: 'Manages people, contracts, policies and compliance' },
    HR_OFFICER: { label: 'HR Officer', desc: 'Recruitment, employee files and documentation' },
    FINANCE_OFFICER: { label: 'Finance & Grants Officer', desc: 'Budgets, payroll, and timesheets audit' },
    HEALTH_COORDINATOR: { label: 'Health Coordinator', desc: 'Rehabilitation, therapy and medical outreach' },
    DEPARTMENT_HEAD: { label: 'Department Head', desc: 'Departmental staff, leaves and performance' },
    SUPERVISOR: { label: 'Supervisor / Field Lead', desc: 'Village or clinical team supervision' },
    EMPLOYEE: { label: 'Staff Self-Service', desc: 'Timesheets, leave, my documents' },
    AUDITOR: { label: 'Auditor (Read-Only)', desc: 'Safeguarding, financial & donor compliance review' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2 border-[#FFDE00] shadow-xs">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">
        {/* Zone 1: Mobile toggle & Brand Zone wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a href="#" className="flex items-center gap-3 group">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              referrerPolicy="no-referrer"
              className="h-11 w-auto object-contain"
              style={{ aspectRatio: '5 / 4' }}
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-[#162365] group-hover:text-[#1E318A] transition-colors">
                  SPECIAL CHILDREN'S TRUST
                </span>
                <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-[#FFF9D2] text-[#111C54] border border-[#FFDE00]">
                  HRMS
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                Human Resources Management & Staff Portal
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Breadcrumb trail & Active Entity Scope */}
        <div className="hidden xl:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="text-[#162365] font-bold">{selectedEntityFilter}</span>
          <span aria-hidden="true" className="text-slate-300">/</span>
          <span className="text-[#162365] font-bold bg-[#F0F4FC] px-2.5 py-0.5 rounded border border-[#C8D7EF]">{activeViewTitle}</span>
        </div>

        {/* Zone 3: Interactive controls */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Quick Check-In / Out Button */}
          <button
            onClick={() => recordAttendance()}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              isCheckedIn
                ? 'bg-amber-100 text-[#0B1A30] hover:bg-amber-200 border border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
            title={isCheckedIn ? 'Click to Clock Out' : 'Click to Clock In'}
          >
            <Clock className={`w-3.5 h-3.5 ${isCheckedIn ? 'text-amber-700' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">
              {isCheckedIn
                ? `Clocked In (${userTodayAttendance?.checkIn})`
                : 'Clock In Today'}
            </span>
          </button>

          {/* Firebase Authentication & Profile Button */}
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
              authUser
                ? 'bg-[#0B1A30] text-white border-[#0B1A30] hover:bg-[#132744] shadow-xs'
                : 'btn-sct-primary animate-pulse'
            }`}
            title={authUser ? `Signed in as ${authUser.email}` : 'Sign In with Firebase Auth'}
          >
            <Shield className={`w-3.5 h-3.5 ${authUser ? 'text-amber-400' : 'text-[#0B1A30]'}`} />
            <span className="hidden md:inline">
              {authUser ? (authUser.email === 'nassozishamim50@gmail.com' ? 'Primary Admin' : 'Firebase Auth') : 'Sign In'}
            </span>
            <span className={`w-2 h-2 rounded-full ${authUser ? 'bg-amber-400' : 'bg-red-500'}`} />
          </button>

          {/* Real-time Notifications Bell */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title="Open Notifications & Alerts"
          >
            <Bell className="w-4 h-4" />
            {totalAlertCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Entity Scope Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setEntityDropdownOpen(!entityDropdownOpen);
                setRoleDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0B1A30]" />
              <span className="max-w-[140px] truncate">{selectedEntityFilter}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {entityDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Scope / Entity View
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setSelectedEntityFilter('All Entities');
                      setEntityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      selectedEntityFilter === 'All Entities'
                        ? 'bg-amber-50 text-[#0B1A30] font-bold border-l-2 border-amber-500'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-900">Entire Trust (Group Level)</div>
                      <div className="text-[11px] text-slate-500">Consolidated overview of all 4 entities</div>
                    </div>
                    {selectedEntityFilter === 'All Entities' && (
                      <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  {entities.map((ent) => (
                    <button
                      key={ent}
                      onClick={() => {
                        setSelectedEntityFilter(ent);
                        setEntityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        selectedEntityFilter === ent
                          ? 'bg-amber-50 text-[#0B1A30] font-bold border-l-2 border-amber-500'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{ent}</div>
                        <div className="text-[11px] text-slate-500">
                          {ent === 'Berakhah Medical Center' ? 'Pediatric clinical rehabilitation'
                            : ent === 'Dawn Children\'s Centre' ? 'Special needs school & IEPs'
                            : ent === 'Mukisa Inclusive Village' ? 'Inclusive living & livelihoods'
                            : 'Family advocacy & social support'}
                        </div>
                      </div>
                      {selectedEntityFilter === ent && (
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setEntityDropdownOpen(false);
              }}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-colors"
            >
              {currentUser.photograph ? (
                <img
                  src={currentUser.photograph}
                  alt={currentUser.firstName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                  {currentUser.firstName[0]}
                </div>
              )}
              <div className="flex flex-col text-left hidden md:flex">
                <span className="font-semibold text-slate-900 text-xs leading-tight">
                  {currentUser.firstName} {currentUser.lastName}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium leading-tight">
                  {roleLabels[currentRole]?.label || currentRole}
                </span>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Authentication & Access Level</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${authUser ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {authUser ? 'Verified Auth' : 'Signed Out'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {authUser
                      ? `Signed in as ${authUser.email} (${userProfile?.role || 'Employee'}). Enforced by Firestore Security Rules.`
                      : 'Please sign in to read/write real Firestore data. Unauthenticated writes are rejected by security rules.'}
                  </div>
                </div>

                {/* If user is real admin, allow perspective testing, otherwise show locked role */}
                {authUser && (userProfile?.role === 'System Administrator' || userProfile?.role === 'HR Administrator' || authUser.email === 'nassozishamim50@gmail.com') ? (
                  <div className="py-1 max-h-80 overflow-y-auto">
                    <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Administrator Perspective Switcher
                    </div>
                    {(Object.keys(roleLabels) as UserRole[]).map((role) => {
                      const info = roleLabels[role];
                      const isSelected = role === currentRole;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            switchRole(role);
                            setRoleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start justify-between ${
                            isSelected
                              ? 'bg-amber-50 text-[#0B1A30] font-bold border-l-2 border-amber-500'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <Shield className={`w-3 h-3 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />
                              <span>{info.label}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">{info.desc}</p>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-2">
                      <div className="font-semibold text-slate-800">
                        {authUser ? 'Role Locked by Firestore' : 'Unauthenticated Session'}
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        {authUser
                          ? `Your account role is '${userProfile?.role || 'Employee'}'. Firestore Security Rules strictly enforce read/write access based on your UID and verified token.`
                          : 'You must authenticate via Firebase to create or edit records in the database.'}
                      </p>
                      {!authUser && (
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full mt-2 py-2 btn-sct-primary text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Sign In with Firebase
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
