import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopBar } from './components/layout/TopBar';
import { Sidebar, NavView } from './components/layout/Sidebar';
import { DashboardView } from './components/views/DashboardView';
import { EmployeesView } from './components/views/EmployeesView';
import { ContractsView } from './components/views/ContractsView';
import { DocumentsView } from './components/views/DocumentsView';
import { RecruitmentView } from './components/views/RecruitmentView';
import { OnboardingView } from './components/views/OnboardingView';
import { LeaveView } from './components/views/LeaveView';
import { AttendanceView } from './components/views/AttendanceView';
import { TimesheetsView } from './components/views/TimesheetsView';
import { PerformanceView } from './components/views/PerformanceView';
import { TrainingView } from './components/views/TrainingView';
import { OrgChartView } from './components/views/OrgChartView';
import { ProjectStaffingView } from './components/views/ProjectStaffingView';
import { ReportsView } from './components/views/ReportsView';
import { PayrollView } from './components/views/PayrollView';
import { SettingsView } from './components/views/SettingsView';
import { DepartmentView } from './components/views/DepartmentView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { AuditLogsView } from './components/views/AuditLogsView';

// Modals
import { EmployeeModal } from './components/employees/EmployeeModal';
import { AddEmployeeModal } from './components/employees/AddEmployeeModal';
import { BulkImportModal } from './components/employees/BulkImportModal';
import { RenewContractModal } from './components/contracts/RenewContractModal';
import { UploadDocumentModal } from './components/documents/UploadDocumentModal';
import { RequestLeaveModal } from './components/leave/RequestLeaveModal';
import { AddTimesheetModal } from './components/timesheets/AddTimesheetModal';
import { AddTrainingModal } from './components/training/AddTrainingModal';
import { VacancyModal } from './components/recruitment/VacancyModal';
import { CandidateModal } from './components/recruitment/CandidateModal';
import { AuthModal } from './components/auth/AuthModal';
import { NotificationsDrawer } from './components/notifications/NotificationsDrawer';
import { Candidate, ContractRecord } from './types';

