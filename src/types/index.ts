export type TrustEntity =
  | 'Mukisa Foundation'
  | 'Mukisa Inclusive Village'
  | 'Dawn Children\'s Centre'
  | 'Berakhah Medical Center';

export type DutyStation =
  | 'Mukisa Foundation — Lungujja'
  | 'Mukisa Inclusive Village — Bussi Island'
  | 'Dawn Children’s Centre — Bukoto'
  | 'Berakhah Medical Center — Kimanya, Wakiso';

export const DUTY_STATIONS: DutyStation[] = [
  'Mukisa Foundation — Lungujja',
  'Mukisa Inclusive Village — Bussi Island',
  'Dawn Children’s Centre — Bukoto',
  'Berakhah Medical Center — Kimanya, Wakiso',
];

export type UserRole =
  | 'System Administrator'
  | 'HR Administrator'
  | 'Executive/Director'
  | 'Department Head'
  | 'HR Officer'
  | 'Employee'
  | 'SUPER_ADMIN'
  | 'TRUST_DIRECTOR'
  | 'ENTITY_DIRECTOR'
  | 'HR_MANAGER'
  | 'FINANCE_OFFICER'
  | 'HEALTH_COORDINATOR'
  | 'EDUCATION_COORDINATOR'
  | 'SOCIAL_EMPLOYMENT_LEAD'
  | 'SUPERVISOR'
  | 'AUDITOR';

export interface UserProfile {
  uid: string;
  userId?: string;
  employeeId?: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  entity?: string;
  dutyStation?: string;
  department?: string;
  jobTitle?: string;
  role: UserRole;
  accountStatus: 'Active' | 'Inactive' | 'Pending';
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Permissions {
  canManageEmployees: boolean;
  canManageContracts: boolean;
  canManageLeave: boolean;
  canManageAttendance: boolean;
  canManageTimesheets: boolean;
  canApproveTimesheets: boolean;
  canManagePerformance: boolean;
  canManageTraining: boolean;
  canManageRecruitment: boolean;
  canManageDepartments: boolean;
  canManageOrganizations: boolean;
  canManageAnnouncements: boolean;
  canManageDocuments: boolean;
  canViewReports: boolean;
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  category: 'Auth' | 'Employee' | 'Leave' | 'Document' | 'Security' | 'Department' | 'System' | string;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  actorRole: string;
  targetResource?: string;
  targetId?: string;
  details?: string;
  timestamp: string;
  ipAddress?: string;
}

export type EmploymentType =
  | 'Permanent'
  | 'Contract'
  | 'Fixed-term'
  | 'Part-time'
  | 'Temporary'
  | 'Consultant'
  | 'Volunteer'
  | 'Intern'
  | 'Casual'
  | 'Other';

export type EmploymentStatus =
  | 'Active'
  | 'On Leave'
  | 'Suspended'
  | 'Resigned'
  | 'Retired'
  | 'Terminated'
  | 'Inactive';

export type DepartmentName =
  | 'Health'
  | 'Education'
  | 'Social and Economic Employment'
  | 'Administration'
  | 'House Keeping'
  | 'Security';

export interface CustomFieldDefinition {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
  options?: string[];
  module: 'employee' | 'department' | 'program' | 'training';
}

export interface Employee {
  // Personal Details
  id: string;
  employeeId: string;
  employeeNumber: string; // e.g. SCT-MF-001, SCT-BMC-004
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  gender: 'Female' | 'Male' | 'Other';
  dateOfBirth: string;
  nationality: string;
  nationalIdNumber: string; // Uganda NIN
  passportNumber?: string;
  maritalStatus: 'Single' | 'Married' | 'Widowed' | 'Divorced';
  photograph?: string;
  phone: string;
  alternativePhone?: string;
  email: string;
  residentialAddress: string;
  district: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    alternativePhone?: string;
  };

  // Employment Details
  entity: TrustEntity;
  department: string; // e.g., 'Health', 'Education', etc.
  departmentId: string;
  jobTitle: string;
  position: string;
  employeeCategory?: 'Executive' | 'Clinical Staff' | 'Educator / Teacher' | 'Therapist' | 'Social Worker' | 'Administrative' | 'Support Staff' | 'Technical Specialist';
  employmentType: EmploymentType;
  employmentStatus: EmploymentStatus;
  dateOfJoining: string;
  contractStartDate?: string;
  contractEndDate?: string;
  supervisor: string;
  supervisorId?: string;
  departmentHead?: string;
  dutyStation: string; // e.g., 'Mukisa Foundation HQ - Kampala', 'Berakhah Clinic - Entebbe/Kitemu', 'Dawn Centre - Ntinda', 'Inclusive Village - Mpigi'
  workLocation?: string;
  staffGrade?: string; // e.g., 'Grade A - Director', 'Grade B - Specialist', 'Grade C - Officer'
  yearsOfService?: number;

