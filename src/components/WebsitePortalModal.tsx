import React, { useState } from 'react';
import { EducationalWebsiteItem } from '../types.ts';
import {
  Globe,
  ExternalLink,
  X,
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  FileEdit,
  ShieldCheck,
} from 'lucide-react';

interface WebsitePortalModalProps {
  website: EducationalWebsiteItem | null;
  onClose: () => void;
  onCompleteSession: (minutes: number) => void;
}

export const WebsitePortalModal: React.FC<WebsitePortalModalProps> = ({
  website,
  onClose,
  onCompleteSession,
}) => {
  const [scratchpad, setScratchpad] = useState('');
  const [completed, setCompleted] = useState(false);

  if (!website) return null;

  const handleFinish = () => {
    onCompleteSession(15);
    setCompleted(true);
    setTimeout(() => {
      setCompleted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full border border-sky-100 shadow-2xl animate-in fade-in zoom-in-95 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-900 px-2.5 py-0.5 rounded-full border border-sky-200">
                {website.subject}
              </span>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {website.category}
              </span>
              <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1 bg-sky-50 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3 text-sky-600" />
                Verified Educational Source
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {website.title}
            </h2>
          </div>
        </div>

        {/* Portal Info Card */}
        <div className="mt-5 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
          <div className="text-xs text-slate-700 leading-relaxed">
            {website.description}
          </div>
          <div className="mt-3 pt-3 border-t border-sky-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
            <span>Curated by: <strong>{website.addedBy}</strong> ({website.addedByRole})</span>
            <span>Published: {website.addedDate}</span>
          </div>
        </div>

        {/* Portal Launch Action */}
        <div className="mt-5 p-4 rounded-2xl bg-white border border-sky-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-slate-500 uppercase">
              Web Address
            </div>
            <div className="text-xs font-semibold text-sky-700 truncate mt-0.5">
              {website.url}
            </div>
          </div>

          <a
            href={website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-2 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open External Portal</span>
          </a>
        </div>

        {/* Study Scratchpad */}
        <div className="mt-5 space-y-2">
          <label className="block text-[11px] font-bold text-slate-700 uppercase flex items-center gap-1.5">
            <FileEdit className="w-3.5 h-3.5 text-sky-600" />
            <span>Interactive Study Notes & Scratchpad</span>
          </label>
          <textarea
            rows={3}
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            placeholder="Record important concepts, algorithm steps, or questions while reviewing this portal..."
            className="w-full text-xs p-3 rounded-2xl bg-sky-50/50 border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Footer actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-sky-100">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Logging 15 mins to your personal study activity timeline</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleFinish}
              disabled={completed}
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{completed ? 'Session Logged!' : 'Finish & Record Session'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