const MainApp: React.FC = () => {
  const {
    employees,
    contracts,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isBulkImportOpen,
    setIsBulkImportOpen,
    isNotificationsOpen,
    setIsNotificationsOpen,
  } = useApp();

  const [activeView, setActiveView] = useState<NavView>('master-dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [renewContractTarget, setRenewContractTarget] = useState<ContractRecord | null>(null);
  const [uploadDocOpen, setUploadDocOpen] = useState(false);
  const [requestLeaveOpen, setRequestLeaveOpen] = useState(false);
  const [addTimesheetOpen, setAddTimesheetOpen] = useState(false);
  const [addTrainingOpen, setAddTrainingOpen] = useState(false);
  const [vacancyModalOpen, setVacancyModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || null;

  const viewTitles: Record<NavView, string> = {
    'master-dashboard': "Special Children's Trust — Executive Overview",
    dashboard: "Special Children's Trust — Executive Overview",
    'entity-mukisa': 'Mukisa Foundation — Entity Operations & HR',
    'entity-village': 'Mukisa Inclusive Village — Entity Operations & HR',
    'entity-dawn': "Dawn Children's Centre — Entity Operations & HR",
    'entity-berakhah': 'Berakhah Medical Center — Clinical & HR Operations',
    'dept-health': 'Department of Health & Pediatric Therapy',
    'dept-education': 'Department of Inclusive Education & Special Needs',
    'dept-social': 'Department of Social & Economic Employment (SEE)',
    'dept-admin': 'Department of Administration & HR Governance',
    'dept-housekeeping': 'Department of House Keeping & Environmental Hygiene',
    'dept-security': 'Department of Security & Safeguarding Protection',
    employees: 'Employee Master Database',
    'org-chart': 'Organization Hierarchy Chart',
    contracts: 'Contract Management & Expiry Alerts',
    documents: 'Encrypted Document Vault',
    recruitment: 'Recruitment & Applicant Tracking',
    onboarding: 'Staff Onboarding & Compliance',
    leave: 'Leave & Hardship R&R Management',
    attendance: 'Daily Attendance & Duty Station Logs',
    timesheets: 'Timesheets & Donor Grant LOE',
    performance: 'Staff Performance Appraisals',
    training: 'Mandatory Compliance & Safeguarding Center',
    'project-staffing': 'Project Staffing Matrix',
    reports: 'Donor & Grant Reporting Center',
    payroll: 'Payroll & Statutory Staff Costs',
    announcements: 'HR Notice Board & Circulars',
    'audit-logs': 'Immutable Security Audit Trail & Access Logs',
    settings: 'Organization Configuration & Custom Fields',
  };

  const handleOpenRenewContract = (contractId: string) => {
    const c = contracts.find((item) => item.id === contractId);
    if (c) setRenewContractTarget(c);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Navigation Bar */}
      <TopBar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeViewTitle={viewTitles[activeView]}
      />

      <div className="flex-1 flex w-full">
        {/* Responsive Enterprise Sidebar */}
        <Sidebar
          activeView={activeView}
          setActiveView={setActiveView}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {(activeView === 'master-dashboard' ||
            activeView === 'dashboard' ||
            activeView.startsWith('entity-')) && (
            <DashboardView
              onNavigate={setActiveView}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
              onOpenAddEmployee={() => setAddEmployeeOpen(true)}
              onOpenRenewContract={handleOpenRenewContract}
            />
          )}

          {activeView === 'dept-health' && (
            <DepartmentView
              initialDeptName="Health"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'dept-education' && (
            <DepartmentView
              initialDeptName="Education"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'dept-social' && (
            <DepartmentView
              initialDeptName="Social and Economic Employment"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'dept-admin' && (
            <DepartmentView
              initialDeptName="Administration"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'dept-housekeeping' && (
            <DepartmentView
              initialDeptName="House Keeping"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'dept-security' && (
            <DepartmentView
              initialDeptName="Security"
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'announcements' && <AnnouncementsView />}

          {activeView === 'employees' && (
            <EmployeesView
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
              onOpenAddEmployee={() => setAddEmployeeOpen(true)}
            />
          )}

          {activeView === 'org-chart' && (
            <OrgChartView onSelectEmployee={(empId) => setSelectedEmployeeId(empId)} />
          )}

          {activeView === 'contracts' && (
            <ContractsView
              onOpenRenewModal={handleOpenRenewContract}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'documents' && (
            <DocumentsView
              onOpenUploadModal={() => setUploadDocOpen(true)}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'recruitment' && (
            <RecruitmentView
              onOpenVacancyModal={() => setVacancyModalOpen(true)}
              onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            />
          )}

          {activeView === 'onboarding' && <OnboardingView />}

          {activeView === 'leave' && (
            <LeaveView
              onOpenRequestModal={() => setRequestLeaveOpen(true)}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'attendance' && <AttendanceView />}

          {activeView === 'timesheets' && (
            <TimesheetsView
              onOpenAddTimesheet={() => setAddTimesheetOpen(true)}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'performance' && (
            <PerformanceView onSelectEmployee={(empId) => setSelectedEmployeeId(empId)} />
          )}

          {activeView === 'training' && (
            <TrainingView
              onOpenAddTraining={() => setAddTrainingOpen(true)}
              onSelectEmployee={(empId) => setSelectedEmployeeId(empId)}
            />
          )}

          {activeView === 'project-staffing' && (
            <ProjectStaffingView onSelectEmployee={(empId) => setSelectedEmployeeId(empId)} />
          )}

          {activeView === 'reports' && <ReportsView />}

          {activeView === 'payroll' && <PayrollView />}

          {activeView === 'settings' && <SettingsView />}

          {activeView === 'audit-logs' && <AuditLogsView />}
        </main>
      </div>

      {/* MODALS */}
      {selectedEmployee && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployeeId(null)}
          onRenewContract={handleOpenRenewContract}
        />
      )}

      {addEmployeeOpen && (
        <AddEmployeeModal onClose={() => setAddEmployeeOpen(false)} />
      )}

      {renewContractTarget && (
        <RenewContractModal
          contract={renewContractTarget}
          onClose={() => setRenewContractTarget(null)}
        />
      )}

      {uploadDocOpen && (
        <UploadDocumentModal onClose={() => setUploadDocOpen(false)} />
      )}

      {requestLeaveOpen && (
        <RequestLeaveModal onClose={() => setRequestLeaveOpen(false)} />
      )}

      {addTimesheetOpen && (
        <AddTimesheetModal onClose={() => setAddTimesheetOpen(false)} />
      )}

      {addTrainingOpen && (
        <AddTrainingModal onClose={() => setAddTrainingOpen(false)} />
      )}

      {vacancyModalOpen && (
        <VacancyModal onClose={() => setVacancyModalOpen(false)} />
      )}

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}

      {/* Firebase Auth & Profile Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Bulk CSV Staff Import Modal */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        onSuccess={(count) =>
          alert(`Successfully verified and imported ${count} new staff members into Cloud Firestore.`)
        }
      />

      {/* Real-time Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
