import React from 'react';
import { useApp } from '../../context/AppContext';
import { Layers, AlertTriangle, CheckCircle2, User, Building } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface ProjectStaffingViewProps {
  onSelectEmployee: (empId: string) => void;
}

export const ProjectStaffingView: React.FC<ProjectStaffingViewProps> = ({ onSelectEmployee }) => {
  const { employees, projects, currentOrg } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">
            Project & Grant Staffing Allocation Matrix
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          NGO multi-grant staffing split, Level of Effort (LOE) percentage management, and donor grant coverage.
        </p>
      </div>

      {/* Projects Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((proj: any) => {
          const assignedStaff = employees.filter((e) =>
            (e.projectAllocations || []).some((p: any) => p.projectId === proj.id) ||
            e.department === proj.department ||
            e.entity === proj.entity
          );
          return (
            <div key={proj.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {proj.donor}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{proj.code}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">{proj.name}</h3>
              <div className="text-[11px] font-mono text-slate-500">Grant: {proj.grant || proj.grantNumber || proj.code}</div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Assigned Team:</span>
                <span className="font-bold text-slate-900 tabular-nums">{assignedStaff.length} Staff</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Manager:</span>
                <span className="text-slate-700 font-medium">{proj.lead || proj.projectManagerName || 'Project Lead'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cross-Project Staffing Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Personnel Level of Effort (LOE) Distribution Matrix
          </h3>
          <span className="text-xs text-slate-500">Total: {employees.length} Personnel</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Staff Member</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Duty Station</th>
                <th className="px-4 py-3">Allocations Breakdown</th>
                <th className="px-4 py-3 text-right">Total LOE %</th>
                <th className="px-4 py-3">Allocation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => {
                const allocs = emp.projectAllocations || [
                  { projectId: 'proj-core', projectName: `${emp.entity} Core Programs`, percentage: 100 }
                ];
                const totalLOE = allocs.reduce((sum, p) => sum + p.percentage, 0);
                const isOver = totalLOE > 100;
                const isUnder = totalLOE < 100;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onSelectEmployee(emp.id)}
                        className="font-bold text-slate-900 hover:text-emerald-700 text-left block"
                      >
                        {emp.firstName} {emp.lastName}
                      </button>
                      <span className="text-[11px] text-slate-500">{emp.jobTitle}</span>
                    </td>

                    <td className="px-4 py-3 text-slate-700 font-medium">
                      {emp.department}
                    </td>

                    <td className="px-4 py-3 text-slate-700">
                      {emp.dutyStation}
                    </td>

                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        {allocs.map((alloc: any) => (
                          <div key={alloc.projectId} className="flex items-center gap-2 text-[11px]">
                            <span className="w-12 font-bold text-emerald-800 tabular-nums">
                              {alloc.percentage}%
                            </span>
                            <span className="text-slate-800 font-medium">{alloc.projectName}</span>
                            <span className="text-slate-400 font-mono">({alloc.donor || 'Trust Funds'})</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-right font-extrabold text-sm tabular-nums">
                      <span className={isOver ? 'text-rose-700' : isUnder ? 'text-amber-700' : 'text-slate-900'}>
                        {totalLOE}%
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {isOver ? (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Over-allocated</span>
                        </span>
                      ) : isUnder ? (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                          <span>Under-allocated ({100 - totalLOE}% capacity)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1 w-max">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Optimal (100% LOE)</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
