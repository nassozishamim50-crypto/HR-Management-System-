import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Candidate, RecruitmentStage, DUTY_STATIONS } from '../../types';
import { X, UserCheck, Check, ArrowRight, Award, FileText, Phone, Mail } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

interface CandidateModalProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export const CandidateModal: React.FC<CandidateModalProps> = ({ candidate, onClose }) => {
  const { currentOrg, updateCandidateStage, convertCandidateToEmployee } = useApp();

  const [stage, setStage] = useState<RecruitmentStage>(candidate?.stage || 'Applied');
  const [interviewScore, setInterviewScore] = useState<number>(candidate?.interviewScore || 75);
  const [interviewNotes, setInterviewNotes] = useState<string>(candidate?.interviewNotes || '');
  const [showHiringPrompt, setShowHiringPrompt] = useState(false);

  if (!candidate) return null;

  const stages: RecruitmentStage[] = [
    'Applied',
    'Screening',
    'Shortlisted',
    'Interview',
    'Assessment',
    'Reference Check',
    'Selected',
    'Offer',
    'Hired',
    'Rejected',
  ];

  const handleSaveStage = () => {
    updateCandidateStage(candidate.id, stage, Number(interviewScore), interviewNotes);
    onClose();
  };

  const handleHireAndOnboard = () => {
    convertCandidateToEmployee(candidate.id, {
      dutyStation: DUTY_STATIONS[0],
      employmentType: 'Fixed-term',
      contractStartDate: new Date().toISOString().split('T')[0],
      contractEndDate: '2027-12-31',
      payroll: {
        basicSalary: candidate.expectedSalary || 4500000,
        currency: currentOrg.currency,
        payFrequency: 'Monthly',
        allowances: {
          hardship: 200000,
          transport: 350000,
          housing: 500000,
          airtimeAndData: 150000,
        },
        deductions: {
          nssfEmployee: Math.round((candidate.expectedSalary || 4500000) * 0.05),
          nssfEmployer: Math.round((candidate.expectedSalary || 4500000) * 0.1),
          payeTax: Math.round((candidate.expectedSalary || 4500000) * 0.2),
          localServiceTax: 100000,
        },
        bankDetails: {
          bankName: 'Stanbic Bank Uganda',
          accountName: candidate.fullName,
          accountNumber: '90300' + Math.floor(1000000 + Math.random() * 9000000),
          branch: 'Main Branch',
          tinNumber: '100' + Math.floor(1000000 + Math.random() * 9000000),
          nssfNumber: 'NSF-' + Math.floor(100000 + Math.random() * 900000) + '-UG',
        },
      },
    });
    alert(`Candidate ${candidate.fullName} has been successfully hired and enrolled into the Staff Onboarding Pipeline!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-base">{candidate.fullName}</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {candidate.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant for: <span className="font-semibold text-emerald-800">{candidate.vacancyTitle}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 text-xs text-slate-700">
          {/* Candidate Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <div>
              <div className="text-slate-400">Experience</div>
              <div className="font-bold text-slate-900 mt-0.5">{candidate.yearsOfExperience} Years</div>
            </div>
            <div>
              <div className="text-slate-400">Applied Date</div>
              <div className="font-medium text-slate-900 mt-0.5">{formatDate(candidate.appliedDate)}</div>
            </div>
            <div>
              <div className="text-slate-400">Expected Salary</div>
              <div className="font-medium text-slate-900 mt-0.5 tabular-nums">
                {formatCurrency(candidate.expectedSalary, currentOrg.currency)}
              </div>
            </div>
            <div>
              <div className="text-slate-400">Resume / CV</div>
              <div className="font-mono text-emerald-700 truncate mt-0.5 flex items-center gap-1">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{candidate.cvFileName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{candidate.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>{candidate.phone}</span>
            </div>
            {candidate.recommendedBy && (
              <div className="text-emerald-700 font-medium">
                Internal Referral: {candidate.recommendedBy}
              </div>
            )}
          </div>

          {/* Pipeline Stage Selector */}
          <div>
            <label className="block text-slate-700 font-bold uppercase tracking-wider text-[11px] mb-2">
              Recruitment Pipeline Stage
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {stages.map((stg) => {
                const isSelected = stage === stg;
                return (
                  <button
                    key={stg}
                    type="button"
                    onClick={() => setStage(stg)}
                    className={`py-2 px-1 text-center rounded-lg text-xs font-medium transition-colors border ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {stg}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Scoring & Notes */}
          <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-white">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-700" />
                <span>Interview Assessment Score (1 – 100)</span>
              </label>
              <span className="text-base font-bold text-emerald-700 tabular-nums">
                {interviewScore} / 100
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={interviewScore}
              onChange={(e) => setInterviewScore(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Interview Panel Notes & Safeguarding Checks
              </label>
              <textarea
                rows={3}
                value={interviewNotes}
                onChange={(e) => setInterviewNotes(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-emerald-600"
                placeholder="Record strengths, technical exam performance, safeguarding references, and recommendations..."
              />
            </div>
          </div>

          {/* Action to Onboard */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-emerald-950 text-xs">
                Ready to Hire this Candidate?
              </div>
              <div className="text-[11px] text-emerald-800">
                Instantly converts profile into full employee record and generates onboarding checklist.
              </div>
            </div>
            <button
              type="button"
              onClick={handleHireAndOnboard}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Hire & Launch Onboarding</span>
            </button>
          </div>

          {/* Footer Save */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSaveStage}
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Stage & Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
