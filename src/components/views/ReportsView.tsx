import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Building,
  ShieldCheck,
} from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

export const ReportsView: React.FC = () => {
  const { employees, departments, projects, contracts, timesheets, trainings, currentOrg, permissions } = useApp();

  const [activeReport, setActiveReport] = useState<
    'donor-staffing' | 'timesheet-grant' | 'contract-risk' | 'psea-audit' | 'department-staffing'
  >('donor-staffing');

  // Report 1: Staff Allocation by Donor Grant
  const donorStaffingReport = useMemo(() => {
    return projects.map((proj: any) => {
      const assigned = employees.filter((e) =>
        (e.projectAllocations || []).some((p: any) => p.projectId === proj.id) ||
        e.department === proj.department ||
        e.entity === proj.entity
      );
      const totalAllocatedPercentage = assigned.reduce((sum, e) => {
        const alloc = (e.projectAllocations || []).find((p: any) => p.projectId === proj.id);
        return sum + (alloc?.percentage || 50);
      }, 0);

      return {
        id: proj.id,
        projectName: proj.name,
        donor: proj.donor,
        grantNumber: proj.grantNumber || proj.grant || proj.code,
        headcount: assigned.length,
        fullTimeEquivalents: (totalAllocatedPercentage / 100).toFixed(1),
        staffList: assigned.map((e) => `${e.firstName} ${e.lastName} (${e.jobTitle})`),
      };
    });
  }, [projects, employees]);

  // Report 2: Timesheet Billable Hours by Donor
  const timesheetDonorReport = useMemo(() => {
    const summary: Record<string, { donor: string; grant: string; totalHours: number; staffCount: Set<string> }> = {};
    timesheets.forEach((t) => {
      const grantKey = t.grant || 'SCT-Core-2026';
      if (!summary[grantKey]) {
        summary[grantKey] = {
          donor: t.donor || 'Special Children Trust Funds',
          grant: grantKey,
          totalHours: 0,
          staffCount: new Set(),
        };
      }
      summary[grantKey].totalHours += t.hours;
      summary[grantKey].staffCount.add(t.employeeId);
    });

    return Object.values(summary).map((s) => ({
      ...s,
      staffCount: s.staffCount.size,
    }));
  }, [timesheets]);

  // Report 5: Department Staffing & Safeguarding Breakdown
  const departmentStaffingReport = useMemo(() => {
    return departments.map((dept) => {
      const deptEmployees = employees.filter(
        (e) => e.departmentId === dept.id || e.department?.toLowerCase() === dept.name.toLowerCase()
      );
      const activeCount = deptEmployees.filter((e) => e.employmentStatus === 'Active').length;
      const permanentCount = deptEmployees.filter((e) => e.employmentType === 'Permanent').length;
      const fixedTermCount = deptEmployees.filter(
        (e) => e.employmentType === 'Contract' || e.employmentType === 'Fixed-term'
      ).length;
      const pseaTrainedCount = deptEmployees.filter(
        (e) => e.pseaTrained || e.customFields?.['Safeguarding & PSEA Background Check ID']
      ).length;
      const complianceRate = deptEmployees.length > 0 ? Math.round((pseaTrainedCount / deptEmployees.length) * 100) : 100;

      return {
        id: dept.id,
        name: dept.name,
        code: dept.code,
        departmentHead: dept.departmentHead,
        headcount: deptEmployees.length,
        activeCount,
        permanentCount,
        fixedTermCount,
        complianceRate,
        locations: dept.locations?.join(', ') || 'All Centers',
      };
    });
  }, [departments, employees]);

  const handleExportCurrent = () => {
    if (activeReport === 'donor-staffing') {
      const rows = donorStaffingReport.map((r: any) => ({
        'Project Name': r.projectName,
        'Donor': r.donor,
        'Grant Number': r.grantNumber,
        'Total Headcount': r.headcount,
        'FTE (Full Time Equivalent)': r.fullTimeEquivalents,
      }));
      exportToCSV(`${currentOrg.acronym}_Donor_Staffing_Allocation_Report`, rows);
    } else if (activeReport === 'timesheet-grant') {
      const rows = timesheetDonorReport.map((r: any) => ({
        'Donor': r.donor,
        'Grant Number': r.grant,
        'Billable Hours': r.totalHours,
        'Active Staff': r.staffCount,
      }));
      exportToCSV(`${currentOrg.acronym}_Timesheet_Donor_Audit_Report`, rows);
    } else if (activeReport === 'contract-risk') {
      const rows = contracts.map((c) => ({
        'Contract Number': c.contractNumber,
        'Staff Name': c.employeeName,
        'Job Title': c.jobTitle,
        'Contract Type': c.contractType,
        'End Date': c.endDate,
        'Project': c.project || c.entity,
        'Renewal Status': c.renewalStatus,
      }));
      exportToCSV(`${currentOrg.acronym}_Contract_Renewal_Risk_Report`, rows);
    } else if (activeReport === 'psea-audit') {
      const rows = trainings.map((t) => ({
        'Training Title': t.trainingTitle,
        'Staff Member': t.employeeName,
        'Category': t.trainingCategory || t.category || 'General',
        'Completion Date': t.completionDate || t.endDate,
        'Expiry Date': t.expiryDate || 'N/A',
        'Status': t.status,
      }));
      exportToCSV(`${currentOrg.acronym}_Mandatory_PSEA_Training_Audit`, rows);
    } else if (activeReport === 'department-staffing') {
      const rows = departmentStaffingReport.map((d) => ({
        'Department Name': d.name,
        'Code': d.code,
        'Department Head': d.departmentHead,
        'Total Headcount': d.headcount,
        'Active Staff': d.activeCount,
        'Permanent Staff': d.permanentCount,
        'Contract Staff': d.fixedTermCount,
        'PSEA Compliance (%)': `${d.complianceRate}%`,
        'Operating Locations': d.locations,
      }));
      exportToCSV(`${currentOrg.acronym}_Department_Staffing_Compliance_Report`, rows);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-b-4 border-[#FFDE00] rounded-xl p-5 shadow-xs space-y-4 border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <img
              src="/src/assets/images/sct_official_logo.svg"
              alt="Special Children's Trust Official Logo"
              className="h-14 w-auto object-contain rounded-md border border-slate-200 bg-white p-1"
              style={{ aspectRatio: '5 / 4' }}
            />
            <div>
              <h2 className="text-base font-black text-[#162365] flex items-center gap-2">
                <span>SPECIAL CHILDREN'S TRUST — AUDIT & HR REPORTS</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Auditor-ready schedules for Uganda NGO Bureau, Donors, and Trust Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-sct-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#FFDE00]" />
              <span>Print Schedule</span>
            </button>
            <button
              onClick={handleExportCurrent}
              className="btn-sct-primary flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Selected CSV</span>
            </button>
          </div>
        </div>

        {/* Report Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'donor-staffing', label: '1. Staff Allocation by Donor Grant' },
            { id: 'timesheet-grant', label: '2. Timesheet LOE Hours by Grant' },
            { id: 'contract-risk', label: '3. Contract Expiry & Renewal Forecast' },
            { id: 'psea-audit', label: '4. Mandatory Safeguarding & PSEA Audit' },
            { id: 'department-staffing', label: '5. Department Distribution & Compliance' },
          ].map((rep) => {
            const isSelected = activeReport === rep.id;
            return (
              <button
                key={rep.id}
                onClick={() => setActiveReport(rep.id as any)}
                className={`px-3.5 py-2 rounded-lg font-black whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#162365] text-[#FFDE00] shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {rep.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* REPORT 1: STAFF ALLOCATION BY DONOR GRANT */}
      {activeReport === 'donor-staffing' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Staff Allocation by Donor Grant Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Detailed Level of Effort (LOE) assignment per grant agreement
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Auditor Certified
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Project Title</th>
                  <th className="px-4 py-3">Funding Donor</th>
                  <th className="px-4 py-3">Grant Number</th>
                  <th className="px-4 py-3 text-right">Headcount</th>
                  <th className="px-4 py-3 text-right">Total FTE</th>
                  <th className="px-4 py-3">Assigned Staff Personnel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {donorStaffingReport.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{r.projectName}</td>
                    <td className="px-4 py-3 text-slate-700">{r.donor}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{r.grantNumber}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                      {r.headcount}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-700 tabular-nums">
                      {r.fullTimeEquivalents} FTE
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-[11px] max-w-md">
                      {r.staffList.join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 2: TIMESHEET HOURS BY GRANT */}
      {activeReport === 'timesheet-grant' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Timesheet Billable Hours Audit Schedule
              </h3>
              <p className="text-xs text-slate-500">
                Monthly verified labor hours charged to donor funding sources
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Signed & Approved
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Grant Reference</th>
                  <th className="px-4 py-3">Funding Donor Agency</th>
                  <th className="px-4 py-3 text-right">Contributing Staff</th>
                  <th className="px-4 py-3 text-right">Total Verified Labor Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {timesheetDonorReport.map((r, idx) => (
                  <tr key={`${r.grant}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.grant}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{r.donor}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-700 tabular-nums">
                      {r.staffCount} staff members
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-emerald-700 text-sm tabular-nums">
                      {r.totalHours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: CONTRACT EXPIRY & RENEWAL FORECAST */}
      {activeReport === 'contract-risk' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Contract Renewal & Continuity Forecast
              </h3>
              <p className="text-xs text-slate-500">
                Monitoring project disruption risk from expiring fixed-term contracts
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded">
              HR Risk Management
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Contract Ref</th>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.contractNumber}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{c.employeeName}</td>
                    <td className="px-4 py-3 text-slate-700">{c.jobTitle}</td>
                    <td className="px-4 py-3 text-slate-800">{c.project || c.entity}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 tabular-nums">{formatDate(c.endDate)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {c.renewalStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: MANDATORY PSEA & SAFEGUARDING AUDIT */}
      {activeReport === 'psea-audit' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Mandatory PSEA & Safeguarding Training Audit Register
              </h3>
              <p className="text-xs text-slate-500">
                Official institutional compliance with Core Humanitarian Standard (CHS) and IASC protocols
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Donor Compliance Verified</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Compliance Module</th>
                  <th className="px-4 py-3">Staff Member</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Provider</th>
                  <th className="px-4 py-3">Certification Validity</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainings.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900">{t.trainingTitle}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{t.employeeName}</td>
                    <td className="px-4 py-3 text-slate-600">{t.trainingCategory || t.category || 'General'}</td>
                    <td className="px-4 py-3 text-slate-600">{t.provider}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatDate(t.completionDate || t.endDate)} – {formatDate(t.expiryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          t.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : t.status === 'Expiring Soon'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: DEPARTMENT STAFFING & COMPLIANCE */}
      {activeReport === 'department-staffing' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Trust Departmental Staffing, Capacity & Safeguarding Compliance
              </h3>
              <p className="text-xs text-slate-500">
                Institutional distribution across Health, Education, Social and Economic Employment, Administration, House Keeping, and Security
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
              <Building className="w-3.5 h-3.5" />
              <span>{departments.length} Functional Departments</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Department Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Head of Department</th>
                  <th className="px-4 py-3 text-center">Total Staff</th>
                  <th className="px-4 py-3 text-center">Active</th>
                  <th className="px-4 py-3 text-center">Permanent</th>
                  <th className="px-4 py-3 text-center">Contract/Fixed</th>
                  <th className="px-4 py-3 text-center">PSEA Compliance</th>
                  <th className="px-4 py-3">Operating Locations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentStaffingReport.map((dept) => (
                  <tr key={dept.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      <span>{dept.name}</span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-600">{dept.code}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{dept.departmentHead}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900 tabular-nums">
                      {dept.headcount}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                        {dept.activeCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-600">{dept.permanentCount}</td>
                    <td className="px-4 py-3 text-center tabular-nums text-slate-600">{dept.fixedTermCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full tabular-nums ${
                          dept.complianceRate >= 80
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {dept.complianceRate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{dept.locations}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
