import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage, handleFirestoreError, OperationType } from '../firebase/config';
import {
  Employee,
  Department,
  ProgramActivity,
  ContractRecord,
  DocumentRecord,
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
  AuditLog,
  TrustEntity,
  UserRole,
  DutyStation,
  DUTY_STATIONS,
} from '../types';
import {
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
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
  INITIAL_CUSTOM_FIELDS,
} from '../data/initialData';

// Collection Names
export const COLLECTIONS = {
  USERS: 'users',
  EMPLOYEES: 'employees',
  ORGANIZATIONS: 'organizations',
  DEPARTMENTS: 'departments',
  POSITIONS: 'positions',
  LEAVE_REQUESTS: 'leaveRequests',
  ATTENDANCE: 'attendance',
  PERFORMANCE_REVIEWS: 'performanceReviews',
  DOCUMENTS: 'documents',
  TRAINING: 'training',
  RECRUITMENT: 'recruitment',
  ONBOARDING: 'onboarding',
  OFFBOARDING: 'offboarding',
  PAYROLL_RECORDS: 'payrollRecords',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  SYSTEM_SETTINGS: 'systemSettings',
};

// ==========================================
// HR USER PROFILE & DOSSIER CREATION
// ==========================================
export const ENTITY_DUTY_STATION_MAP: Record<TrustEntity, DutyStation> = {
  'Mukisa Foundation': 'Mukisa Foundation — Lungujja',
  'Mukisa Inclusive Village': 'Mukisa Inclusive Village — Bussi Island',
  "Dawn Children's Centre": 'Dawn Children’s Centre — Bukoto',
  'Berakhah Medical Center': 'Berakhah Medical Center — Kimanya, Wakiso',
};

export interface CreateHRProfileParams {
  userId: string;
  fullName: string;
  entity: TrustEntity | string;
  dutyStation: string;
  department: string;
  jobTitle: string;
  role: UserRole;
  email: string;
  phone?: string;
}

export async function createOrUpdateHRUserProfile(params: CreateHRProfileParams): Promise<UserProfile> {
  const cleanEmail = params.email.trim().toLowerCase();
  const isSysAdmin = cleanEmail === 'nassozishamim50@gmail.com' || params.role === 'System Administrator';
  const role: UserRole = isSysAdmin ? 'System Administrator' : params.role;

  const nowIso = new Date().toISOString();
  const userProfile: UserProfile = {
    uid: params.userId,
    userId: params.userId,
    fullName: params.fullName.trim() || (isSysAdmin ? 'Shamim Nassodzi' : cleanEmail.split('@')[0]),
    email: cleanEmail,
    phone: params.phone?.trim() || '+256 700 000000',
    entity: params.entity,
    organization: params.entity,
    dutyStation: params.dutyStation,
    department: params.department,
    jobTitle: params.jobTitle.trim() || (isSysAdmin ? 'Lead Trust Systems Director' : 'HR Professional'),
    role,
    accountStatus: 'Active',
    createdAt: nowIso,
    updatedAt: nowIso,
    lastLoginAt: nowIso,
  };

  // 1. Persist User Profile document to Cloud Firestore
  const userDocRef = doc(db, COLLECTIONS.USERS, params.userId);
  await setDoc(userDocRef, userProfile, { merge: true });

  // 2. Persist & link corresponding HR Employee record in Cloud Firestore
  try {
    const names = userProfile.fullName.trim().split(/\s+/);
    const firstName = names[0] || 'Staff';
    const lastName = names.slice(1).join(' ') || (isSysAdmin ? 'Nassodzi' : 'Member');

    const employeeDossier: Partial<Employee> = {
      id: isSysAdmin ? 'emp-admin' : `emp-${params.userId}`,
      uid: params.userId,
      userId: params.userId,
      employeeNumber: isSysAdmin ? 'SCT-HQ-001' : `SCT-${params.userId.slice(-6).toUpperCase()}`,
      firstName,
      lastName,
      fullName: userProfile.fullName,
      email: cleanEmail,
      phone: userProfile.phone || '+256 700 000000',
      entity: params.entity as TrustEntity,
      organization: params.entity,
      dutyStation: params.dutyStation,
      department: params.department,
      jobTitle: userProfile.jobTitle,
      position: userProfile.jobTitle,
      role,
      employeeCategory: isSysAdmin ? 'Executive' : 'Administrative',
      employmentType: 'Permanent',
      employmentStatus: 'Active',
      dateOfJoining: nowIso.split('T')[0],
      currency: 'UGX',
      supervisor: isSysAdmin ? 'Board of Trustees' : 'Primary Administrator',
      updatedAt: nowIso,
    };

    // Store with primary key
    const primaryEmpId = isSysAdmin ? 'emp-admin' : `emp-${params.userId}`;
    await setDoc(doc(db, COLLECTIONS.EMPLOYEES, primaryEmpId), employeeDossier, { merge: true });

    // Also link under UID doc for instant direct lookup
    if (primaryEmpId !== params.userId) {
      await setDoc(doc(db, COLLECTIONS.EMPLOYEES, params.userId), { ...employeeDossier, id: params.userId }, { merge: true });
    }
  } catch (empErr) {
    console.warn('[Firestore] Employee dossier auto-creation notice:', empErr);
  }

  return userProfile;
}

