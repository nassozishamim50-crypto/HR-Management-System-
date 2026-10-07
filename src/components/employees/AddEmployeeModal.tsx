import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TrustEntity, EmploymentType, EmploymentStatus, DUTY_STATIONS } from '../../types';
import { X, UserPlus, Check } from 'lucide-react';

interface AddEmployeeModalProps {
  onClose: () => void;
  defaultEntity?: TrustEntity;
  defaultDepartment?: string;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  onClose,
  defaultEntity,
  defaultDepartment,
}) => {
  const { entities, departments, employees, customFields, addEmployee } = useApp();

  const [formData, setFormData] = useState({
    // Personal Details
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    dateOfBirth: '1992-06-15',
    nationality: 'Ugandan',
    nationalIdNumber: 'CM92',
    passportNumber: '',
    maritalStatus: 'Single' as 'Single' | 'Married' | 'Widowed' | 'Divorced',
    phone: '+256 7',
    alternativePhone: '',
    email: '',
    residentialAddress: 'Kampala, Uganda',
    district: 'Kampala',
    emergencyName: '',
    emergencyRelationship: 'Spouse',
    emergencyPhone: '+256 7',
    emergencyAltPhone: '',

    // Employment Details
    entity: (defaultEntity || entities[0]) as TrustEntity,
    departmentId: departments.find(d => d.name === defaultDepartment)?.id || departments[0]?.id || '',
    jobTitle: '',
    position: 'Officer',
    employeeCategory: 'Clinical Staff' as any,
    employmentType: 'Permanent' as EmploymentType,
    employmentStatus: 'Active' as EmploymentStatus,
    dateOfJoining: new Date().toISOString().split('T')[0],
    contractStartDate: new Date().toISOString().split('T')[0],
    contractEndDate: '2028-12-31',
    supervisor: employees[0] ? `${employees[0].firstName} ${employees[0].lastName}` : 'Executive Director',
    supervisorId: employees[0]?.id || '',
    dutyStation: DUTY_STATIONS[0],
    workLocation: 'Main Campus',
    staffGrade: 'Grade C - Officer',
    yearsOfService: 1,
    basicSalary: 4500000,
    currency: 'UGX' as 'UGX' | 'USD',

    // Custom fields values map
    customValues: {} as Record<string, string>,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.jobTitle) {
      alert('Please fill in First Name, Last Name, and Job Title.');
      return;
    }

    const dept = departments.find((d) => d.id === formData.departmentId) || departments[0];

    addEmployee({
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      preferredName: formData.preferredName,
      gender: formData.gender,
      dateOfBirth: formData.dateOfBirth,
      nationality: formData.nationality,
      nationalIdNumber: formData.nationalIdNumber,
      passportNumber: formData.passportNumber,
      maritalStatus: formData.maritalStatus,
      phone: formData.phone,
      alternativePhone: formData.alternativePhone,
      email: formData.email || `${formData.firstName.toLowerCase()}.${formData.lastName.toLowerCase()}@specialchildrenstrust.org`,
      residentialAddress: formData.residentialAddress,
      district: formData.district,
      emergencyContact: {
        name: formData.emergencyName || 'Emergency Contact',
        relationship: formData.emergencyRelationship,
        phone: formData.emergencyPhone,
        alternativePhone: formData.emergencyAltPhone,
      },
      entity: formData.entity,
      department: dept.name,
      departmentId: dept.id,
      jobTitle: formData.jobTitle,
      position: formData.position,
      employeeCategory: formData.employeeCategory,
      employmentType: formData.employmentType,
      employmentStatus: formData.employmentStatus,
      dateOfJoining: formData.dateOfJoining,
      contractStartDate: formData.contractStartDate,
      contractEndDate: formData.contractEndDate,
      supervisor: formData.supervisor,
      supervisorId: formData.supervisorId,
      departmentHead: dept.departmentHead,
      dutyStation: formData.dutyStation,
      workLocation: formData.workLocation,
      staffGrade: formData.staffGrade,
      yearsOfService: Number(formData.yearsOfService),
      basicSalary: Number(formData.basicSalary),
      currency: formData.currency,
      customFields: formData.customValues,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* SCT Header */}
        <div className="bg-[#111C54] px-4 sm:px-5 py-2.5 border-b border-[#1C2C78] flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              className="h-8 w-auto object-contain rounded bg-white p-0.5"
              style={{ aspectRatio: '5 / 4' }}
            />
            <span className="text-xs font-black tracking-tight text-white">
              SPECIAL CHILDREN'S TRUST
            </span>
            <span className="text-[10px] text-[#FFDE00] font-black uppercase tracking-wider">
              · HR Personnel Enrollment
            </span>
          </div>
          <span className="text-[10px] text-slate-300 font-bold">
            Uganda NGO Reg: S.5914/11542
          </span>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFF9D2] border border-[#FFDE00] rounded-lg text-[#162365]">
              <UserPlus className="w-5 h-5 text-[#162365]" />
            </div>
            <div>
              <h3 className="font-black text-[#162365] text-sm sm:text-base">
                Add New Staff Member — Special Children's Trust
              </h3>
              <p className="text-xs text-slate-500">
                Register employee in master database across any of the 4 entities & 6 departments
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-slate-700">
          {/* SECTION 1: ENTITY & DEPARTMENT ASSIGNMENT */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 border-l-4 border-l-amber-500 space-y-3">
            <h4 className="font-extrabold text-[#0B1A30] text-xs uppercase tracking-wider">
              Entity & Department Assignment
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Organizational Entity *</label>
                <select
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value as TrustEntity })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold outline-none focus:ring-2 focus:ring-amber-400 focus:border-[#0B1A30]"
                >
                  {entities.map((ent) => (
                    <option key={ent} value={ent}>
                      {ent}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Department *</label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white font-semibold outline-none focus:ring-2 focus:ring-amber-400 focus:border-[#0B1A30]"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: PERSONAL DETAILS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
              Personal Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="e.g. Christine"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Middle Name</label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="e.g. Nabukenya"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Preferred Name</label>
                <input
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Teacher Sarah / Dr. Robert"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">National ID Number (NIN)</label>
                <input
                  type="text"
                  value={formData.nationalIdNumber}
                  onChange={(e) => setFormData({ ...formData, nationalIdNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                  placeholder="CM..."
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Passport Number</label>
                <input
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Marital Status</label>
                <select
                  value={formData.maritalStatus}
                  onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Widowed">Widowed</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Alternative Phone</label>
                <input
                  type="text"
                  value={formData.alternativePhone}
                  onChange={(e) => setFormData({ ...formData, alternativePhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="Leave empty to auto-generate"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">District</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Kampala / Wakiso / Mpigi"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-slate-500 mb-1">Residential Address</label>
                <input
                  type="text"
                  value={formData.residentialAddress}
                  onChange={(e) => setFormData({ ...formData, residentialAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: EMPLOYMENT & ROLE DETAILS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
              Employment & Designation
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Job Title *</label>
                <input
                  type="text"
                  required
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600"
                  placeholder="e.g. Pediatric Physiotherapist"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Staff Category</label>
                <select
                  value={formData.employeeCategory}
                  onChange={(e) => setFormData({ ...formData, employeeCategory: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="Clinical Staff">Clinical Staff</option>
                  <option value="Educator / Teacher">Educator / Teacher</option>
                  <option value="Therapist">Therapist</option>
                  <option value="Social Worker">Social Worker</option>
                  <option value="Administrative">Administrative</option>
                  <option value="Support Staff">Support Staff</option>
                  <option value="Technical Specialist">Technical Specialist</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Employment Type</label>
                <select
                  value={formData.employmentType}
                  onChange={(e) => setFormData({ ...formData, employmentType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Contract">Contract</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Temporary">Temporary</option>
                  <option value="Consultant">Consultant</option>
                  <option value="Volunteer">Volunteer</option>
                  <option value="Intern">Intern</option>
                  <option value="Casual">Casual</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Employment Status</label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Resigned">Resigned</option>
                  <option value="Retired">Retired</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Date of Joining</label>
                <input
                  type="date"
                  value={formData.dateOfJoining}
                  onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Contract End Date</label>
                <input
                  type="date"
                  value={formData.contractEndDate}
                  onChange={(e) => setFormData({ ...formData, contractEndDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Duty Station *</label>
                <select
                  required
                  value={formData.dutyStation}
                  onChange={(e) => setFormData({ ...formData, dutyStation: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none bg-white font-medium text-slate-800"
                >
                  {DUTY_STATIONS.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Work Location / Unit</label>
                <input
                  type="text"
                  value={formData.workLocation}
                  onChange={(e) => setFormData({ ...formData, workLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Pediatric Therapy Suite"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Supervisor</label>
                <select
                  value={formData.supervisorId}
                  onChange={(e) => {
                    const sup = employees.find((emp) => emp.id === e.target.value);
                    setFormData({
                      ...formData,
                      supervisorId: e.target.value,
                      supervisor: sup ? `${sup.firstName} ${sup.lastName}` : formData.supervisor,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.jobTitle})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Staff Grade</label>
                <input
                  type="text"
                  value={formData.staffGrade}
                  onChange={(e) => setFormData({ ...formData, staffGrade: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Monthly Salary (UGX)</label>
                <input
                  type="number"
                  value={formData.basicSalary}
                  onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-medium tabular-nums"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: EMERGENCY CONTACT */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
              Emergency Contact (Duty of Care)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Contact Full Name</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Paul Nabukenya"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyRelationship}
                  onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  placeholder="e.g. Spouse / Sibling"
                />
              </div>
              <div>
                <label className="block text-slate-500 mb-1">Contact Phone</label>
                <input
                  type="text"
                  value={formData.emergencyPhone}
                  onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: CONFIGURABLE CUSTOM FIELDS */}
          {customFields.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider pb-1 border-b border-slate-100">
                Special Children's Trust Configured Fields
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {customFields.map((cf) => (
                  <div key={cf.id}>
                    <label className="block text-slate-600 font-medium mb-1">
                      {cf.name} {cf.required && '*'}
                    </label>
                    {cf.type === 'select' && cf.options ? (
                      <select
                        value={formData.customValues[cf.name] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customValues: { ...formData.customValues, [cf.name]: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white outline-none"
                      >
                        <option value="">Select option</option>
                        {cf.options.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={cf.type === 'number' ? 'number' : cf.type === 'date' ? 'date' : 'text'}
                        value={formData.customValues[cf.name] || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customValues: { ...formData.customValues, [cf.name]: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-sct-primary px-5 py-2 text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Enroll Staff Member</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
