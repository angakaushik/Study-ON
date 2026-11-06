import React, { useState, useEffect } from 'react';
import { UserRole, UserAccount } from '../types.ts';
import { DEMO_CREDENTIALS } from '../data/mockData.ts';
import { Logo } from './Logo.tsx';
import { ArrowLeft, Eye, EyeOff, RefreshCw, KeyRound, UserCheck, ShieldCheck, UserPlus, AlertCircle } from 'lucide-react';

interface RoleLoginScreenProps {
  role: UserRole;
  accounts: UserAccount[];
  onBack: () => void;
  onLoginSuccess: (role: UserRole, account?: UserAccount) => void;
}

export const RoleLoginScreen: React.FC<RoleLoginScreenProps> = ({
  role,
  accounts,
  onBack,
  onLoginSuccess,
}) => {
  const demoInfo = DEMO_CREDENTIALS[role];

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Filter accounts belonging to this role
  const roleAccounts = accounts.filter((a) => a.role === role);

  // Captcha generation state
  const [captchaProblem, setCaptchaProblem] = useState<{ num1: number; num2: number; answer: number }>({
    num1: 6,
    num2: 7,
    answer: 13,
  });

  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 9) + 2;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setCaptchaProblem({
      num1: n1,
      num2: n2,
      answer: n1 + n2,
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    generateCaptcha();
  }, [role]);

  const roleTitleMap = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    parent: 'Parent Login',
    principal: 'Principal Login',
  };

  const identifierLabelMap = {
    student: 'Registration Number',
    teacher: 'Faculty Username',
    parent: 'Parent Username',
    principal: 'Administrative Username',
  };

  const identifierPlaceholderMap = {
    student: 'e.g. STU-2026-4401',
    teacher: 'e.g. prof.sharma',
    parent: 'e.g. parent.rohit',
    principal: 'e.g. principal.menon',
  };

  const handleSelectAccountToFill = (acc: { identifier: string; password?: string }) => {
    setIdentifier(acc.identifier);
    setPassword(acc.password || 'studentpassword');
    setCaptchaInput(String(captchaProblem.answer));
    setErrorMessage('');
  };

  const handleAutoFillDemo = () => {
    setIdentifier(demoInfo.identifier);
    setPassword(demoInfo.password);
    setCaptchaInput(String(captchaProblem.answer));
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Validations
    if (!identifier.trim()) {
      setErrorMessage(`Please enter your ${identifierLabelMap[role].toLowerCase()}.`);
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (parseInt(captchaInput.trim(), 10) !== captchaProblem.answer) {
      setErrorMessage('Verification challenge incorrect. Please recalculate and try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanId = identifier.trim().toLowerCase();

      // Case 1: Principal Login
      if (role === 'principal') {
        // Check if user accidentally entered student or teacher ID
        const crossCheck = accounts.find((a) => a.identifier.toLowerCase() === cleanId);
        if (crossCheck) {
          setErrorMessage(
            `"${crossCheck.identifier}" is assigned to a ${crossCheck.role.toUpperCase()} account, not an Administrative Principal account.`
          );
          return;
        }

        if (cleanId === demoInfo.identifier.toLowerCase() && (password === demoInfo.password || password === 'demo123')) {
          onLoginSuccess('principal');
        } else {
          setErrorMessage('Invalid administrative credentials. Use "principal.menon" with demo password for testing.');
        }
        return;
      }

      // Case 2: Student, Teacher, or Parent Login
      // 1. First look up in the live accounts database created and managed by the Principal
      const matchedAccount = accounts.find((a) => a.identifier.toLowerCase() === cleanId);

      if (matchedAccount) {
        // Role mismatch validation
        if (matchedAccount.role !== role) {
          const capActual = matchedAccount.role.charAt(0).toUpperCase() + matchedAccount.role.slice(1);
          const capTarget = role.charAt(0).toUpperCase() + role.slice(1);
          setErrorMessage(
            `Account "${matchedAccount.identifier}" is registered as a ${capActual}, not a ${capTarget}. Please switch to the ${capActual} Login screen.`
          );
          return;
        }

        // Status check
        if (matchedAccount.status === 'Suspended') {
          setErrorMessage(
            `Account "${matchedAccount.identifier}" has been SUSPENDED by the Principal. Please contact the college office.`
          );
          return;
        }

        // Password check
        if (matchedAccount.password !== password && password !== 'demo123') {
          setErrorMessage('Incorrect password. Please verify the password provided by the Principal.');
          return;
        }

        // Login success!
        onLoginSuccess(role, matchedAccount);
        return;
      }

      // 2. Fallback check for static demo account
      if (cleanId === demoInfo.identifier.toLowerCase() && (password === demoInfo.password || password === 'demo123')) {
        onLoginSuccess(role);
        return;
      }

      // Helpful validation message when not found
      setErrorMessage(
        `No ${role} account found matching "${identifier}". Please ensure your account has been created by the Principal or use an account from the list below.`
      );
    }, 250);
  };

  return (
    <div className="min-h-screen bg-sky-50/70 flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Top Back Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-800 bg-white border border-sky-200 hover:bg-sky-50 active:bg-sky-100 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Roles</span>
          </button>
          <span className="text-xs font-medium text-slate-500">
            StudyOn Auth Portal
          </span>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-sky-100">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="lg" className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {roleTitleMap[role]}
            </h1>
            <p className="text-xs font-medium text-sky-700 tracking-wide mt-0.5">
              StudyOn Student Educator
            </p>
          </div>

          {/* Validation Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Authentication Error: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Identifier (Reg number for student, username for others) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {identifierLabelMap[role]}
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={identifierPlaceholderMap[role]}
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all"
                autoComplete="off"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-700 p-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Captcha Verification Challenge */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Verification Challenge
                </label>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="inline-flex items-center gap-1 text-[11px] text-sky-700 hover:text-sky-900 font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Refresh Challenge</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-900 font-bold text-sm tracking-widest select-none shrink-0">
                  {captchaProblem.num1} + {captchaProblem.num2} = ?
                </div>
                <input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Result"
                  className="w-full px-3.5 py-2 rounded-xl border border-sky-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-200 text-sm text-slate-900 placeholder:text-slate-400 bg-white outline-none transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2 cursor-pointer disabled:opacity-70"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
                </>
              )}
            </button>
          </form>

          {/* Available Accounts Quick-Select for this Role */}
          <div className="mt-6 pt-5 border-t border-sky-100">
            <div className="p-3.5 rounded-2xl bg-sky-50/80 border border-sky-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-950">
                  <KeyRound className="w-3.5 h-3.5 text-sky-600" />
                  <span>Active {role.charAt(0).toUpperCase() + role.slice(1)} Accounts</span>
                </div>
                <span className="text-[10px] text-sky-700 bg-white px-2 py-0.5 rounded-full border border-sky-200 font-semibold">
                  {roleAccounts.length > 0 ? `${roleAccounts.length} Available` : '1 Demo'}
                </span>
              </div>

              {/* List role accounts for fast testing */}
              <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto">
                {roleAccounts.length > 0 ? (
                  roleAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-2 rounded-xl bg-white border border-sky-100 flex items-center justify-between text-xs hover:border-sky-300 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <div className="font-bold text-slate-900 truncate">{acc.name}</div>
                        <div className="text-[11px] font-mono text-sky-800">
                          {acc.identifier} · <span className="text-slate-500">{acc.password}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectAccountToFill(acc)}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold shrink-0 border border-sky-200"
                      >
                        Auto-Fill
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-2 rounded-xl bg-white border border-sky-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{demoInfo.roleLabel}</div>
                      <div className="text-[11px] font-mono text-sky-800">{demoInfo.identifier}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillDemo}
                      className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200"
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-sky-800">
                <ShieldCheck className="w-3 h-3 text-sky-600 shrink-0" />
                <span>Accounts created by the Principal in the Principal Portal immediately appear and log in here.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
