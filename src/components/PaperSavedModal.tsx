import React from 'react';
import { X, Leaf, Droplets, Wind, FileText, CheckCircle2, Info } from 'lucide-react';

interface PaperSavedModalProps {
  isOpen: boolean;
  onClose: () => void;
  notesReadCount: number;
  assignmentsSubmittedCount: number;
  studyMinutesCount: number;
}

export const PaperSavedModal: React.FC<PaperSavedModalProps> = ({
  isOpen,
  onClose,
  notesReadCount,
  assignmentsSubmittedCount,
  studyMinutesCount,
}) => {
  if (!isOpen) return null;

  // Transparent calculation model
  const pagesFromNotes = notesReadCount * 14;
  const pagesFromAssignments = assignmentsSubmittedCount * 5;
  const pagesFromStudy = Math.round((studyMinutesCount / 45) * 6);
  const totalPagesSaved = 82 + pagesFromNotes + pagesFromAssignments + pagesFromStudy;

  // Environmental equivalents
  const waterSavedLiters = ((totalPagesSaved * 0.1)).toFixed(1);
  const co2AvoidedKg = ((totalPagesSaved * 0.012)).toFixed(2);
  const treeFraction = ((totalPagesSaved / 8333) * 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-sky-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold">Paper Saved Estimate</h3>
              <p className="text-xs text-sky-100">Eco-Friendly Digital Learning</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-white/80 hover:text-white hover:bg-white/10 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Main Stat Banner */}
          <div className="text-center p-5 rounded-2xl bg-sky-50 border border-sky-200">
            <div className="text-xs font-bold text-sky-800 uppercase tracking-wider mb-1">
              Estimated Total Pages Conserved
            </div>
            <div className="text-5xl font-extrabold text-slate-900 tracking-tight my-2">
              {totalPagesSaved} <span className="text-lg font-medium text-slate-600">pages</span>
            </div>
            <p className="text-xs text-slate-600">
              By viewing digital notes, turning in digital assignments, and utilizing paperless Study Mode.
            </p>
          </div>

          {/* Breakdown by Activity */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 mb-2.5">
              Transparent Calculation Breakdown:
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span className="text-slate-800">Digital Lecture Notes Read</span>
                </div>
                <span className="font-semibold text-slate-900">~{pagesFromNotes + 45} pages</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span className="text-slate-800">Electronic Assignments Submitted</span>
                </div>
                <span className="font-semibold text-slate-900">~{pagesFromAssignments + 25} pages</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-100">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-sky-600" />
                  <span className="text-slate-800">Study Mode Digital Scratchpads</span>
                </div>
                <span className="font-semibold text-slate-900">~{pagesFromStudy + 12} pages</span>
              </div>
            </div>
          </div>

          {/* Environmental Equivalents */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-700 mb-1">
                <Droplets className="w-4 h-4" />
                <span className="text-xs font-bold">Water Preserved</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{waterSavedLiters} L</div>
            </div>

            <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-center">
              <div className="flex items-center justify-center gap-1 text-sky-700 mb-1">
                <Wind className="w-4 h-4" />
                <span className="text-xs font-bold">CO2 Avoided</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{co2AvoidedKg} kg</div>
            </div>
          </div>

          {/* Explanation that it is an estimate */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Estimate Notice:</strong> This counter provides an educational approximation based on standard academic notebook consumption (~500 pages per semester) and printout averages. Actual physical paper savings vary depending on course syllabus.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-sky-50/50 border-t border-sky-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-500 shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
