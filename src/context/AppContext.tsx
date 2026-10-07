import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType, testFirestoreConnection } from '../firebase/config';
import {
  COLLECTIONS,
  recordAuditLog,
  sendNotification,
  seedInitialFirestoreData,
  ensureStandardDepartmentsInFirestore,
  purgeDemoDataFromFirestore,
  isDemoEmployee,
  isDemoRelatedRecord,
  isDemoRecordId,
  createOrUpdateHRUserProfile,
} from '../services/firebaseService';
import {
  TrustEntity,
  DutyStation,
  DUTY_STATIONS,
  UserRole,
  Department,
  ProgramActivity,
  Employee,
  DocumentRecord,
  ContractRecord,
  LeaveRecord,
  AttendanceRecord,
  TimesheetRecord,
  PerformanceRecord,
  TrainingRecord,
  Vacancy,
  Candidate,
  HRAnnouncement,
  CustomFieldDefinition,
  UserProfile,
} from '../types';
import {
  TRUST_ENTITIES,
  INITIAL_DEPARTMENTS,
  INITIAL_CUSTOM_FIELDS,
  INITIAL_EMPLOYEES,
  INITIAL_PROGRAM_ACTIVITIES,
  INITIAL_CONTRACTS,
  INITIAL_DOCUMENTS,
  INITIAL_LEAVE_RECORDS,
  INITIAL_ATTENDANCE,
  INITIAL_TIMESHEETS,
  INITIAL_PERFORMANCE,
  INITIAL_TRAININGS,
  INITIAL_VACANCIES,
  INITIAL_CANDIDATES,
  INITIAL_ANNOUNCEMENTS,
} from '../data/initialData';

export interface Permissions {
  canManageEmployees: boolean;
  canViewAllEntities: boolean;
  canViewSalaries: boolean;
  canManageContracts: boolean;
  canApproveLeave: boolean;
  canApproveTimesheets: boolean;
  canManageRecruitment: boolean;
  canManagePerformance: boolean;
  canManageTrainings: boolean;
  canManageTraining: boolean;
  canManageDocuments: boolean;
  canAccessPayroll: boolean;
  canEditDepartments: boolean;
  canManageDepartments: boolean;
  canManageOrganizations: boolean;
  canManageAnnouncements: boolean;
  canViewAuditReports: boolean;
  canViewAuditLogs: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canViewPayroll: boolean;
  canManagePayroll: boolean;
  isEmployeeOnly: boolean;
  isHealthStaff: boolean;
  isEducationStaff: boolean;
}

interface AppContextType {
  trustName: string;
  tagline: string;
  entities: TrustEntity[];
  selectedEntityFilter: 'All Entities' | TrustEntity;
  setSelectedEntityFilter: (entity: 'All Entities' | TrustEntity) => void;
  currentRole: UserRole;
  currentUser: Employee;
  switchRole: (role: UserRole, employeeId?: string) => void;
  permissions: Permissions;

  // Firebase Auth State
  authUser: User | null;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  isFirestoreConnected: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBulkImportOpen: boolean;
  setIsBulkImportOpen: (open: boolean) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Organization info
  currentOrg: {
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
  };
  updateOrganization: (updates: any) => Promise<void>;
  createOrganization: (org: any) => Promise<void>;

  // Data collections (Live Firestore)
  departments: Department[];
  customFields: CustomFieldDefinition[];
  employees: Employee[];
  projects: any[];
  programActivities: ProgramActivity[];
  documents: DocumentRecord[];
  contracts: ContractRecord[];
  leaveRecords: LeaveRecord[];
  leaveRequests: LeaveRecord[];
  attendance: AttendanceRecord[];
  timesheets: TimesheetRecord[];
  performance: PerformanceRecord[];
  trainings: TrainingRecord[];
  vacancies: Vacancy[];
  candidates: Candidate[];
  announcements: HRAnnouncement[];
  onboarding: any[];
  leaveBalances: Record<string, any>;

