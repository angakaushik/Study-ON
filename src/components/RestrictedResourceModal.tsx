import React, { useState } from 'react';
import { ResourceRestrictionRule } from '../types.ts';
import {
  ShieldAlert,
  Lock,
  X,
  Send,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  User,
  BookOpen,
} from 'lucide-react';

interface RestrictedResourceModalProps {
  isOpen: boolean;
  resourceTitle: string;
  resourceType: string;
  resourceCategory?: string;
  violatingRule?: ResourceRestrictionRule;
  fallbackReason?: string;
  priorityLevel?: number;
  decidedByRole?: string;
  onClose: () => void;
  onRequestAccess: (reason: string) => void;
  onNavigateToPermitted: () => void;
}

export const RestrictedResourceModal: React.FC<RestrictedResourceModalProps> = ({
  isOpen,
  resourceTitle,
  resourceType,
  resourceCategory,
  violatingRule,
  fallbackReason,
  priorityLevel = 1,
  decidedByRole = 'institution',
  onClose,
  onRequestAccess,
  onNavigateToPermitted,
}) => {
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);

  if (!isOpen) return null;

  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) return;
    onRequestAccess(requestReason.trim());
    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setShowRequestForm(false);
      setRequestReason('');
      onClose();
    }, 2500);
  };

  const priorityLabel =
    priorityLevel === 1
      ? 'Priority 1: Institution-Wide Policy (Principal)'
      : priorityLevel === 2
      ? 'Priority 2: Parental Control Policy'
      : priorityLevel === 3
      ? 'Priority 3: Teacher Classroom Restriction'
      : 'Institutional Security Policy';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-sky-100 shadow-2xl animate-in fade-in zoom-in-95 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Restriction Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
              Access Restricted
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1 leading-snug">
              This Educational Resource is Currently Restricted
            </h2>
          </div>
        </div>

        {/* Resource details */}
        <div className="mt-4 p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">
            Target Resource
          </div>
          <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">
            {resourceTitle}
          </div>
          <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-2">
            <span className="capitalize font-medium">{resourceType}</span>
            {resourceCategory && (
              <>
                <span>•</span>
                <span>Category: {resourceCategory}</span>
              </>
            )}
          </div>
        </div>

        {/* Explanation & Priority Notice */}
        <div className="mt-4 space-y-2.5">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed">
            <div className="font-bold text-slate-900 flex items-center gap-1.5 mb-1">
              <Info className="w-4 h-4 text-sky-600" />
              <span>Reason for Restriction</span>
            </div>
            <p className="text-slate-700">
              {violatingRule?.reason || fallbackReason || 'Access is not permitted under current institutional guidelines.'}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50/50 border border-sky-100 text-[11px] text-slate-600 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-900">Enforcement Level:</span>
              <span className="font-bold text-sky-800">{priorityLabel}</span>
            </div>
            {violatingRule?.createdByName && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Configured By:</span>
                <span className="font-medium text-slate-700">{violatingRule.createdByName}</span>
              </div>
            )}
            {violatingRule?.startTime && violatingRule?.endTime && (
              <div className="flex items-center justify-between text-slate-500">
                <span>Active Time Window:</span>
                <span className="font-medium text-slate-700">
                  {violatingRule.startTime} — {violatingRule.endTime}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Request Access Form or Feedback */}
        {requestSubmitted ? (
          <div className="mt-4 p-4 rounded-2xl bg-sky-600 text-white text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Permission request submitted! Your teacher or parent will review your request.
            </span>
          </div>
        ) : showRequestForm ? (
          <form onSubmit={handleSendRequest} className="mt-4 space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Reason for Requesting Permission
              </label>
              <textarea
                rows={3}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Explain why this educational material is required for your studies..."
                className="w-full text-xs p-3 rounded-xl bg-sky-50/70 border border-sky-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        ) : null}

        {/* Action Buttons */}
        {!showRequestForm && !requestSubmitted && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-sky-100">
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 font-bold text-xs border border-sky-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-sky-700" />
              <span>Request Permission</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateToPermitted();
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>View Approved Resources</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
