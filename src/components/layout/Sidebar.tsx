import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  Stethoscope,
  GraduationCap,
  Briefcase,
  Users,
  FolderLock,
  FileText,
  CalendarDays,
  Clock,
  Timer,
  Award,
  BookOpen,
  UserPlus,
  BarChart3,
  Bell,
  Settings,
  X,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  DollarSign,
  GitFork,
  UserCheck,
  Layers,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { getDaysUntil } from '../../utils/formatters';

export type NavView =
  | 'master-dashboard'
  | 'dashboard'
  | 'entity-mukisa'
  | 'entity-village'
  | 'entity-dawn'
  | 'entity-berakhah'
  | 'dept-health'
  | 'dept-education'
  | 'dept-social'
  | 'dept-admin'
  | 'dept-housekeeping'
  | 'dept-security'
  | 'employees'
  | 'org-chart'
  | 'onboarding'
  | 'documents'
  | 'contracts'
  | 'leave'
  | 'attendance'
  | 'timesheets'
  | 'performance'
  | 'training'
  | 'recruitment'
  | 'project-staffing'
  | 'payroll'
  | 'reports'
  | 'announcements'
  | 'settings'
  | 'audit-logs';

interface SidebarProps {
  activeView: NavView;
  setActiveView: (view: NavView) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  setActiveView,
  isOpen,
  onClose,
}) => {
  const {
    trustName,
    selectedEntityFilter,
    setSelectedEntityFilter,
    contracts,
    leaveRecords,
    timesheets,
    permissions,
    resetToDemoData,
  } = useApp();

  const urgentContractsCount = contracts.filter((c) => {
    const days = getDaysUntil(c.endDate);
    return days !== null && days <= 30 && days >= 0;
  }).length;

  const pendingLeavesCount = leaveRecords.filter((l) => l.status === 'Pending').length;
  const pendingTimesheetsCount = timesheets.filter((t) => t.approvalStatus === 'Pending').length;

  interface NavItem {
    id: NavView;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }

  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'GROUP & ENTITY DASHBOARDS',
      items: [
        { id: 'master-dashboard', label: 'Trust Master Dashboard', icon: LayoutDashboard },
        { id: 'entity-mukisa', label: 'Mukisa Foundation', icon: HeartHandshake },
        { id: 'entity-village', label: 'Mukisa Inclusive Village', icon: Building2 },
        { id: 'entity-dawn', label: 'Dawn Children\'s Centre', icon: Sparkles },
        { id: 'entity-berakhah', label: 'Berakhah Medical Center', icon: Stethoscope },
      ],
    },
    {
      title: 'CORE DEPARTMENTS',
      items: [
        { id: 'dept-health', label: '1. Health Department', icon: Stethoscope },
        { id: 'dept-education', label: '2. Education Department', icon: GraduationCap },
        { id: 'dept-social', label: '3. Social & Economic Employment', icon: Briefcase },
        { id: 'dept-admin', label: '4. Administration Department', icon: Building2 },
        { id: 'dept-housekeeping', label: '5. House Keeping Department', icon: Sparkles },
        { id: 'dept-security', label: '6. Security Department', icon: ShieldCheck },
      ],
    },
    {
      title: 'PEOPLE & HR MANAGEMENT',
      items: [
        { id: 'employees', label: 'Employee Master Database', icon: Users },
        { id: 'org-chart', label: 'Organization Hierarchy Chart', icon: GitFork },
        { id: 'onboarding', label: 'Staff Onboarding & Compliance', icon: UserCheck },
        { id: 'project-staffing', label: 'Project Staffing Matrix', icon: Layers },
        { id: 'documents', label: 'Employee Document Vault', icon: FolderLock },
        {
          id: 'contracts',
          label: 'Contract Management',
          icon: FileText,
          badge: urgentContractsCount > 0 ? urgentContractsCount : undefined,
          badgeColor: 'bg-rose-50 text-rose-700',
        },
        {
          id: 'leave',
          label: 'Leave Management',
          icon: CalendarDays,
          badge: pendingLeavesCount > 0 ? pendingLeavesCount : undefined,
          badgeColor: 'bg-amber-50 text-amber-700',
        },
        { id: 'attendance', label: 'Daily Attendance', icon: Clock },
        {
          id: 'timesheets',
          label: 'Timesheets Log',
          icon: Timer,
          badge: pendingTimesheetsCount > 0 ? pendingTimesheetsCount : undefined,
          badgeColor: 'bg-blue-50 text-blue-700',
        },
        { id: 'performance', label: 'Staff Performance', icon: Award },
        { id: 'training', label: 'Training & Safeguarding', icon: BookOpen },
        { id: 'recruitment', label: 'Recruitment & ATS', icon: UserPlus },
        { id: 'payroll', label: 'Payroll & Statutory Costs', icon: DollarSign },
      ],
    },
    {
      title: 'GOVERNANCE & SYSTEM',
      items: [
        { id: 'reports', label: 'Reports & Audits', icon: BarChart3 },
        { id: 'announcements', label: 'HR Notice Board', icon: Bell },
        { id: 'audit-logs', label: 'Security Audit Trail', icon: ShieldAlert },
        { id: 'settings', label: 'Custom Fields & Settings', icon: Settings },
      ],
    },
  ];

  const handleSelect = (view: NavView) => {
    setActiveView(view);
    // Auto-sync entity scope when selecting an entity dashboard
    if (view === 'entity-mukisa') setSelectedEntityFilter('Mukisa Foundation');
    if (view === 'entity-village') setSelectedEntityFilter('Mukisa Inclusive Village');
    if (view === 'entity-dawn') setSelectedEntityFilter('Dawn Children\'s Centre');
    if (view === 'entity-berakhah') setSelectedEntityFilter('Berakhah Medical Center');
    if (view === 'master-dashboard') setSelectedEntityFilter('All Entities');
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 left-0 z-50 lg:z-30 w-72 h-screen lg:h-[calc(100vh-4rem)] bg-[#111C54] border-r border-[#1C2C78] flex flex-col transition-transform duration-200 ease-in-out text-slate-200 shadow-xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-3.5 border-b border-[#1C2C78] bg-[#0C1540]">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Logo"
              className="h-10 w-auto object-contain rounded bg-white p-0.5 shadow-xs"
              style={{ aspectRatio: '5 / 4' }}
            />
            <div className="flex flex-col">
              <span className="font-black text-xs text-white tracking-tight">
                SPECIAL CHILDREN'S TRUST
              </span>
              <span className="text-[10px] text-[#FFDE00] font-bold uppercase tracking-wider">
                HR Management System
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Scope Pill */}
        <div className="px-4 py-3 border-b border-[#1C2C78] bg-[#0E1848]">
          <div className="text-[10px] font-bold text-[#FFDE00] uppercase tracking-wider flex items-center justify-between">
            <span>Operational Scope</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFDE00]" />
          </div>
          <div className="font-bold text-xs text-white truncate mt-0.5">
            {selectedEntityFilter}
          </div>
          <div className="text-[10px] text-slate-300 mt-0.5">
            Special Children's Trust Uganda
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="px-3 text-[10px] font-extrabold text-[#FFDE00] uppercase tracking-wider mb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#FFDE00] text-[#111C54] font-black shadow-sm'
                          : 'text-slate-200 hover:text-white hover:bg-[#1E318A]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? 'text-[#111C54]' : 'text-slate-300 group-hover:text-[#FFDE00]'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-[#111C54] text-[#FFDE00]'
                              : 'bg-[#FFDE00]/20 text-[#FFDE00] border border-[#FFDE00]/40'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Purge / Production Clean */}
        {permissions.canManageSettings && (
          <div className="p-3 border-t border-[#1C2C78] bg-[#0C1540]">
            <button
              onClick={async () => {
                if (window.confirm('Purge all demo and sample records from Special Children\'s Trust HR system? This maintains the clean production database.')) {
                  await resetToDemoData();
                  alert('Demo and sample records have been purged.');
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:text-white hover:bg-[#1E318A] rounded-lg transition-colors border border-amber-400/20"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Purge Demo Records</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