// ==========================================
// AUDIT LOGGING HELPER (Tamper-Resistant)
// ==========================================
export async function recordAuditLog(
  action: string,
  category: 'Auth' | 'Employee' | 'Leave' | 'Document' | 'Security' | 'Department' | 'System' | string,
  details: string,
  targetResource?: string,
  targetId?: string
): Promise<void> {
  const currentUser = auth.currentUser;
  try {
    const logData: Omit<AuditLog, 'id'> = {
      action,
      category,
      actorUid: currentUser?.uid || 'system_anonymous',
      actorEmail: currentUser?.email || 'system@specialchildrenstrust.org',
      actorName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'System Operator',
      actorRole: currentUser?.email === 'nassozishamim50@gmail.com' ? 'System Administrator' : 'Authorized User',
      targetResource: targetResource || 'general',
      targetId: targetId || '',
      details,
      timestamp: new Date().toISOString(),
    };
    await addDoc(collection(db, COLLECTIONS.AUDIT_LOGS), logData);
  } catch (error) {
    console.error('Failed to write audit log:', error);
    // Non-blocking so user flow is not interrupted
  }
}

// ==========================================
// IN-APP NOTIFICATIONS
// ==========================================
export interface InAppNotification {
  id: string;
  recipientUid: string; // 'all' or specific UID
  title: string;
  message: string;
  type: 'leave' | 'contract' | 'system' | 'safeguarding' | 'info';
  read: boolean;
  createdAt: string;
  link?: string;
}

export async function sendNotification(
  notification: Omit<InAppNotification, 'id' | 'createdAt' | 'read'>
): Promise<void> {
  try {
    await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notification,
      read: false,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// ==========================================
// INITIAL DATABASE SEEDING
// ==========================================
export async function seedInitialFirestoreData(): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return false;
  }
  const path = COLLECTIONS.ORGANIZATIONS;
  try {
    // Check if organizations already exist
    const snap = await getDocs(collection(db, path));
    if (!snap.empty) {
      return false; // Already seeded
    }

    // 1. Seed Organizations
    const initialOrgs = [
      { id: 'org-sct', name: "Special Children's Trust", acronym: 'SCT', code: 'SCT', headquarters: 'Secretariat, Kampala', district: 'Kampala', status: 'Active' },
      { id: 'org-mf', name: 'Mukisa Foundation', acronym: 'MF', code: 'MF', headquarters: 'Mukisa Foundation — Lungujja', district: 'Kampala', status: 'Active' },
      { id: 'org-miv', name: 'Mukisa Inclusive Village', acronym: 'MIV', code: 'MIV', headquarters: 'Mukisa Inclusive Village — Bussi Island', district: 'Wakiso', status: 'Active' },
      { id: 'org-dcc', name: "Dawn Children's Centre", acronym: 'DCC', code: 'DCC', headquarters: 'Dawn Children’s Centre — Bukoto', district: 'Kampala', status: 'Active' },
      { id: 'org-bmc', name: 'Berakhah Medical Center', acronym: 'BMC', code: 'BMC', headquarters: 'Berakhah Medical Center — Kimanya, Wakiso', district: 'Wakiso', status: 'Active' },
    ];
    for (const org of initialOrgs) {
      await setDoc(doc(db, COLLECTIONS.ORGANIZATIONS, org.id), org);
    }

    // 2. Seed Departments (Health, Education, Social and Economic Employment, Administration, House Keeping, Security)
    for (const dept of INITIAL_DEPARTMENTS) {
      await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, dept.id), dept);
    }

    // Note: Demo employees, contracts, documents, leave records, attendance, timesheets,
    // performance reviews, training, vacancies, and candidates have been removed.
    // The system starts with a clean production database.

    // 3. Seed System Settings
    await setDoc(doc(db, COLLECTIONS.SYSTEM_SETTINGS, 'general'), {
      organizationName: "Special Children's Trust",
      tagline: 'Empowering People. Supporting Children. Building Inclusive Communities.',
      currency: 'UGX',
      timeZone: 'Africa/Kampala',
      country: 'Uganda',
      leavePolicyAnnualDays: 24,
      safeguardingAuditIntervalDays: 365,
      version: '2.0.0-production',
      updatedAt: new Date().toISOString(),
    });

    await recordAuditLog(
      'System Initialized',
      'System',
      'Configured Special Children\'s Trust production organizational structure and departments'
    );

    return true;
  } catch (error) {
    console.warn('Initial database seed skipped or already initialized:', error);
    return false;
  }
}

