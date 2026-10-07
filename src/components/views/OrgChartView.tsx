import React from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { Network, MapPin, ChevronDown, User, Shield } from 'lucide-react';

interface OrgChartViewProps {
  onSelectEmployee: (empId: string) => void;
}

export const OrgChartView: React.FC<OrgChartViewProps> = ({ onSelectEmployee }) => {
  const { employees, currentOrg } = useApp();

  if (employees.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-[#0B1A30]" />
            <h2 className="text-lg font-bold text-slate-900">
              Special Children&apos;s Trust — Organogram
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual reporting structure across all 4 SCT centers and departments
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center max-w-lg mx-auto space-y-3 shadow-xs">
          <div className="w-12 h-12 bg-amber-50 text-[#0B1A30] rounded-xl mx-auto flex items-center justify-center border border-amber-200">
            <Network className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Staff Records in Hierarchy</h3>
          <p className="text-xs text-slate-500">
            The organizational hierarchy dynamically reflects active staff members once personnel are registered.
          </p>
        </div>
      </div>
    );
  }

  // Tier 1: Executive Director
  const tier1 = employees.filter((e) => e.jobTitle.includes('Executive Director'));

  // Tier 2: Directors / Department Heads
  const tier2 = employees.filter(
    (e) =>
      e.jobTitle.includes('Director') && !e.jobTitle.includes('Executive Director') ||
      e.jobTitle.includes('Head of')
  );

  // Tier 3: Managers & Field Coordinators
  const tier3 = employees.filter(
    (e) =>
      (e.jobTitle.includes('Manager') || e.jobTitle.includes('Coordinator')) &&
      !tier1.includes(e) &&
      !tier2.includes(e)
  );

  // Tier 4: Specialists & Supervisors
  const tier4 = employees.filter(
    (e) =>
      (e.jobTitle.includes('Specialist') ||
        e.jobTitle.includes('Supervisor') ||
        e.jobTitle.includes('Engineer') ||
        e.jobTitle.includes('Consultant')) &&
      !tier1.includes(e) &&
      !tier2.includes(e) &&
      !tier3.includes(e)
  );

  // Tier 5: Officers, Interns & Field Mobilizers
  const tier5 = employees.filter(
    (e) =>
      !tier1.includes(e) &&
      !tier2.includes(e) &&
      !tier3.includes(e) &&
      !tier4.includes(e)
  );

  const renderCard = (emp: Employee) => (
    <div
      key={emp.id}
      onClick={() => onSelectEmployee(emp.id)}
      className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-3 shadow-xs hover:shadow-md cursor-pointer transition-all w-64 text-left group"
    >
      <div className="flex items-center gap-2.5">
        {(emp.photograph || emp.avatarUrl) ? (
          <img
            src={emp.photograph || emp.avatarUrl}
            alt={emp.firstName}
            referrerPolicy="no-referrer"
            className="w-10 h-10 rounded-full object-cover border border-slate-200"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#0B1A30] text-amber-400 font-bold flex items-center justify-center text-xs">
            {emp.firstName[0]}
            {emp.lastName[0]}
          </div>
        )}
        <div className="overflow-hidden">
          <div className="font-bold text-slate-900 text-xs truncate group-hover:text-amber-600 transition-colors">
            {emp.firstName} {emp.lastName}
          </div>
          <div className="text-[11px] text-slate-500 truncate">{emp.jobTitle}</div>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
        <span className="truncate font-semibold text-[#0B1A30]">{emp.department}</span>
        <span className="flex items-center gap-0.5 text-slate-700 font-medium">
          <MapPin className="w-2.5 h-2.5 text-slate-400" />
          <span>{emp.dutyStation ? emp.dutyStation.split(' — ')[0] : emp.entity}</span>
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-[#0B1A30]" />
          <h2 className="text-base font-black text-[#0B1A30]">
            {currentOrg.name} — Organizational Hierarchy
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Authorized reporting lines: Executive Directorate &rarr; Department Heads &rarr; Program Managers &rarr; Field Coordinators &rarr; Officers
        </p>
      </div>

      {/* Visual Hierarchy Tree */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-6 overflow-x-auto text-center space-y-8 min-w-[900px]">
        {/* Tier 1: Executive Directorate */}
        <div>
          <div className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200">
            Executive Leadership & Board Oversight
          </div>
          <div className="flex justify-center gap-4">
            {tier1.map(renderCard)}
          </div>
          <div className="w-0.5 h-6 bg-slate-300 mx-auto my-2" />
        </div>

        {/* Tier 2: Directorate & Heads of Department */}
        <div>
          <div className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200">
            Directors & Strategic Leads
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {tier2.map(renderCard)}
          </div>
          <div className="w-0.5 h-6 bg-slate-300 mx-auto my-2" />
        </div>

        {/* Tier 3: Managers & Field Coordinators */}
        <div>
          <div className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200">
            Senior Program Managers & Regional Coordinators
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {tier3.map(renderCard)}
          </div>
          <div className="w-0.5 h-6 bg-slate-300 mx-auto my-2" />
        </div>

        {/* Tier 4: Technical Specialists & Supervisors */}
        <div>
          <div className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200">
            Technical Specialists & Operations Supervisors
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {tier4.map(renderCard)}
          </div>
          <div className="w-0.5 h-6 bg-slate-300 mx-auto my-2" />
        </div>

        {/* Tier 5: Field Officers, Interns & Community Mobilizers */}
        <div>
          <div className="inline-block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 bg-white px-3 py-1 rounded-full border border-slate-200">
            Frontline Field Officers & Community Mobilizers
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {tier5.map(renderCard)}
          </div>
        </div>
      </div>
    </div>
  );
};
