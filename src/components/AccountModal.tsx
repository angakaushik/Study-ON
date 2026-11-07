import React, { useState } from 'react';
import { UserSession, dataService } from '../lib/dataService.ts';
import {
  X,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  session: UserSession | null;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  session,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen || !session) return null;

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!oldPassword) {
      setErrorMessage('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await dataService.changePassword(session.userId, oldPassword, newPassword);
      setSuccessMessage('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#16271f] border border-[#233a30] rounded-3xl max-w-lg w-full p-6 text-white shadow-2xl relative overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[#233a30] mb-5">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8] hover:text-[#5cc79a] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#0f1c18] hover:bg-[#1a3328] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Identity Box */}
        <div className="p-4 rounded-2xl bg-[#0f1c18] border border-[#233a30] mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#1f3d30] border border-[#5cc79a]/40 flex items-center justify-center text-[#5cc79a] font-bold text-lg shrink-0">
            {session.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-base truncate">{session.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#1f3d30] text-[#5cc79a] border border-[#3b6754]">
                {session.role}
              </span>
            </div>
            <div className="text-xs text-[#94a3b8] font-mono mt-0.5">
              User ID: <span className="text-[#5cc79a] font-semibold">{session.identifier}</span>
            </div>
            {session.studentData && (
              <div className="text-[11px] text-[#64748b]">
                {session.studentData.regNumber} · {session.studentData.course}
              </div>
            )}
            {session.teacherData && (
              <div className="text-[11px] text-[#64748b]">
                {session.teacherData.facultyId} · {session.teacherData.department}
              </div>
            )}
          </div>
        </div>

        {/* Change Password Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <KeyRound className="w-4 h-4 text-[#5cc79a]" />
            <h4 className="text-sm font-bold text-white">Change Account Password</h4>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                Current Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-xs text-white bg-[#0f1c18] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                New Password (minimum 6 characters)
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-xs text-white bg-[#0f1c18] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94a3b8] mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                minLength={6}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-xs text-white bg-[#0f1c18] outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#94a3b8] hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 rounded-xl bg-[#5cc79a] hover:bg-[#6ee4b3] text-[#0f1c18] font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 transition-all shadow-md"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