// ==========================================
// DEMO / PLACEHOLDER DATA DETECTION HELPERS
// ==========================================
export const DEMO_PERSONAS = [
  'Dr. Christine Nabukenya',
  'Dr. Robert Sserunjogi',
  'Sarah Nalubega',
  'David Okello',
  'Grace Achieng',
  'Samuel Kigozi',
  'Esther Namubiru',
  'Patrick Ochieng',
  'Joan Nakato',
  'Josephine Namatovu',
  'Emmanuel Mukasa',
  'Florence Akello',
];

export function isDemoRecordId(id?: string | null): boolean {
  if (!id) return false;
  const lower = id.toLowerCase();
  if (lower.startsWith('demo-') || lower.startsWith('test-') || lower.startsWith('sample-')) return true;
  if (lower === 'emp-admin') return true;
  // Match short legacy demo sequence numbers like emp-001 to emp-999, c-001, doc-001 (up to 4 digits)
  // Does NOT match full 13-digit Date.now() timestamp IDs or UUIDs
  return /^[a-z]{1,5}-0\d{1,3}$/i.test(id) || /^(emp|att|lv|c|doc|ts|p|tr|vac|cand|act|ob|off)-\d{1,4}$/i.test(id);
}

export function isDemoEmployee(docId: string, data: any): boolean {
  if (isDemoRecordId(docId)) return true;
  if (data?.isDemo === true || data?.placeholder === true || data?.isPlaceholder === true) return true;
  const fullName = `${data?.firstName || ''} ${data?.lastName || ''}`.trim();
  if (DEMO_PERSONAS.includes(fullName)) return true;
  const empNo = String(data?.employeeNumber || '');
  if (empNo === 'SCT-001' || empNo === 'SCT-HQ-001' || empNo.toLowerCase().includes('demo')) return true;
  if (typeof data?.email === 'string') {
    const email = data.email.toLowerCase();
    if (email === 'nassozishamim50@gmail.com') return false;
    if (email.endsWith('@example.com') || email.includes('test') || email.includes('dummy')) return true;
    if (email.endsWith('@specialchildrenstrust.org') && DEMO_PERSONAS.some(p => email.includes(p.toLowerCase().split(' ')[1] || 'xyz'))) {
      return true;
    }
  }
  return false;
}

export function isDemoRelatedRecord(docId: string, data: any): boolean {
  if (isDemoRecordId(docId)) return true;
  if (data?.isDemo === true || data?.placeholder === true) return true;
  if (data?.employeeId && isDemoRecordId(data.employeeId)) return true;
  if (data?.employeeName && DEMO_PERSONAS.includes(data.employeeName)) return true;
  return false;
}

export function isDemoUser(docId: string, data: any, currentAuthUid?: string, currentAuthEmail?: string): boolean {
  if (docId === currentAuthUid) return false;
  const email = (data?.email || '').toLowerCase();
  if (email && (email === currentAuthEmail?.toLowerCase() || email === 'nassozishamim50@gmail.com')) return false;
  if (isDemoRecordId(docId)) return true;
  if (data?.isDemo === true || data?.placeholder === true) return true;
  if (email.endsWith('@example.com') || email.includes('test') || email.includes('demo') || email.includes('sample')) return true;
  if (email.endsWith('@specialchildrenstrust.org') && !email.startsWith('admin')) return true;
  return false;
}

// ==========================================
// PURGE DEMO / SAMPLE DATA FROM FIRESTORE
// ==========================================
export interface PurgeResult {
  removedEmployees: number;
  removedUsers: number;
  removedAttendance: number;
  removedLeaveRequests: number;
  removedContracts: number;
  removedDocuments: number;
  removedTimesheets: number;
  removedReviews: number;
  removedTraining: number;
  removedVacancies: number;
  removedCandidates: number;
  removedNotifications: number;
  totalRemoved: number;
  preservedSettings: boolean;
  timestamp: string;
}