  // Compatibility & Alias Fields
  fullName?: string;
  uid?: string;
  userId?: string;
  role?: UserRole;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
  avatarUrl?: string;
  departmentName?: string;
  supervisorName?: string;
  dateJoined?: string;
  donorFundedProject?: string;
  grant?: string;
  fundingSource?: string;

  // Compensation (Authorized HR/Finance only)
  basicSalary?: number;
  currency: 'UGX' | 'USD';
  workEmail?: string;
  workPhone?: string;
  probationPeriodMonths?: number;
  safeguardingPoliceClearanceNo?: string;
  safeguardingClearanceExpiry?: string;
  pseaTrained?: boolean;
  professionalRegNo?: string;
  projectAllocations?: { projectId: string; projectName: string; percentage: number }[];
  payroll?: {
    basicSalary: number;
    currency?: 'UGX' | 'USD';
    payFrequency?: string;
    allowances?: {
      hardship?: number;
      transport?: number;
      housing?: number;
      medical?: number;
      specializedCare?: number;
      airtimeAndData?: number;
    };
    deductions?: {
      nssf?: number;
      paye?: number;
      nssfEmployee?: number;
      nssfEmployer?: number;
      payeTax?: number;
      localServiceTax?: number;
      advanceSalary?: number;
      other?: number;
      total?: number;
    };
    bankDetails?: {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
      branch?: string;
      tinNumber?: string;
      nssfNumber?: string;
    };
    nssfEmployee?: number;
    nssfEmployer?: number;
    payeTax?: number;
    netPay?: number;
    bankName?: string;
    accountNumber?: string;
  };
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    tinNumber?: string;
    nssfNumber?: string;
  };

  customFields?: Record<string, any>;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  departmentHead: string;
  departmentHeadId: string;
  description: string;
  status: 'Active' | 'Inactive';
  locations: string[];
  programsCount?: number;
  projectsCount?: number;
  activitiesCount?: number;
}

export interface ProgramActivity {
  id: string;
  entity: TrustEntity;
  department: DepartmentName | string;
  title: string;
  category: string; // e.g., 'Pediatric Therapy', 'Special Class IEP', 'Vocational Weaving', 'Procurement'
  description: string;
  responsibleStaff: string;
  responsibleStaffId: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed' | 'On Hold';
  beneficiaryCount?: number;
  notes?: string;
  partnerOrganization?: string;
}

export interface DocumentRecord {
  id: string;
  employeeId: string;
  employeeUid?: string;
  employeeEmail?: string;
  employeeName: string;
  entity: TrustEntity;
  documentName: string;
  title?: string;
  docType?: string;
  verificationStatus?: string;
  documentType:
    | 'Employment Contract'
    | 'CV'
    | 'National ID'
    | 'Passport'
    | 'Academic Certificate'
    | 'Professional Certificate'
    | 'Job Description'
    | 'Medical / Occupational Document'
    | 'Training Certificate'
    | 'Performance Review'
    | 'Warning Letter'
    | 'Appointment Letter'
    | 'Other HR Document'
    | string;
  description?: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  expiryDate?: string;
  uploadedBy: string;
  version: string;
  status: 'Valid' | 'Expiring Soon' | 'Expired';
}

export interface ContractRecord {
  id: string;
  contractNumber: string;
  employeeId: string;
  employeeName: string;
  entity: TrustEntity;
  department: string;
  jobTitle: string;
  contractType: EmploymentType;
  startDate: string;
  endDate: string;
  salary: number;
  currency: 'UGX' | 'USD';
  renewalStatus: 'Active' | 'Under Review' | 'Pending Renewal' | 'Renewed' | 'Expired';
  noticePeriodDays: number;
  project?: string;
  fundingSource?: string;
}

export type LeaveType =
  | 'Annual Leave'
  | 'Sick Leave'
  | 'Maternity Leave'
  | 'Paternity Leave'
  | 'Compassionate Leave'
  | 'Study Leave'
  | 'Unpaid Leave'
  | 'Other Leave';

export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';

export interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeUid?: string;
  employeeEmail?: string;
  employeeName: string;
  entity: TrustEntity;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  daysCount?: number;
  reason: string;
  handoverTo?: string;
  supervisorApproval?: string;
  status: LeaveStatus | string;
  approver?: string;
  approvalDate?: string;
  comments?: string;
}

export type LeaveRequest = LeaveRecord;

