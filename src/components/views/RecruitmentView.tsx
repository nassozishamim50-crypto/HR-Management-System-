import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidate, RecruitmentStage, Vacancy } from '../../types';
import {
  UserPlus,
  Briefcase,
  Search,
  Filter,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Plus,
  FileText,
  MapPin,
  Building,
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface RecruitmentViewProps {
  onOpenVacancyModal: () => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  onOpenVacancyModal,
  onSelectCandidate,
}) => {
  const { vacancies, candidates, permissions, currentOrg } = useApp();

  const [selectedVacancyId, setSelectedVacancyId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stages: RecruitmentStage[] = [
    'Applied',
    'Screening',
    'Shortlisted',
    'Interview',
    'Assessment',
    'Offer',
    'Hired',
  ];

  const filteredCandidates = candidates.filter((c) => {
    const matchesVacancy = selectedVacancyId === 'all' || c.vacancyId === selectedVacancyId;
    const title = c.vacancyPosition || c.vacancyTitle || '';
    const matchesSearch =
      searchQuery === '' ||
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesVacancy && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Vacancy Summary */}
      <div className="bg-white border-b-2 border-amber-400 border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-[#0B1A30] flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-500" />
              <span>Recruitment Pipeline & Applicant Tracking System (ATS)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Structured hiring workflow with interview scoring, candidate comparisons and onboarding handoff
            </p>
          </div>

          <div className="flex items-center gap-2">
            {permissions.canManageRecruitment && (
              <button
                onClick={onOpenVacancyModal}
                className="btn-sct-primary flex items-center gap-1.5 px-3.5 py-2 text-xs rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Vacancy</span>
              </button>
            )}
          </div>
        </div>

        {/* Vacancy Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedVacancyId('all')}
            className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors ${
              selectedVacancyId === 'all'
                ? 'bg-[#0B1A30] text-amber-400 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Openings ({candidates.length} Applicants)
          </button>
          {vacancies.map((v) => {
            const count = candidates.filter((c) => c.vacancyId === v.id).length;
            const isSelected = selectedVacancyId === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVacancyId(v.id)}
                className={`px-3 py-1.5 rounded-lg font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B1A30] text-amber-400 shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{v.position}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-amber-400 text-[#0B1A30]' : 'bg-white text-slate-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Live Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicants by name, vacancy title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Active Vacancies Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {vacancies.map((v) => (
          <div key={v.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  {v.entity}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  Closing: {formatDate(v.closingDate)}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-2">{v.position}</h3>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{v.department}</span>
              </div>
              {v.donor && (
                <div className="text-[11px] text-slate-600 mt-1">
                  Donor: <span className="font-semibold text-slate-800">{v.donor}</span>
                </div>
              )}
              <p className="text-slate-600 text-xs mt-2 line-clamp-2">{v.jobDescription || v.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">
                {candidates.filter((c) => c.vacancyId === v.id).length} Applied
              </span>
              <button
                onClick={() => setSelectedVacancyId(v.id)}
                className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Filter Candidates</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Pipeline Stages Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            Recruitment Funnel Pipeline
          </h3>
          <span className="text-xs text-slate-500">
            Click candidate to record interview scores, assessment notes, or hire directly
          </span>
        </div>

        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-[1200px]">
            {stages.map((stageName) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === stageName);
              return (
                <div
                  key={stageName}
                  className="flex-1 bg-slate-100/70 border border-slate-200 rounded-xl p-3 flex flex-col min-w-[200px]"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                    <span className="font-bold text-slate-800 text-xs">{stageName}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white text-slate-700 shadow-xs tabular-nums">
                      {stageCandidates.length}
                    </span>
                  </div>

                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[500px]">
                    {stageCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        onClick={() => onSelectCandidate(candidate)}
                        className="bg-white p-3 rounded-lg border border-slate-200 hover:border-emerald-600 transition-colors cursor-pointer shadow-2xs space-y-2"
                      >
                        <div className="font-bold text-slate-900 text-xs hover:text-emerald-700">
                          {candidate.fullName}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {candidate.vacancyPosition || candidate.vacancyTitle}
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100 text-slate-500">
                          <span>{candidate.yearsOfExperience} yrs exp</span>
                          {candidate.interviewScore !== undefined && (
                            <span className="font-bold text-emerald-700 tabular-nums">
                              Score: {candidate.interviewScore}%
                            </span>
                          )}
                        </div>
                      </div>
                    ))}

                    {stageCandidates.length === 0 && (
                      <div className="py-6 text-center text-slate-400 text-[11px] border border-dashed border-slate-200 rounded-lg">
                        Empty stage
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
