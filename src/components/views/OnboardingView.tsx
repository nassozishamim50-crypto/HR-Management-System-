import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OnboardingChecklist } from '../../types';
import {
  CheckSquare,
  UserCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const OnboardingView: React.FC = () => {
  const { onboarding, toggleOnboardingTask, currentUser, permissions } = useApp();

  const [expandedId, setExpandedId] = useState<string>(onboarding[0]?.id || '');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-700" />
          <h2 className="text-base font-bold text-slate-900">
            Staff Onboarding & Compliance Integration
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Structured new hire workflows: Safeguarding certification, statutory credentials, IT assets, and field duty station briefings.
        </p>
      </div>

      {/* Checklists List */}
      <div className="space-y-4">
        {onboarding.map((checklist: any) => {
          const isExpanded = expandedId === checklist.id;
          const completedCount = (checklist.tasks || []).filter((t: any) => t.completed).length;
          const progress = checklist.progressPercentage || checklist.completionPercentage || 0;

          return (
            <div
              key={checklist.id}
              className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
            >
              {/* Checklist Accordion Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? '' : checklist.id)}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm shrink-0">
                    {checklist.employeeName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{checklist.employeeName}</h3>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {checklist.department}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {checklist.jobTitle} · Enrolled {formatDate(checklist.startDate)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-48 text-right">
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-500">{completedCount} of {(checklist.tasks || []).length} Done</span>
                      <span className="text-emerald-700 tabular-nums">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button className="text-slate-400 p-1">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Tasks Checklist Grid */}
              {isExpanded && (
                <div className="p-5 border-t border-slate-100 bg-slate-50/40 space-y-3">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Onboarding Verification Checklist
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(checklist.tasks || []).map((task: any) => (
                      <div
                        key={task.id}
                        onClick={() => permissions.canManageEmployees && toggleOnboardingTask(checklist.id, task.id)}
                        className={`p-3 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                          task.completed
                            ? 'bg-white border-emerald-200 text-slate-800'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
                        />
                        <div className="flex-1 text-xs">
                          <div className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {task.title}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span className="font-medium text-slate-600">{task.category}</span>
                            {task.completedAt && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span>Verified on {formatDate(task.completedAt)} by {task.completedBy}</span>
                              </>
                            )}
                            {task.notes && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-amber-700">{task.notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