  // Employee Lifecycle Mutations
  addEmployee: (emp: Partial<Employee>) => Promise<void>;
  updateEmployee: (id: string, emp: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  deactivateEmployee: (id: string, reason?: string) => Promise<void>;
  reactivateEmployee: (id: string) => Promise<void>;
  archiveEmployee: (id: string) => Promise<void>;

  // Department Mutations
  addDepartment: (dept: Partial<Department>) => Promise<void>;
  updateDepartment: (id: string, dept: Partial<Department>) => Promise<void>;
  deactivateDepartment: (id: string) => Promise<void>;

  // Program Activities
  addProgramActivity: (act: Partial<ProgramActivity>) => Promise<void>;
  updateProgramActivity: (id: string, act: Partial<ProgramActivity>) => Promise<void>;
  deleteProgramActivity: (id: string) => Promise<void>;

  // Custom Fields
  addCustomField: (field: CustomFieldDefinition) => Promise<void>;
  deleteCustomField: (id: string) => Promise<void>;

  // Documents
  uploadDocument: (doc: Partial<DocumentRecord>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;

  // Contracts
  renewContract: (contractId: string, newEndDate: string, newSalary?: number, renewalStatus?: any) => Promise<void>;
  addContract: (contract: ContractRecord) => Promise<void>;

  // Leave
  submitLeave: (leave: Partial<LeaveRecord>) => Promise<void>;
  submitLeaveRequest: (leave: Partial<LeaveRecord>) => Promise<void>;
  approveLeave: (id: string, status: 'Approved' | 'Rejected' | 'Cancelled', comments?: string) => Promise<void>;
  approveLeaveRequest: (id: string, status: any, comments?: string) => Promise<void>;

  // Attendance
  recordAttendance: (status?: any, workMode?: any, location?: string, remarks?: string) => Promise<void>;

  // Timesheets
  submitTimesheet: (ts: Partial<TimesheetRecord>) => Promise<void>;
  approveTimesheet: (id: string, status: 'Approved' | 'Rejected', comments?: string) => Promise<void>;

  // Performance
  updatePerformance: (id: string, updates: Partial<PerformanceRecord>) => Promise<void>;
  updatePerformanceReview: (id: string, updates: Partial<PerformanceRecord>) => Promise<void>;

  // Training
  addTraining: (tr: Partial<TrainingRecord>) => Promise<void>;

  // Recruitment & ATS
  createVacancy: (vac: Partial<Vacancy>) => Promise<void>;
  updateCandidateStage: (candId: string, stage: any, score?: number, notes?: string) => Promise<void>;
  hireCandidate: (candId: string, empDetails?: Partial<Employee>) => Promise<void>;
  convertCandidateToEmployee: (candId: string, empDetails?: Partial<Employee>) => Promise<void>;

  // Onboarding & Notice Board
  toggleOnboardingTask: (checklistId: string, taskId: string) => void;
  addAnnouncement: (ann: Partial<HRAnnouncement>) => Promise<void>;

  // Utilities
  purgeDemoData: () => Promise<any>;
  resetToDemoData: () => Promise<void>;
  seedFirestore: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const trustName = "SPECIAL CHILDREN'S TRUST";
  const tagline = 'Empowering People. Supporting Children. Building Inclusive Communities.';
  const entities = TRUST_ENTITIES;

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Connection & Auth state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState(false);

  const [selectedEntityFilter, setSelectedEntityFilter] = useState<'All Entities' | TrustEntity>('All Entities');

  // Role & active identity
  const [currentRole, setCurrentRole] = useState<UserRole>('System Administrator');
  const [currentUserId, setCurrentUserId] = useState<string>('emp-admin');

  // Live state with initial seed fallbacks
  const [departments, setDepartments] = useState<Department[]>(INITIAL_DEPARTMENTS);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(INITIAL_CUSTOM_FIELDS);
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [programActivities, setProgramActivities] = useState<ProgramActivity[]>(INITIAL_PROGRAM_ACTIVITIES);
  const [contracts, setContracts] = useState<ContractRecord[]>(INITIAL_CONTRACTS);
  const [documents, setDocuments] = useState<DocumentRecord[]>(INITIAL_DOCUMENTS);
  const [leaveRecords, setLeaveRecords] = useState<LeaveRecord[]>(INITIAL_LEAVE_RECORDS);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [timesheets, setTimesheets] = useState<TimesheetRecord[]>(INITIAL_TIMESHEETS);
  const [performance, setPerformance] = useState<PerformanceRecord[]>(INITIAL_PERFORMANCE);
  const [trainings, setTrainings] = useState<TrainingRecord[]>(INITIAL_TRAININGS);
  const [vacancies, setVacancies] = useState<Vacancy[]>(INITIAL_VACANCIES);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [announcements, setAnnouncements] = useState<HRAnnouncement[]>(INITIAL_ANNOUNCEMENTS);

  const [currentOrg, setCurrentOrg] = useState({
    id: 'org-sct',
    name: "Special Children's Trust",
    acronym: 'SCT',
    regNumber: 'NGO-REG/SCT/2026',
    headquarters: 'Secretariat, Plot 14 Bugolobi, Kampala',
    district: 'Kampala',
    currency: 'UGX' as 'UGX' | 'USD',
    logoUrl: '/src/assets/images/sct_official_logo.svg',
    customFields: [
      { id: 'cf-1', name: 'Uganda Allied Health Council Reg No.', type: 'text' },
      { id: 'cf-2', name: 'Ministry of Education Special Needs Cert No.', type: 'text' },
      { id: 'cf-3', name: 'Interpol Police Clearance Certificate Ref', type: 'text' },
    ],
  });

  const projects = useMemo(() => [
    {
      id: 'proj-001',
      name: 'Pediatric Rehabilitation & Assistive Mobility Program',
      code: 'SCT-HEALTH-PRM',
      entity: 'Berakhah Medical Center' as TrustEntity,
      department: 'Health',
      donor: 'USAID Uganda & Global Disability Innovation Fund',
      grant: 'USAID-UG-DIS-2025-04',
      budget: 450000000,
      currency: 'UGX' as const,
      status: 'Active',
      lead: 'Lead Clinician',
      location: 'Berakhah Medical Center — Kimanya, Wakiso',
    },
    {
      id: 'proj-002',
      name: 'Inclusive Early Childhood Education Classrooms (IECE)',
      code: 'SCT-EDU-IECE',
      entity: "Dawn Children's Centre" as TrustEntity,
      department: 'Education',
      donor: 'UNICEF Uganda & DFID Inclusion Partnership',
      grant: 'UNICEF-UG-EDU-8812',
      budget: 320000000,
      currency: 'UGX' as const,
      status: 'Active',
      lead: 'Lead Educator',
      location: 'Dawn Children’s Centre — Bukoto',
    },
    {
      id: 'proj-003',
      name: 'Family Sustainable Livelihoods & Sensory Village',
      code: 'SCT-SEE-FSL',
      entity: 'Mukisa Inclusive Village' as TrustEntity,
      department: 'Social and Economic Employment',
      donor: 'Ford Foundation & African Development Bank (AfDB)',
      grant: 'FF-EASTAFR-2024-09',
      budget: 680000000,
      currency: 'UGX' as const,
      status: 'Active',
      lead: 'Community Lead',
      location: 'Mukisa Inclusive Village — Bussi Island',
    },
    {
      id: 'proj-004',
      name: 'Sanitation, Meal Services & Facility Maintenance Program',
      code: 'SCT-HSK-SMF',
      entity: 'Mukisa Foundation' as TrustEntity,
      department: 'House Keeping',
      donor: 'Special Children’s Trust Core Operations',
      grant: 'SCT-CORE-OPS-2026',
      budget: 180000000,
      currency: 'UGX' as const,
      status: 'Active',
      lead: 'Operations Coordinator',
      location: 'Mukisa Foundation — Lungujja',
    },
  ], []);

  // 1. Initial Firestore connection test & Auth listener
  useEffect(() => {
    let isMounted = true;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        setIsFirestoreConnected(true);
        testFirestoreConnection().then((connected) => {
          if (isMounted && connected) setIsFirestoreConnected(true);
        });
        // Fetch or create profile
        try {
          const userDocRef = doc(db, COLLECTIONS.USERS, user.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            const prof = snap.data() as UserProfile;
            setUserProfile(prof);
            setCurrentRole(prof.role);
          } else {
            // Create user profile in Firestore
            const isSystemAdmin = user.email === 'nassozishamim50@gmail.com';
            const defaultRole: UserRole = isSystemAdmin ? 'System Administrator' : 'Employee';
            const newProfile = await createOrUpdateHRUserProfile({
              userId: user.uid,
              fullName: user.displayName || (isSystemAdmin ? 'Shamim Nassodzi' : user.email?.split('@')[0] || 'Staff Member'),
              entity: "Special Children's Trust",
              dutyStation: 'Mukisa Foundation — Lungujja',
              department: 'Administration',
              jobTitle: isSystemAdmin ? 'Lead Trust Systems Director' : 'Staff Member',
              role: defaultRole,
              email: user.email || '',
              phone: '+256 700 000000',
            });
            setUserProfile(newProfile);
            setCurrentRole(defaultRole);
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
        }
      } else {
        setUserProfile(null);
      }
      setIsAuthReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
    };
  }, []);

  // 2. Attach live Firestore snapshot listeners
  useEffect(() => {
    if (!authUser) {
      return;
    }

    // Check if initial seeding needed (only for Primary Administrator)
    if (authUser.email === 'nassozishamim50@gmail.com') {
      ensureStandardDepartmentsInFirestore().catch((err) => {
        console.warn('Department ensure check:', err);
      });
      purgeDemoDataFromFirestore().catch((err) => {
        console.warn('Demo data purge:', err);
      });
    }

    // Live Employees
    const unsubEmployees = onSnapshot(
      collection(db, COLLECTIONS.EMPLOYEES),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Employee[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as any;
            if (!isDemoEmployee(d.id, data)) {
              items.push({ id: d.id, ...data });
            }
          });
          setEmployees(items);
        } else {
          setEmployees([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.EMPLOYEES} error:`, error.message);
      }
    );

    // Live Departments
    const unsubDepartments = onSnapshot(
      collection(db, COLLECTIONS.DEPARTMENTS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Department[] = [];
          snapshot.forEach((d) => items.push({ id: d.id, ...(d.data() as any) }));
          // Guarantee that all standard departments (Health, Education, SEE, Administration, House Keeping, Security) are present without duplication
          const merged = [...items];
          for (const initDept of INITIAL_DEPARTMENTS) {
            if (!merged.some(d => d.name.toLowerCase() === initDept.name.toLowerCase() || d.id === initDept.id)) {
              merged.push(initDept);
            }
          }
          setDepartments(merged);
        } else {
          setDepartments(INITIAL_DEPARTMENTS);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.DEPARTMENTS} error:`, error.message);
      }
    );

    // Live Leave Requests
    const unsubLeave = onSnapshot(
      collection(db, COLLECTIONS.LEAVE_REQUESTS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: LeaveRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setLeaveRecords(items);
        } else {
          setLeaveRecords([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.LEAVE_REQUESTS} error:`, error.message);
      }
    );

    // Live Attendance
    const unsubAttendance = onSnapshot(
      collection(db, COLLECTIONS.ATTENDANCE),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: AttendanceRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setAttendance(items);
        } else {
          setAttendance([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.ATTENDANCE} error:`, error.message);
      }
    );

    // Live Documents
    const unsubDocuments = onSnapshot(
      collection(db, COLLECTIONS.DOCUMENTS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: DocumentRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setDocuments(items);
        } else {
          setDocuments([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.DOCUMENTS} error:`, error.message);
      }
    );

    // Live Training
    const unsubTraining = onSnapshot(
      collection(db, COLLECTIONS.TRAINING),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TrainingRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setTrainings(items);
        } else {
          setTrainings([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.TRAINING} error:`, error.message);
      }
    );

    // Live Performance
    const unsubPerformance = onSnapshot(
      collection(db, COLLECTIONS.PERFORMANCE_REVIEWS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: PerformanceRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setPerformance(items);
        } else {
          setPerformance([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.PERFORMANCE_REVIEWS} error:`, error.message);
      }
    );

    // Live Recruitment Candidates
    const unsubRecruitment = onSnapshot(
      collection(db, COLLECTIONS.RECRUITMENT),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Candidate[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRecordId(d.id) && !(d.data() as any)?.isDemo) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setCandidates(items);
        } else {
          setCandidates([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.RECRUITMENT} error:`, error.message);
      }
    );

    // Live Positions / Vacancies
    const unsubVacancies = onSnapshot(
      collection(db, COLLECTIONS.POSITIONS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: Vacancy[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRecordId(d.id) && !(d.data() as any)?.isDemo) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setVacancies(items);
        } else {
          setVacancies([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.POSITIONS} error:`, error.message);
      }
    );

    // Live Contracts / Payroll Records
    const unsubContracts = onSnapshot(
      collection(db, COLLECTIONS.PAYROLL_RECORDS),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: ContractRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setContracts(items);
        } else {
          setContracts([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.PAYROLL_RECORDS} error:`, error.message);
      }
    );

    // Live Timesheets / Onboarding
    const unsubTimesheets = onSnapshot(
      collection(db, COLLECTIONS.ONBOARDING),
      (snapshot) => {
        if (!snapshot.empty) {
          const items: TimesheetRecord[] = [];
          snapshot.forEach((d) => {
            if (!isDemoRelatedRecord(d.id, d.data())) {
              items.push({ id: d.id, ...(d.data() as any) });
            }
          });
          setTimesheets(items);
        } else {
          setTimesheets([]);
        }
      },
      (error) => {
        console.warn(`Firestore onSnapshot ${COLLECTIONS.ONBOARDING} error:`, error.message);
      }
    );

    return () => {
      unsubEmployees();
      unsubDepartments();
      unsubLeave();
      unsubAttendance();
      unsubDocuments();
      unsubTraining();
      unsubPerformance();
      unsubRecruitment();
      unsubVacancies();
      unsubContracts();
      unsubTimesheets();
    };
  }, [authUser]);

  // Compute Current User object
  const currentUser = useMemo(() => {
    const found = employees.find(
      (e) =>
        e.id === currentUserId ||
        (authUser && (e.email === authUser.email || e.uid === authUser.uid || e.userId === authUser.uid))
    );
    if (found) return found;

    if (userProfile && authUser) {
      const names = (userProfile.fullName || '').trim().split(/\s+/);
      const isSysAdmin = userProfile.email === 'nassozishamim50@gmail.com' || userProfile.role === 'System Administrator';
      const userObj: Employee = {
        id: isSysAdmin ? 'emp-admin' : (userProfile.uid || authUser.uid),
        employeeId: isSysAdmin ? 'emp-admin' : (userProfile.uid || authUser.uid),
        employeeNumber: isSysAdmin ? 'SCT-HQ-001' : `SCT-${authUser.uid.slice(-6).toUpperCase()}`,
        firstName: names[0] || (isSysAdmin ? 'Shamim' : 'Staff'),
        lastName: names.slice(1).join(' ') || (isSysAdmin ? 'Nassodzi' : 'Member'),
        email: userProfile.email,
        phone: userProfile.phone || '+256 700 000000',
        gender: isSysAdmin ? 'Female' : 'Other',
        dateOfBirth: '1988-06-15',
        nationality: 'Ugandan',
        nationalIdNumber: 'CM880000000000',
        maritalStatus: 'Married',
        residentialAddress: 'Kampala, Uganda',
        district: 'Kampala',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '+256 700 000001',
        },
        entity: (userProfile.entity || userProfile.organization || 'Mukisa Foundation') as TrustEntity,
        department: userProfile.department || 'Administration',
        departmentId: 'dept-admin',
        jobTitle: userProfile.jobTitle || (isSysAdmin ? 'Lead Trust Systems Director' : 'HR Professional'),
        position: userProfile.jobTitle || (isSysAdmin ? 'Lead Trust Systems Director' : 'HR Professional'),
        employeeCategory: isSysAdmin ? 'Executive' : 'Administrative',
        employmentType: 'Permanent',
        employmentStatus: 'Active',
        dateOfJoining: '2020-01-01',
        dutyStation: userProfile.dutyStation || 'Mukisa Foundation — Lungujja',
        supervisor: isSysAdmin ? 'Board of Trustees' : 'Primary Administrator',
        supervisorId: 'board',
        currency: 'UGX',
      };
      return userObj;
    }

    const fallbackAdmin: Employee = {
      id: 'emp-admin',
      employeeId: 'emp-admin',
      employeeNumber: 'SCT-HQ-001',
      firstName: 'Shamim',
      lastName: 'Nassodzi',
      email: 'nassozishamim50@gmail.com',
      phone: '+256 700 000000',
      gender: 'Female',
      dateOfBirth: '1988-06-15',
      nationality: 'Ugandan',
      nationalIdNumber: 'CM880000000000',
      maritalStatus: 'Married',
      residentialAddress: 'Kampala, Uganda',
      district: 'Kampala',
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Family',
        phone: '+256 700 000001',
      },
      entity: 'Mukisa Foundation',
      department: 'Administration',
      departmentId: 'dept-admin',
      jobTitle: 'Lead Trust Systems Director',
      position: 'Lead Trust Systems Director',
      employeeCategory: 'Executive',
      employmentType: 'Permanent',
      employmentStatus: 'Active',
      dateOfJoining: '2020-01-01',
      dutyStation: 'Mukisa Foundation — Lungujja',
      supervisor: 'Board of Trustees',
      supervisorId: 'board',
      currency: 'UGX',
    };

    return employees[0] || fallbackAdmin;
  }, [employees, currentUserId, authUser, userProfile]);

  // Compute Permissions based on current role
  const permissions: Permissions = useMemo(() => {
    const isSysAdmin = currentRole === 'System Administrator' || currentRole === 'SUPER_ADMIN';
    const isHrAdmin = currentRole === 'HR Administrator' || currentRole === 'HR_MANAGER';
    const isExec = currentRole === 'Executive/Director' || currentRole === 'TRUST_DIRECTOR' || currentRole === 'ENTITY_DIRECTOR';
    const isDeptHead = currentRole === 'Department Head';
    const isHrOfficer = currentRole === 'HR Officer';
    const isEmployee = currentRole === 'Employee';

    const isAnyAdmin = isSysAdmin || isHrAdmin;
    const isAnyHR = isAnyAdmin || isHrOfficer;

    return {
      canManageEmployees: isAnyHR,
      canViewAllEntities: isAnyAdmin || isExec,
      canViewSalaries: isAnyAdmin || isExec,
      canManageContracts: isAnyHR,
      canApproveLeave: isAnyAdmin || isDeptHead || isExec,
      canApproveTimesheets: isAnyAdmin || isDeptHead,
      canManageRecruitment: isAnyHR,
      canManagePerformance: isAnyHR || isDeptHead,
      canManageTrainings: isAnyHR,
      canManageTraining: isAnyHR,
      canManageDocuments: isAnyHR,
      canAccessPayroll: isAnyAdmin,
      canEditDepartments: isSysAdmin,
      canManageDepartments: isSysAdmin,
      canManageOrganizations: isSysAdmin,
      canManageAnnouncements: isAnyHR || isExec,
      canViewAuditReports: isSysAdmin || isExec,
      canViewAuditLogs: isSysAdmin,
      canManageUsers: isSysAdmin,
      canManageSettings: isSysAdmin,
      canViewPayroll: isAnyAdmin,
      canManagePayroll: isSysAdmin,
      isEmployeeOnly: isEmployee,
      isHealthStaff: currentUser.department.toLowerCase().includes('health'),
      isEducationStaff: currentUser.department.toLowerCase().includes('education'),
    };
  }, [currentRole, currentUser]);

  const switchRole = (role: UserRole, employeeId?: string) => {
    // Only real System Administrators or HR Administrators can switch roles to inspect other perspectives
    const isRealAdmin =
      userProfile?.role === 'System Administrator' ||
      userProfile?.role === 'HR Administrator' ||
      authUser?.email === 'nassozishamim50@gmail.com';
    if (authUser && !isRealAdmin) {
      console.warn('Unauthorized role switch attempt blocked. Firestore security rules enforce role assigned in /users.');
      return;
    }
    setCurrentRole(role);
    if (employeeId) {
      setCurrentUserId(employeeId);
    }
  };

  // ==========================================
  // EMPLOYEE MUTATIONS (Firestore Live)
  // ==========================================
  const addEmployee = async (emp: Partial<Employee>) => {
    const path = COLLECTIONS.EMPLOYEES;
    try {
      const newId = `emp-${Date.now()}`;
      const newEmp: Employee = {
        id: newId,
        employeeId: newId,
        employeeNumber:
          emp.employeeNumber ||
          `SCT-${(emp.entity || 'MF').split(' ').map((w) => w[0]).join('')}-${String(employees.length + 1).padStart(3, '0')}`,
        firstName: emp.firstName || 'Staff',
        middleName: emp.middleName || '',
        lastName: emp.lastName || 'Member',
        preferredName: emp.preferredName,
        gender: emp.gender || 'Female',
        dateOfBirth: emp.dateOfBirth || '1995-01-01',
        nationality: emp.nationality || 'Ugandan',
        nationalIdNumber: emp.nationalIdNumber || 'CF000000000000',
        maritalStatus: emp.maritalStatus || 'Single',
        phone: emp.phone || '+256 700 000000',
        email: emp.email || `staff.${Date.now()}@specialchildrenstrust.org`,
        residentialAddress: emp.residentialAddress || 'Kampala, Uganda',
        district: emp.district || 'Kampala',
        emergencyContact: emp.emergencyContact || {
          name: 'Emergency Contact',
          relationship: 'Kin',
          phone: '+256 700 000000',
        },
        entity: emp.entity || 'Mukisa Foundation',
        department: emp.department || 'Health',
        departmentId: emp.departmentId || departments.find(d => d.name.toLowerCase() === (emp.department || '').toLowerCase())?.id || 'dept-health',
        departmentHead: emp.departmentHead || departments.find(d => d.name.toLowerCase() === (emp.department || '').toLowerCase())?.departmentHead || 'Department Head',
        jobTitle: emp.jobTitle || 'Specialized Officer',
        position: emp.position || emp.jobTitle || 'Specialized Officer',
        employeeCategory: emp.employeeCategory || 'Clinical Staff',
        employmentType: emp.employmentType || 'Contract',
        employmentStatus: emp.employmentStatus || 'Active',
        dateOfJoining: emp.dateOfJoining || new Date().toISOString().split('T')[0],
        contractEndDate: emp.contractEndDate || '2027-12-31',
        dutyStation: emp.dutyStation || 'Mukisa Foundation — Lungujja',
        supervisor: emp.supervisor || 'Department Head',
        currency: emp.currency || 'UGX',
        basicSalary: emp.basicSalary || 3500000,
        safeguardingPoliceClearanceNo: emp.safeguardingPoliceClearanceNo || 'POL-SEC-2026-UG',
        safeguardingClearanceExpiry: emp.safeguardingClearanceExpiry || '2027-12-31',
        pseaTrained: emp.pseaTrained !== undefined ? emp.pseaTrained : true,
      };

      await setDoc(doc(db, COLLECTIONS.EMPLOYEES, newId), newEmp);

      await recordAuditLog(
        'Employee Created',
        'Employee',
        `Created staff profile for ${newEmp.firstName} ${newEmp.lastName} (${newEmp.employeeNumber}) under ${newEmp.entity}.`,
        'employees',
        newId
      );

      await sendNotification({
        recipientUid: 'all',
        title: 'New Staff Member Welcomed',
        message: `${newEmp.firstName} ${newEmp.lastName} has joined ${newEmp.entity} as ${newEmp.jobTitle}.`,
        type: 'info',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateEmployee = async (id: string, emp: Partial<Employee>) => {
    const path = `${COLLECTIONS.EMPLOYEES}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, id), {
        ...emp,
        updatedAt: new Date().toISOString(),
      });

      await recordAuditLog(
        'Employee Updated',
        'Employee',
        `Updated staff record ID ${id} with revised details.`,
        'employees',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deactivateEmployee = async (id: string, reason?: string) => {
    const path = `${COLLECTIONS.EMPLOYEES}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, id), {
        employmentStatus: 'Inactive',
        deactivatedAt: new Date().toISOString(),
        deactivationReason: reason || 'Administrative Deactivation',
      });

      await recordAuditLog(
        'Employee Deactivated',
        'Employee',
        `Staff ID ${id} deactivated. Reason: ${reason || 'Administrative Deactivation'}.`,
        'employees',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const reactivateEmployee = async (id: string) => {
    const path = `${COLLECTIONS.EMPLOYEES}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, id), {
        employmentStatus: 'Active',
        reactivatedAt: new Date().toISOString(),
      });

      await recordAuditLog(
        'Employee Reactivated',
        'Employee',
        `Staff ID ${id} restored to Active status.`,
        'employees',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const archiveEmployee = async (id: string) => {
    const path = `${COLLECTIONS.EMPLOYEES}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.EMPLOYEES, id), {
        employmentStatus: 'Archived',
        archivedAt: new Date().toISOString(),
      });

      await recordAuditLog(
        'Employee Archived',
        'Employee',
        `Staff ID ${id} moved to compliance archive.`,
        'employees',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteEmployee = async (id: string) => {
    // Soft-deactivate by default as required by Prompt 14
    await archiveEmployee(id);
  };

  // ==========================================
  // DEPARTMENT MUTATIONS
  // ==========================================
  const addDepartment = async (dept: Partial<Department>) => {
    const path = COLLECTIONS.DEPARTMENTS;
    try {
      const newId = `dept-${Date.now()}`;
      const newDept: Department = {
        id: newId,
        name: dept.name || 'Specialized Department',
        code: dept.code || 'SCT-DEPT',
        departmentHead: dept.departmentHead || 'Trust Directorate',
        departmentHeadId: dept.departmentHeadId || 'admin',
        description: dept.description || 'Special Children\'s Trust specialized department',
        status: 'Active',
        locations: dept.locations || ['Trust Secretariat'],
        programsCount: 0,
        projectsCount: 0,
        activitiesCount: 0,
      };

      await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, newId), newDept);

      await recordAuditLog(
        'Department Created',
        'Department',
        `Department ${newDept.name} registered under Special Children's Trust.`,
        'departments',
        newId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateDepartment = async (id: string, dept: Partial<Department>) => {
    const path = `${COLLECTIONS.DEPARTMENTS}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.DEPARTMENTS, id), dept);
      await recordAuditLog(
        'Department Updated',
        'Department',
        `Department ${id} configuration modified.`,
        'departments',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deactivateDepartment = async (id: string) => {
    const dept = departments.find((d) => d.id === id);
    if (!dept) return;
    const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
    await updateDepartment(id, { status: newStatus });
  };

  // ==========================================
  // PROGRAM ACTIVITIES
  // ==========================================
  const addProgramActivity = async (act: Partial<ProgramActivity>) => {
    const newAct: ProgramActivity = {
      id: `act-${Date.now()}`,
      entity: act.entity || 'Mukisa Foundation',
      department: act.department || 'Health',
      title: act.title || 'New Program Activity',
      category: act.category || 'Specialized Support',
      description: act.description || 'Community and specialized developmental support.',
      responsibleStaff: act.responsibleStaff || `${currentUser.firstName} ${currentUser.lastName}`,
      responsibleStaffId: act.responsibleStaffId || currentUser.id,
      location: act.location || "Special Children's Trust Hub",
      startDate: act.startDate || new Date().toISOString().split('T')[0],
      endDate: act.endDate || '2026-12-31',
      status: act.status || 'Active',
      beneficiaryCount: act.beneficiaryCount || 50,
      notes: act.notes,
      partnerOrganization: act.partnerOrganization,
    };
    setProgramActivities((prev) => [newAct, ...prev]);
  };

  const updateProgramActivity = async (id: string, act: Partial<ProgramActivity>) => {
    setProgramActivities((prev) => prev.map((a) => (a.id === id ? { ...a, ...act } : a)));
  };

  const deleteProgramActivity = async (id: string) => {
    setProgramActivities((prev) => prev.filter((a) => a.id !== id));
  };

  // ==========================================
  // CUSTOM FIELDS
  // ==========================================
  const addCustomField = async (field: CustomFieldDefinition) => {
    setCustomFields((prev) => [...prev, field]);
  };

  const deleteCustomField = async (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  // ==========================================
  // DOCUMENTS
  // ==========================================
  const uploadDocument = async (docRecord: Partial<DocumentRecord>) => {
    const path = COLLECTIONS.DOCUMENTS;
    try {
      const newId = `doc-${Date.now()}`;
      const newDoc: DocumentRecord = {
        id: newId,
        employeeId: docRecord.employeeId || currentUser.id,
        employeeUid: authUser?.uid || currentUser.id,
        employeeEmail: authUser?.email || currentUser.email,
        employeeName: docRecord.employeeName || `${currentUser.firstName} ${currentUser.lastName}`,
        entity: docRecord.entity || currentUser.entity,
        documentName: docRecord.documentName || 'Confidential Personnel Document',
        documentType: docRecord.documentType || 'Employment Contract',
        fileName: docRecord.fileName || 'document.pdf',
        fileSize: docRecord.fileSize || '1.2 MB',
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: docRecord.expiryDate,
        uploadedBy: `${currentUser.firstName} ${currentUser.lastName}`,
        version: '1.0',
        status: 'Valid',
      };

      await setDoc(doc(db, COLLECTIONS.DOCUMENTS, newId), newDoc);

      await recordAuditLog(
        'Document Registered',
        'Document',
        `Document '${newDoc.documentName}' (${newDoc.documentType}) recorded for staff ${newDoc.employeeName}.`,
        'documents',
        newId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const deleteDocument = async (id: string) => {
    const path = `${COLLECTIONS.DOCUMENTS}/${id}`;
    try {
      await deleteDoc(doc(db, COLLECTIONS.DOCUMENTS, id));
      await recordAuditLog(
        'Document Deleted',
        'Document',
        `Document record ${id} removed by authorized staff.`,
        'documents',
        id
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // ==========================================
  // CONTRACTS
  // ==========================================
  const renewContract = async (
    contractId: string,
    newEndDate: string,
    newSalary?: number,
    renewalStatus: any = 'Renewed'
  ) => {
    const path = `${COLLECTIONS.PAYROLL_RECORDS}/${contractId}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.PAYROLL_RECORDS, contractId), {
        endDate: newEndDate,
        renewalStatus,
        salary: newSalary !== undefined ? newSalary : undefined,
        renewedAt: new Date().toISOString(),
      });

      await recordAuditLog(
        'Contract Renewed',
        'Employee',
        `Contract ${contractId} extended to ${newEndDate}.`,
        'payrollRecords',
        contractId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const addContract = async (contract: ContractRecord) => {
    await setDoc(doc(db, COLLECTIONS.PAYROLL_RECORDS, contract.id), contract);
  };

  // ==========================================
  // LEAVE APPLICATIONS
  // ==========================================
  const submitLeave = async (leave: Partial<LeaveRecord>) => {
    const path = COLLECTIONS.LEAVE_REQUESTS;
    try {
      const newId = `lv-${Date.now()}`;
      const newLeave: LeaveRecord = {
        id: newId,
        employeeId: leave.employeeId || currentUser.id,
        employeeUid: authUser?.uid || currentUser.id,
        employeeEmail: authUser?.email || currentUser.email,
        employeeName: leave.employeeName || `${currentUser.firstName} ${currentUser.lastName}`,
        entity: leave.entity || currentUser.entity,
        department: leave.department || currentUser.department,
        leaveType: leave.leaveType || 'Annual Leave',
        startDate: leave.startDate || new Date().toISOString().split('T')[0],
        endDate: leave.endDate || new Date().toISOString().split('T')[0],
        numberOfDays: leave.numberOfDays || 3,
        reason: leave.reason || 'Rest and personal commitments',
        status: 'Pending',
      };

      await setDoc(doc(db, COLLECTIONS.LEAVE_REQUESTS, newId), newLeave);

      await recordAuditLog(
        'Leave Application Submitted',
        'Leave',
        `${newLeave.employeeName} applied for ${newLeave.numberOfDays} days ${newLeave.leaveType}.`,
        'leaveRequests',
        newId
      );

      await sendNotification({
        recipientUid: 'all',
        title: 'New Leave Application',
        message: `${newLeave.employeeName} submitted a leave request for ${newLeave.numberOfDays} days starting ${newLeave.startDate}.`,
        type: 'leave',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const submitLeaveRequest = submitLeave;

  const approveLeave = async (
    id: string,
    status: 'Approved' | 'Rejected' | 'Cancelled',
    comments?: string
  ) => {
    const path = `${COLLECTIONS.LEAVE_REQUESTS}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.LEAVE_REQUESTS, id), {
        status,
        approver: `${currentUser.firstName} ${currentUser.lastName}`,
        approvalDate: new Date().toISOString().split('T')[0],
        comments: comments || '',
      });

      await recordAuditLog(
        `Leave ${status}`,
        'Leave',
        `Leave ID ${id} was marked as ${status} by ${currentUser.firstName} ${currentUser.lastName}.`,
        'leaveRequests',
        id
      );

      await sendNotification({
        recipientUid: 'all',
        title: `Leave Application ${status}`,
        message: `Leave application #${id} has been ${status.toLowerCase()} by management.`,
        type: 'leave',
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const approveLeaveRequest = approveLeave;

  // ==========================================
  // ATTENDANCE
  // ==========================================
  const recordAttendance = async (
    status: any = 'Present',
    workMode: any = 'Office',
    location?: string,
    remarks?: string
  ) => {
    const path = COLLECTIONS.ATTENDANCE;
    try {
      const today = new Date().toISOString().split('T')[0];
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newId = `att-${Date.now()}`;
      const newAtt: AttendanceRecord = {
        id: newId,
        employeeId: currentUser.id,
        employeeUid: authUser?.uid || currentUser.id,
        employeeEmail: authUser?.email || currentUser.email,
        employeeName: `${currentUser.firstName} ${currentUser.lastName}`,
        date: today,
        checkInTime: time,
        status,
        workMode,
        location: location || currentUser.dutyStation,
        remarks: remarks || `Checked in at ${location || currentUser.dutyStation}`,
      };

      await setDoc(doc(db, COLLECTIONS.ATTENDANCE, newId), newAtt);

      await recordAuditLog(
        'Daily Attendance Logged',
        'Employee',
        `${currentUser.firstName} ${currentUser.lastName} marked attendance: ${status} (${workMode}).`,
        'attendance',
        newId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // ==========================================
  // TIMESHEETS
  // ==========================================
  const submitTimesheet = async (ts: Partial<TimesheetRecord>) => {
    const newTs: TimesheetRecord = {
      id: `ts-${Date.now()}`,
      employeeId: ts.employeeId || currentUser.id,
      employeeName: ts.employeeName || `${currentUser.firstName} ${currentUser.lastName}`,
      entity: ts.entity || currentUser.entity,
      department: ts.department || currentUser.department,
      date: ts.date || new Date().toISOString().split('T')[0],
      hours: ts.hours || 8,
      activity: ts.activity || 'Direct support',
      location: ts.location || currentUser.dutyStation,
      description: ts.description || 'Program implementation',
      supervisor: ts.supervisor || currentUser.supervisor,
      approvalStatus: 'Pending',
    };
    setTimesheets((prev) => [newTs, ...prev]);
  };

  const approveTimesheet = async (id: string, status: 'Approved' | 'Rejected', comments?: string) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              approvalStatus: status,
              approvalDate: new Date().toISOString().split('T')[0],
              comments: comments || t.comments,
            }
          : t
      )
    );
  };

  // ==========================================
  // PERFORMANCE
  // ==========================================
  const updatePerformance = async (id: string, updates: Partial<PerformanceRecord>) => {
    const path = `${COLLECTIONS.PERFORMANCE_REVIEWS}/${id}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.PERFORMANCE_REVIEWS, id), updates);
    } catch (e) {
      setPerformance((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
  };

  const updatePerformanceReview = updatePerformance;

  // ==========================================
  // TRAINING
  // ==========================================
  const addTraining = async (tr: Partial<TrainingRecord>) => {
    const path = COLLECTIONS.TRAINING;
    try {
      const newId = `tr-${Date.now()}`;
      const newTr: TrainingRecord = {
        id: newId,
        employeeId: tr.employeeId || currentUser.id,
        employeeName: tr.employeeName || `${currentUser.firstName} ${currentUser.lastName}`,
        entity: tr.entity || currentUser.entity,
        department: tr.department || currentUser.department,
        trainingTitle: tr.trainingTitle || 'Special Needs Safeguarding & Inclusion',
        trainingCategory: tr.trainingCategory || 'Safeguarding & Child Protection',
        provider: tr.provider || "Special Children's Trust Training Academy",
        startDate: tr.startDate || new Date().toISOString().split('T')[0],
        endDate: tr.endDate || new Date().toISOString().split('T')[0],
        cost: tr.cost || 500000,
        currency: 'UGX',
        certificate: tr.certificate || `SCT-CERT-${Date.now().toString().slice(-5)}`,
        expiryDate: tr.expiryDate,
        skillsAcquired: tr.skillsAcquired || 'Inclusive practices and safety protocols',
        remarks: tr.remarks,
        status: 'Completed',
      };

      await setDoc(doc(db, COLLECTIONS.TRAINING, newId), newTr);

      await recordAuditLog(
        'Training Certificate Recorded',
        'Employee',
        `Safeguarding certification logged for ${newTr.employeeName}: ${newTr.trainingTitle}.`,
        'training',
        newId
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  // ==========================================
  // RECRUITMENT & ATS
  // ==========================================
  const createVacancy = async (vac: Partial<Vacancy>) => {
    const newVac: Vacancy = {
      id: `vac-${Date.now()}`,
      vacancyNumber:
        vac.vacancyNumber ||
        `SCT/VAC/${new Date().getFullYear()}/${String(vacancies.length + 1).padStart(2, '0')}`,
      position: vac.position || 'Special Needs Therapist / Educator',
      department: vac.department || 'Health',
      entity: vac.entity || 'Berakhah Medical Center',
      jobDescription:
        vac.jobDescription || 'Dedicated professional supporting children with complex special needs.',
      minimumQualifications:
        vac.minimumQualifications || 'Recognized qualification with professional practicing certificate.',
      experience: vac.experience || '2+ years working with neurodiverse children.',
      closingDate: vac.closingDate || '2026-11-30',
      hiringManager: vac.hiringManager || `${currentUser.firstName} ${currentUser.lastName}`,
      status: 'Open',
      openings: vac.openings || 1,
      applicantCount: 0,
    };
    try {
      await setDoc(doc(db, COLLECTIONS.POSITIONS, newVac.id), newVac);
    } catch {
      setVacancies((prev) => [newVac, ...prev]);
    }
  };

  const updateCandidateStage = async (candId: string, stage: any, score?: number, notes?: string) => {
    const path = `${COLLECTIONS.RECRUITMENT}/${candId}`;
    try {
      await updateDoc(doc(db, COLLECTIONS.RECRUITMENT, candId), {
        stage,
        interviewScore: score,
        interviewNotes: notes,
      });
    } catch (e) {
      setCandidates((prev) =>
        prev.map((c) =>
          c.id === candId
            ? {
                ...c,
                stage,
                interviewScore: score !== undefined ? score : c.interviewScore,
                interviewNotes: notes !== undefined ? notes : c.interviewNotes,
              }
            : c
        )
      );
    }
  };

  const hireCandidate = async (candId: string, empDetails?: Partial<Employee>) => {
    const candidate = candidates.find((c) => c.id === candId);
    if (!candidate) return;

    const names = candidate.fullName.split(' ');
    const firstName = names[0] || 'Staff';
    const lastName = names.slice(1).join(' ') || 'Candidate';

    await addEmployee({
      firstName,
      lastName,
      email: candidate.email,
      phone: candidate.phone,
      entity: candidate.entity,
      jobTitle: candidate.vacancyPosition,
      ...empDetails,
    });

    await updateCandidateStage(candId, 'Hired');
  };

  const convertCandidateToEmployee = hireCandidate;

  const toggleOnboardingTask = (checklistId: string, taskId: string) => {
    // Local toggle
  };

  const addAnnouncement = async (ann: Partial<HRAnnouncement>) => {
    const newAnn: HRAnnouncement = {
      id: `ann-${Date.now()}`,
      title: ann.title || "Special Children's Trust Notice",
      entity: ann.entity || 'All Entities',
      category: ann.category || 'General',
      content: ann.content || '',
      publishedDate: new Date().toISOString().split('T')[0],
      author: `${currentUser.firstName} ${currentUser.lastName}`,
      isImportant: ann.isImportant || false,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const updateOrganization = async (updates: any) => {
    setCurrentOrg((prev) => ({ ...prev, ...updates }));
    await setDoc(doc(db, COLLECTIONS.SYSTEM_SETTINGS, 'general'), updates, { merge: true });
  };

  const createOrganization = async (org: any) => {
    await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, org.id || `org-${Date.now()}`), org);
  };

  const purgeDemoData = async () => {
    const res = await purgeDemoDataFromFirestore();
    setEmployees([]);
    setContracts([]);
    setDocuments([]);
    setLeaveRecords([]);
    setAttendance([]);
    setTimesheets([]);
    setPerformance([]);
    setTrainings([]);
    setVacancies([]);
    setCandidates([]);
    setAnnouncements([]);
    setProgramActivities([]);
    return res;
  };

  const resetToDemoData = async () => {
    await purgeDemoData();
  };

  const seedFirestore = async () => {
    await seedInitialFirestoreData();
  };

  return (
    <AppContext.Provider
      value={{
        trustName,
        tagline,
        entities,
        selectedEntityFilter,
        setSelectedEntityFilter,
        currentRole,
        currentUser,
        switchRole,
        permissions,

        authUser,
        userProfile,
        isAuthReady,
        isFirestoreConnected,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isBulkImportOpen,
        setIsBulkImportOpen,
        isNotificationsOpen,
        setIsNotificationsOpen,

        currentOrg,
        updateOrganization,
        createOrganization,

        departments,
        customFields,
        employees,
        projects,
        programActivities,
        documents,
        contracts,
        leaveRecords,
        leaveRequests: leaveRecords,
        attendance,
        timesheets,
        performance,
        trainings,
        vacancies,
        candidates,
        announcements,
        onboarding: [],
        leaveBalances: {},

        addEmployee,
        updateEmployee,
        deleteEmployee,
        deactivateEmployee,
        reactivateEmployee,
        archiveEmployee,

        addDepartment,
        updateDepartment,
        deactivateDepartment,

        addProgramActivity,
        updateProgramActivity,
        deleteProgramActivity,

        addCustomField,
        deleteCustomField,

        uploadDocument,
        deleteDocument,

        renewContract,
        addContract,

        submitLeave,
        submitLeaveRequest,
        approveLeave,
        approveLeaveRequest,

        recordAttendance,

        submitTimesheet,
        approveTimesheet,

        updatePerformance,
        updatePerformanceReview,

        addTraining,

        createVacancy,
        updateCandidateStage,
        hireCandidate,
        convertCandidateToEmployee,

        toggleOnboardingTask,
        addAnnouncement,

        purgeDemoData,
        resetToDemoData,
        seedFirestore,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
