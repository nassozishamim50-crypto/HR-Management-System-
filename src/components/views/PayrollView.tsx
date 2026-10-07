import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  Download,
  Lock,
  Building,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate, exportToCSV } from '../../utils/formatters';

export const PayrollView: React.FC = () => {
  const { employees, permissions, currentOrg, switchRole } = useApp();

  // If unauthorized
  if (!permissions.canAccessPayroll) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-xs space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-base">Restricted Access Module</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Staff compensation, payroll deductions, and banking routing information are restricted to
            authorized Finance and Human Resource managers per NGO confidentiality policies and the Uganda Data Protection and Privacy Act.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-600">
          Tip: You can test this module by switching to <span className="font-bold text-slate-900">HR Manager</span> or <span className="font-bold text-slate-900">Finance Officer</span> using the role switcher in the top navigation bar.
        </div>

        <button
          onClick={() => switchRole('FINANCE_OFFICER')}
          className="btn-sct-primary px-4 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          Switch to Finance Officer Role
        </button>
      </div>
    );
  }

  // Calculate totals
  const payrollRows = employees.map((e) => {
    const p: any = e.payroll || {
      basicSalary: e.basicSalary || 3500000,
      currency: currentOrg.currency,
      payFrequency: 'Monthly' as const,
      allowances: { hardship: 0, transport: 300000, housing: 400000, airtimeAndData: 150000 },
      deductions: { nssfEmployee: 175000, nssfEmployer: 350000, payeTax: 700000, localServiceTax: 100000 },
      bankDetails: { bankName: 'Stanbic Bank Uganda', accountName: `${e.firstName} ${e.lastName}`, accountNumber: '903001234', branch: 'Main', tinNumber: '1001234', nssfNumber: 'NSF-1234' },
    };

    const totalAllowances =
      (p.allowances?.hardship || 0) +
      (p.allowances?.transport || 0) +
      (p.allowances?.housing || 0) +
      (p.allowances?.airtimeAndData || 0);

    const grossSalary = p.basicSalary + totalAllowances;
    const totalDeductions =
      (p.deductions?.nssfEmployee || 0) +
      (p.deductions?.payeTax || 0) +
      (p.deductions?.localServiceTax || 0);

    const netSalary = grossSalary - totalDeductions;

    return {
      employee: e,
      basicSalary: p.basicSalary,
      hardship: p.allowances?.hardship || 0,
      transport: p.allowances?.transport || 0,
      housing: p.allowances?.housing || 0,
      airtime: p.allowances?.airtimeAndData || 0,
      totalAllowances,
      grossSalary,
      nssfEmp: p.deductions?.nssfEmployee || 0,
      nssfOrg: p.deductions?.nssfEmployer || 0,
      paye: p.deductions?.payeTax || 0,
      lst: p.deductions?.localServiceTax || 0,
      totalDeductions,
      netSalary,
      bank: p.bankDetails || e.bankDetails,
    };
  });

  const totalBasic = payrollRows.reduce((sum, r) => sum + r.basicSalary, 0);
  const totalAllowances = payrollRows.reduce((sum, r) => sum + r.totalAllowances, 0);
  const totalGross = payrollRows.reduce((sum, r) => sum + r.grossSalary, 0);
  const totalNSSFOrg = payrollRows.reduce((sum, r) => sum + r.nssfOrg, 0);
  const totalPAYE = payrollRows.reduce((sum, r) => sum + r.paye, 0);
  const totalNet = payrollRows.reduce((sum, r) => sum + r.netSalary, 0);

  const handleExportPayroll = () => {
    const rows = payrollRows.map((r) => ({
      'Employee Number': r.employee.employeeNumber,
      'Staff Name': `${r.employee.firstName} ${r.employee.lastName}`,
      'Job Title': r.employee.jobTitle,
      'Department': r.employee.department,
      'Duty Station': r.employee.dutyStation,
      'Basic Salary': r.basicSalary,
      'Hardship Allowance': r.hardship,
      'Transport Allowance': r.transport,
      'Housing Allowance': r.housing,
      'Gross Pay': r.grossSalary,
      'NSSF 5% Employee': r.nssfEmp,
      'NSSF 10% Employer': r.nssfOrg,
      'PAYE Tax': r.paye,
      'LST Tax': r.lst,
      'Net Pay': r.netSalary,
      'Bank Name': r.bank.bankName,
      'Account Number': r.bank.accountNumber,
      'TIN Number': r.bank.tinNumber,
      'NSSF Number': r.bank.nssfNumber,
    }));
    exportToCSV(`${currentOrg.acronym}_Monthly_Payroll_Schedule`, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              <span>NGO Payroll & Statutory Staff Costs</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized compensation register: Basic salary, field hardship allowances, NSSF (15%), PAYE and LST
            </p>
          </div>

          <button
            onClick={handleExportPayroll}
            className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Payroll Schedule</span>
          </button>
        </div>

        {/* Aggregated Payroll Totals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500">Gross Monthly Payroll</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
              {formatCurrency(totalGross, currentOrg.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Basic + Allowances</div>
          </div>

          <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
            <div className="text-[11px] font-semibold text-emerald-800">Total Net Staff Disbursement</div>
            <div className="text-lg font-bold text-emerald-950 mt-0.5 tabular-nums">
              {formatCurrency(totalNet, currentOrg.currency)}
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">Net take-home to bank accounts</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500">Uganda PAYE Tax Obligation</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
              {formatCurrency(totalPAYE, currentOrg.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pay As You Earn to URA</div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500">NSSF Employer Cost (10%)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
              {formatCurrency(totalNSSFOrg, currentOrg.currency)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Statutory employer liability</div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Monthly Compensation Schedule</h3>
          <span className="text-xs text-slate-500">Currency: {currentOrg.currency}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Duty Station</th>
                <th className="px-4 py-3 text-right">Basic Pay</th>
                <th className="px-4 py-3 text-right">Allowances</th>
                <th className="px-4 py-3 text-right">Gross Salary</th>
                <th className="px-4 py-3 text-right">NSSF (5%)</th>
                <th className="px-4 py-3 text-right">PAYE</th>
                <th className="px-4 py-3 text-right font-bold">Net Pay</th>
                <th className="px-4 py-3">Bank Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payrollRows.map((r) => (
                <tr key={r.employee.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-bold text-slate-900 block">{r.employee.firstName} {r.employee.lastName}</span>
                    <span className="text-[11px] text-slate-500">{r.employee.jobTitle}</span>
                  </td>

                  <td className="px-4 py-3 text-slate-700">
                    {r.employee.dutyStation}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-slate-900 tabular-nums">
                    {formatCurrency(r.basicSalary, currentOrg.currency)}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
                    {formatCurrency(r.totalAllowances, currentOrg.currency)}
                    {r.hardship > 0 && (
                      <span className="block text-[10px] text-emerald-700">
                        Hardship: {formatCurrency(r.hardship, currentOrg.currency)}
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-bold text-slate-900 tabular-nums">
                    {formatCurrency(r.grossSalary, currentOrg.currency)}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                    {formatCurrency(r.nssfEmp, currentOrg.currency)}
                  </td>

                  <td className="px-4 py-3 text-right text-slate-600 tabular-nums">
                    {formatCurrency(r.paye, currentOrg.currency)}
                  </td>

                  <td className="px-4 py-3 text-right font-extrabold text-emerald-800 text-sm tabular-nums">
                    {formatCurrency(r.netSalary, currentOrg.currency)}
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{r.bank.bankName}</div>
                    <div className="font-mono text-[10px] text-slate-400">
                      {r.bank.accountNumber} · TIN: {r.bank.tinNumber}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