export async function purgeDemoDataFromFirestore(): Promise<PurgeResult> {
  const result: PurgeResult = {
    removedEmployees: 0,
    removedUsers: 0,
    removedAttendance: 0,
    removedLeaveRequests: 0,
    removedContracts: 0,
    removedDocuments: 0,
    removedTimesheets: 0,
    removedReviews: 0,
    removedTraining: 0,
    removedVacancies: 0,
    removedCandidates: 0,
    removedNotifications: 0,
    totalRemoved: 0,
    preservedSettings: true,
    timestamp: new Date().toISOString(),
  };

  const currentUser = auth.currentUser;

  try {
    // 1. Clean demo users from USERS collection (Preserve genuine authenticated users & nassozishamim50@gmail.com)
    try {
      const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
      for (const d of usersSnap.docs) {
        const data = d.data();
        if (isDemoUser(d.id, data, currentUser?.uid, currentUser?.email || undefined)) {
          await deleteDoc(doc(db, COLLECTIONS.USERS, d.id));
          result.removedUsers++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo users:', e);
    }

    // 2. Clean demo employees from EMPLOYEES collection
    try {
      const empSnap = await getDocs(collection(db, COLLECTIONS.EMPLOYEES));
      for (const d of empSnap.docs) {
        const data = d.data();
        if (isDemoEmployee(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.EMPLOYEES, d.id));
          result.removedEmployees++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo employees:', e);
    }

    // 3. Clean demo attendance records from ATTENDANCE collection
    try {
      const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
      for (const d of attSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.ATTENDANCE, d.id));
          result.removedAttendance++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo attendance:', e);
    }

    // 4. Clean demo leave requests from LEAVE_REQUESTS collection
    try {
      const lvSnap = await getDocs(collection(db, COLLECTIONS.LEAVE_REQUESTS));
      for (const d of lvSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.LEAVE_REQUESTS, d.id));
          result.removedLeaveRequests++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo leave requests:', e);
    }

    // 5. Clean demo contracts / payroll from PAYROLL_RECORDS collection
    try {
      const prSnap = await getDocs(collection(db, COLLECTIONS.PAYROLL_RECORDS));
      for (const d of prSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.PAYROLL_RECORDS, d.id));
          result.removedContracts++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo contracts:', e);
    }

    // 6. Clean demo documents from DOCUMENTS collection
    try {
      const docSnap = await getDocs(collection(db, COLLECTIONS.DOCUMENTS));
      for (const d of docSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.DOCUMENTS, d.id));
          result.removedDocuments++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo documents:', e);
    }

    // 7. Clean demo timesheets / onboarding from ONBOARDING collection
    try {
      const obSnap = await getDocs(collection(db, COLLECTIONS.ONBOARDING));
      for (const d of obSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.ONBOARDING, d.id));
          result.removedTimesheets++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo timesheets:', e);
    }

    // 8. Clean demo performance reviews from PERFORMANCE_REVIEWS collection
    try {
      const pSnap = await getDocs(collection(db, COLLECTIONS.PERFORMANCE_REVIEWS));
      for (const d of pSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.PERFORMANCE_REVIEWS, d.id));
          result.removedReviews++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo performance reviews:', e);
    }

    // 9. Clean demo training records from TRAINING collection
    try {
      const trSnap = await getDocs(collection(db, COLLECTIONS.TRAINING));
      for (const d of trSnap.docs) {
        const data = d.data();
        if (isDemoRelatedRecord(d.id, data)) {
          await deleteDoc(doc(db, COLLECTIONS.TRAINING, d.id));
          result.removedTraining++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo training:', e);
    }

    // 10. Clean demo vacancy positions from POSITIONS collection
    try {
      const vacSnap = await getDocs(collection(db, COLLECTIONS.POSITIONS));
      for (const d of vacSnap.docs) {
        const data = d.data();
        if (isDemoRecordId(d.id) || data?.isDemo === true) {
          await deleteDoc(doc(db, COLLECTIONS.POSITIONS, d.id));
          result.removedVacancies++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo positions:', e);
    }

    // 11. Clean demo recruitment candidates from RECRUITMENT collection
    try {
      const candSnap = await getDocs(collection(db, COLLECTIONS.RECRUITMENT));
      for (const d of candSnap.docs) {
        const data = d.data();
        if (isDemoRecordId(d.id) || data?.isDemo === true) {
          await deleteDoc(doc(db, COLLECTIONS.RECRUITMENT, d.id));
          result.removedCandidates++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo candidates:', e);
    }

    // 12. Clean demo notifications from NOTIFICATIONS collection
    try {
      const notifSnap = await getDocs(collection(db, COLLECTIONS.NOTIFICATIONS));
      for (const d of notifSnap.docs) {
        const data = d.data();
        if (isDemoRecordId(d.id) || data?.isDemo === true) {
          await deleteDoc(doc(db, COLLECTIONS.NOTIFICATIONS, d.id));
          result.removedNotifications++;
        }
      }
    } catch (e) {
      console.warn('Error checking/purging demo notifications:', e);
    }

    result.totalRemoved =
      result.removedEmployees +
      result.removedUsers +
      result.removedAttendance +
      result.removedLeaveRequests +
      result.removedContracts +
      result.removedDocuments +
      result.removedTimesheets +
      result.removedReviews +
      result.removedTraining +
      result.removedVacancies +
      result.removedCandidates +
      result.removedNotifications;

    // Guarantee and preserve required system settings
    await setDoc(doc(db, COLLECTIONS.SYSTEM_SETTINGS, 'general'), {
      organizationName: "Special Children's Trust",
      tagline: 'Empowering People. Supporting Children. Building Inclusive Communities.',
      currency: 'UGX',
      timeZone: 'Africa/Kampala',
      country: 'Uganda',
      leavePolicyAnnualDays: 24,
      safeguardingAuditIntervalDays: 365,
      version: '2.0.0-production',
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    if (result.totalRemoved > 0) {
      await recordAuditLog(
        'Non-Production Data Purged',
        'System',
        `Cleaned ${result.totalRemoved} placeholder/demo records across collections (Employees: ${result.removedEmployees}, Users: ${result.removedUsers}, Attendance: ${result.removedAttendance}, Leave: ${result.removedLeaveRequests}, Contracts: ${result.removedContracts}, Documents: ${result.removedDocuments}, Timesheets: ${result.removedTimesheets}, Reviews: ${result.removedReviews}, Training: ${result.removedTraining}, Vacancies: ${result.removedVacancies}, Candidates: ${result.removedCandidates}, Notifications: ${result.removedNotifications}). Core logic, departments, and system settings preserved.`
      );
    }
  } catch (err) {
    console.error('Error during demo data purge:', err);
  }
  return result;
}

// ==========================================
// ENSURE STANDARD DEPARTMENTS IN FIRESTORE
// ==========================================
export async function ensureStandardDepartmentsInFirestore(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;

  try {
    const snap = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
    const existingNames = new Set<string>();
    const existingIds = new Set<string>();
    snap.forEach((d) => {
      existingIds.add(d.id.toLowerCase());
      const data = d.data();
      if (data.name) {
        existingNames.add(String(data.name).toLowerCase());
      }
    });

    for (const dept of INITIAL_DEPARTMENTS) {
      if (!existingIds.has(dept.id.toLowerCase()) && !existingNames.has(dept.name.toLowerCase())) {
        await setDoc(doc(db, COLLECTIONS.DEPARTMENTS, dept.id), dept);
        await recordAuditLog(
          'Department Configured',
          'Department',
          `Standard department ${dept.name} automatically provisioned into Firestore.`,
          'departments',
          dept.id
        );
      } else if (dept.id === 'dept-housekeeping') {
        // Ensure House Keeping has the official overview: Responsible for meals, cleaning, and maintenance.
        await updateDoc(doc(db, COLLECTIONS.DEPARTMENTS, dept.id), {
          description: 'Responsible for meals, cleaning, and maintenance.',
          locations: dept.locations,
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.warn('Could not sync standard departments to Firestore:', err);
  }
}

// ==========================================
// STORAGE FILE UPLOAD HELPER
// ==========================================
export async function uploadDocumentToStorage(
  file: File,
  employeeId: string,
  category: string
): Promise<{ downloadUrl: string; fileName: string; fileSize: string }> {
  try {
    const cleanFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const storagePath = `documents/${employeeId}/${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const snapshot = await uploadBytes(storageRef, file);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    const sizeInKb = (file.size / 1024).toFixed(1);
    const fileSize = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : `${sizeInKb} KB`;

    await recordAuditLog(
      'Document Uploaded',
      'Document',
      `Uploaded ${file.name} (${fileSize}) for staff member ${employeeId}`,
      'documents',
      cleanFileName
    );

    return { downloadUrl, fileName: file.name, fileSize };
  } catch (error) {
    console.error('Storage upload failed:', error);
    throw error;
  }
}