export interface LeaveBalance {
  employeeId: string;
  annual: number;
  sick: number;
  maternity: number;
  paternity: number;
  compassionate: number;
}

export interface OnboardingChecklist {
  id: string;
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  department: string;
  entity?: TrustEntity;
  startDate: string;
  progressPercentage: number;
  tasks: { id: string; title: string; category: string; completed: boolean; dueDate?: string }[];
}

export type WorkMode = 'Office' | 'Field' | 'Remote' | 'Travel' | 'Other';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Sick' | 'Leave' | 'Official Duty';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeUid?: string;
  employeeEmail?: string;
  employeeName: string;
  entity?: TrustEntity;
  department?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInTime?: string;
  checkOutTime?: string;
  jobTitle?: string;
  dutyStation?: string;
  locationCoordinates?: string;
  status: AttendanceStatus | string;
  location: string;
  workMode: WorkMode;
  remarks?: string;
}

export interface TimesheetRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  entity: TrustEntity;
  department: string;
  project?: string;
  program?: string;
  date: string;
  weekStartDate?: string;
  hours: number;
  activity: string;
  location: string;
  description: string;
  supervisor: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  approvalDate?: string;
  comments?: string;
  donor?: string;
  grant?: string;
  status?: string;
  approvedBy?: string;
  projectName?: string;
  projectId?: string;
  projectCode?: string;
}

export type TimesheetEntry = TimesheetRecord;

export type PerformanceReview = PerformanceRecord;

export interface PerformanceRecord {
  id: string;
  employeeId: string;
  employeeUid?: string;
  employeeEmail?: string;
  employeeName: string;
  entity: TrustEntity;
  department: string;
  reviewPeriod: string;
  cycleName?: string;
  supervisor: string;
  supervisorName?: string;
  objectives: { id: string; title: string; kpi: string; rating: number; weight?: number; score?: number }[];
  kpis: string;
  achievements: string;
  areasForImprovement: string;
  trainingNeeds: string;
  overallRating: number; // 1 to 5
  overallScore?: number;
  status?: string;
  supervisorComments: string;
  employeeComments?: string;
  reviewStatus: 'Employee Self Assessment' | 'Supervisor Review' | 'HR Review' | 'Final Approval' | string;
  finalizedAt?: string;
  strengths?: string;
  developmentPlan?: string;
}

export type TrainingCategory = string;

export interface TrainingRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  entity: TrustEntity;
  department: string;
  trainingTitle: string;
  trainingCategory: string; // Safeguarding, Child Protection, Disability Inclusion, First Aid, etc.
  category?: string;
  provider: string;
  startDate: string;
  endDate: string;
  cost: number;
  currency: 'UGX' | 'USD';
  certificate: string;
  certificateNumber?: string;
  expiryDate?: string;
  completionDate?: string;
  isMandatory?: boolean;
  skillsAcquired: string;
  remarks?: string;
  status: 'Completed' | 'In Progress' | 'Expiring Soon' | 'Overdue';
}

export interface Vacancy {
  id: string;
  vacancyNumber: string;
  position: string;
  jobTitle?: string;
  department: string;
  entity: TrustEntity;
  jobDescription: string;
  description?: string;
  donor?: string;
  minimumQualifications: string;
  experience: string;
  closingDate: string;
  hiringManager: string;
  status: 'Open' | 'Closed' | 'Interviewing' | 'Draft';
  openings: number;
  applicantCount: number;
}

export type RecruitmentStage =
  | 'Applied'
  | 'Screening'
  | 'Shortlisted'
  | 'Interview'
  | 'Assessment'
  | 'Reference Check'
  | 'Selected'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | string;

export interface Candidate {
  id: string;
  vacancyId: string;
  vacancyPosition: string;
  vacancyTitle?: string;
  entity: TrustEntity;
  fullName: string;
  email: string;
  phone: string;
  appliedDate: string;
  stage: RecruitmentStage;
  interviewScore?: number;
  interviewNotes?: string;
  cvFileName: string;
  yearsOfExperience: number;
  expectedSalary?: number;
  recommendedBy?: string;
}

export type StaffCategory = Employee['employeeCategory'];

export interface HRAnnouncement {
  id: string;
  title: string;
  entity: 'All Entities' | TrustEntity;
  category: 'Policy' | 'Training' | 'Health & Safety' | 'General' | 'Event';
  content: string;
  publishedDate: string;
  author: string;
  isImportant?: boolean;
}

export interface Organization {
  id: string;
  name: string;
  acronym: string;
  regNumber: string;
  headquarters: string;
  district: string;
  currency: 'UGX' | 'USD';
  logoUrl?: string;
  customFields?: any[];
  [key: string]: any;
}
