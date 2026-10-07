import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PerformanceReview } from '../../types';
import { Award, CheckCircle2, Star, Calendar, ChevronRight, User } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface PerformanceViewProps {
  onSelectEmployee: (empId: string) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ onSelectEmployee }) => {
  const { performance, updatePerformanceReview, permissions } = useApp();

  const [selectedReview, setSelectedReview] = useState<PerformanceReview>(performance[0] || null);

  const handleUpdateRating = (objId: string, rating: number) => {
    if (!selectedReview) return;
    const updatedObjs = selectedReview.objectives.map((o: any) =>
      o.id === objId ? { ...o, supervisorRating: rating, rating } : o
    );
    const avg =
      updatedObjs.reduce((sum: number, o: any) => sum + (o.supervisorRating || o.rating || 3) * ((o.weight || 25) / 100), 0);
    const updated = {
      ...selectedReview,
      objectives: updatedObjs,
      overallRating: Number(avg.toFixed(1)),
      overallScore: Number(avg.toFixed(1)),
    };
    setSelectedReview(updated);
    updatePerformanceReview(selectedReview.id, updated);
  };

  const handleFinalize = () => {
    if (!selectedReview) return;
    const updated = {
      ...selectedReview,
      status: 'Finalized' as const,
      finalizedAt: new Date().toISOString().split('T')[0],
    };
    setSelectedReview(updated);
    updatePerformanceReview(selectedReview.id, updated);
    alert(`Performance Appraisal for ${selectedReview.employeeName} finalized successfully!`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-black text-[#162365]">
            Staff Performance Management & Development Cycles
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Objectives, KPI ratings, 360-degree review workflow, and career growth plans for humanitarian personnel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appraisal Cycles Roster */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            Appraisal Roster ({performance.length})
          </h3>

          <div className="space-y-2">
            {performance.map((pr) => {
              const isSelected = selectedReview?.id === pr.id;
              return (
                <div
                  key={pr.id}
                  onClick={() => setSelectedReview(pr)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">{pr.employeeName}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                      {pr.status || pr.reviewStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">{pr.cycleName || pr.reviewPeriod}</div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2">
                    <span>Supervisor: {pr.supervisorName || pr.supervisor}</span>
                    {(pr.overallScore || pr.overallRating) && (
                      <span className="font-bold text-emerald-700 tabular-nums">
                        Rating: {pr.overallScore || pr.overallRating} / 5
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Review Dossier */}
        {selectedReview ? (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{selectedReview.employeeName}</h3>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedReview.cycleName || selectedReview.reviewPeriod}
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {selectedReview.department}
                </div>
              </div>

              {(selectedReview.overallScore || selectedReview.overallRating) && (
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Overall Score</div>
                  <div className="text-xl font-extrabold text-emerald-700 tabular-nums">
                    {selectedReview.overallScore || selectedReview.overallRating} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
                  </div>
                </div>
              )}
            </div>

            {/* Objectives & KPI Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Performance Objectives & KPI Weightings
              </h4>

              <div className="space-y-3">
                {selectedReview.objectives.map((obj: any) => (
                  <div key={obj.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-slate-900">{obj.title}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{obj.kpi}</div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 tabular-nums">
                        Weight: {obj.weight || 25}%
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-500 text-[11px]">Staff Self Rating: </span>
                        <span className="font-bold text-slate-800 tabular-nums">{obj.selfRating} / 5</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[11px]">Supervisor Rating: </span>
                        <input
                          type="range"
                          min="1"
                          max="5"
                          step="0.1"
                          disabled={!permissions.canManagePerformance || selectedReview.status === 'Finalized'}
                          value={obj.supervisorRating}
                          onChange={(e) => handleUpdateRating(obj.id, Number(e.target.value))}
                          className="w-24 accent-emerald-700 cursor-pointer"
                        />
                        <span className="font-bold text-emerald-700 tabular-nums">
                          {obj.supervisorRating}
                        </span>
                      </div>
                    </div>

                    {obj.comments && (
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 italic">
                        "{obj.comments}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Development Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-lg">
                <div className="font-bold text-emerald-950 mb-1">Demonstrated Strengths</div>
                <p className="text-emerald-900 text-[11px] leading-relaxed">{selectedReview.strengths || selectedReview.achievements}</p>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <div className="font-bold text-blue-950 mb-1">Professional Development Plan</div>
                <p className="text-blue-900 text-[11px] leading-relaxed">{selectedReview.developmentPlan || selectedReview.trainingNeeds}</p>
              </div>
            </div>

            {/* Actions */}
            {selectedReview.status !== 'Finalized' && permissions.canManagePerformance && (
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  onClick={handleFinalize}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finalize & Endorse Appraisal</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-20 text-slate-400">
            Select an appraisal from the list to view KPI scorecard.
          </div>
        )}
      </div>
    </div>
  );
};
