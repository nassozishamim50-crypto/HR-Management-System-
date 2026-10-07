import {
  TrustEntity,
  Employee,
  Department,
  ProgramActivity,
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
} from '../types';

export const TRUST_ENTITIES: TrustEntity[] = [
  'Mukisa Foundation',
  'Mukisa Inclusive Village',
  'Dawn Children\'s Centre',
  'Berakhah Medical Center',
];

export const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-health',
    name: 'Health',
    code: 'HLT',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Comprehensive pediatric medical services, neuro-developmental therapy, occupational and physical rehabilitation, assistive mobility technology, and community healthcare outreach.',
    status: 'Active',
    locations: [
      'Berakhah Medical Center — Kimanya, Wakiso',
      'Mukisa Inclusive Village — Bussi Island',
      'Mukisa Foundation — Lungujja',
      'Dawn Children’s Centre — Bukoto',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
  {
    id: 'dept-education',
    name: 'Education',
    code: 'EDU',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Specialized individualized education plans (IEPs), neurodiverse classroom instruction, sensory learning spaces, inclusive curriculum adaptation, and teacher professional development.',
    status: 'Active',
    locations: [
      'Dawn Children’s Centre — Bukoto',
      'Mukisa Inclusive Village — Bussi Island',
      'Mukisa Foundation — Lungujja',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
  {
    id: 'dept-social',
    name: 'Social and Economic Employment',
    code: 'SEE',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Caregiver livelihood programs, family psychosocial support, community disability inclusion advocacy, vocational craft and agricultural training, and youth transition to employment.',
    status: 'Active',
    locations: [
      'Mukisa Foundation — Lungujja',
      'Mukisa Inclusive Village — Bussi Island',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
  {
    id: 'dept-admin',
    name: 'Administration',
    code: 'ADM',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Centralized governance, people operations and safeguarding compliance, financial management, donor reporting, procurement, IT infrastructure, and facilities logistics across all Special Children’s Trust centers.',
    status: 'Active',
    locations: [
      'Mukisa Foundation — Lungujja',
      'Mukisa Inclusive Village — Bussi Island',
      'Dawn Children’s Centre — Bukoto',
      'Berakhah Medical Center — Kimanya, Wakiso',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
  {
    id: 'dept-housekeeping',
    name: 'House Keeping',
    code: 'HSK',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Responsible for meals, cleaning, and maintenance.',
    status: 'Active',
    locations: [
      'Mukisa Foundation — Lungujja',
      'Mukisa Inclusive Village — Bussi Island',
      'Dawn Children’s Centre — Bukoto',
      'Berakhah Medical Center — Kimanya, Wakiso',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
  {
    id: 'dept-security',
    name: 'Security',
    code: 'SEC',
    departmentHead: 'Unassigned',
    departmentHeadId: '',
    description: 'Comprehensive child safeguarding perimeter monitoring, 24/7 campus security, visitor credential verification, asset protection, and crisis evacuation readiness across all Special Children’s Trust centers.',
    status: 'Active',
    locations: [
      'Mukisa Foundation — Lungujja',
      'Mukisa Inclusive Village — Bussi Island',
      'Dawn Children’s Centre — Bukoto',
      'Berakhah Medical Center — Kimanya, Wakiso',
    ],
    programsCount: 0,
    projectsCount: 0,
    activitiesCount: 0,
  },
];

export const INITIAL_CUSTOM_FIELDS: CustomFieldDefinition[] = [
  {
    id: 'cf-ahpc',
    name: 'Uganda Allied Health Council Reg No.',
    type: 'text',
    required: false,
    module: 'employee',
  },
  {
    id: 'cf-trb',
    name: 'Ministry of Education Teacher Reg No.',
    type: 'text',
    required: false,
    module: 'employee',
  },
  {
    id: 'cf-psea',
    name: 'Safeguarding & PSEA Background Check ID',
    type: 'text',
    required: true,
    module: 'employee',
  },
  {
    id: 'cf-duty-care',
    name: 'Special Needs First Aid Certified',
    type: 'select',
    required: false,
    options: ['Yes - Level 1 Pediatric', 'Yes - Level 2 Advanced', 'Pending Refresher', 'No'],
    module: 'employee',
  },
];

// Production Clean: Demo data removed as requested
export const INITIAL_EMPLOYEES: Employee[] = [];
export const INITIAL_PROGRAM_ACTIVITIES: ProgramActivity[] = [];
export const INITIAL_CONTRACTS: ContractRecord[] = [];
export const INITIAL_DOCUMENTS: DocumentRecord[] = [];
export const INITIAL_LEAVE_RECORDS: LeaveRecord[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_TIMESHEETS: TimesheetRecord[] = [];
export const INITIAL_PERFORMANCE: PerformanceRecord[] = [];
export const INITIAL_TRAININGS: TrainingRecord[] = [];
export const INITIAL_VACANCIES: Vacancy[] = [];
export const INITIAL_CANDIDATES: Candidate[] = [];
export const INITIAL_ANNOUNCEMENTS: HRAnnouncement[] = [];
