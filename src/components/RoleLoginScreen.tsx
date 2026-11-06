import React, { useState, useEffect } from 'react';
import { UserRole, UserAccount } from '../types.ts';
import { DEMO_CREDENTIALS } from '../data/mockData.ts';
import { Logo } from './Logo.tsx';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  UserCheck,
  ShieldCheck,
  UserPlus,
  AlertCircle,
  Check,
  Lock,
  User,
} from 'lucide-react';

interface RoleLoginScreenProps {
  role: UserRole;
  accounts: UserAccount[];
  onBack: () => void;
  onLoginSuccess: (role: UserRole, account?: UserAccount) => void;
  onRegisterAccount?: (newAccount: UserAccount) => void;
}

export const RoleLoginScreen: React.FC<RoleLoginScreenProps> = ({
  role,
  accounts,
  onBack,
  onLoginSuccess,
  onRegisterAccount,
}) => {
  const demoInfo = DEMO_CREDENTIALS[role];

  // Active view: 'login' or 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Rate-limiting state: track failed attempts within last 5 minutes
  const [failedAttempts, setFailedAttempts] = useState<{ id: string; time: number }[]>([]);

  // Registration form state
  const [regUserId, setRegUserId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(role === 'principal' ? 'teacher' : role);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  // Filter accounts belonging to this role
  const roleAccounts = accounts.filter((a) => a.role === role);

  const roleTitleMap = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    parent: 'Parent Login',
    principal: 'Principal Login',
  };

  const identifierLabelMap = {
    student: 'Student ID / Reg Number',
    teacher: 'Faculty User ID',
    parent: 'Parent User ID',
    principal: 'Administrative User ID',
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
    setErrorMessage('');
  };

  const handleAutoFillDemo = () => {
    setIdentifier(demoInfo.identifier);
    setPassword(demoInfo.password);
    setErrorMessage('');
  };

  // Check rate limit: 5 wrong passwords for the same ID in 5 minutes
  const isRateLimited = (cleanId: string): boolean => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentFailsForId = failedAttempts.filter(
      (fa) => fa.id === cleanId && fa.time >= fiveMinutesAgo
    );
    return recentFailsForId.length >= 5;
  };

  const recordFailedAttempt = (cleanId: string) => {
    setFailedAttempts((prev) => [...prev, { id: cleanId, time: Date.now() }]);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim().toLowerCase();

    // Validations
    if (!cleanId) {
      setErrorMessage(`Please enter your ${identifierLabelMap[role].toLowerCase()}.`);
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (isRateLimited(cleanId)) {
      setErrorMessage('Too many tries, wait 5 minutes');
      return;
    }

    setLoading(true);

    // Fast login under 1 second (150ms simulated network latency)
    setTimeout(() => {
      setLoading(false);

      // 1. Principal login check
      if (role === 'principal') {
        const crossCheck = accounts.find((a) => a.identifier.toLowerCase() === cleanId);
        if (crossCheck) {
          recordFailedAttempt(cleanId);
          setErrorMessage('Wrong ID or password');
          return;
        }

        if (cleanId === demoInfo.identifier.toLowerCase() && (password === demoInfo.password || password === 'demo123')) {
          onLoginSuccess('principal');
        } else {
          recordFailedAttempt(cleanId);
          setErrorMessage('Wrong ID or password');
        }
        return;
      }

      // 2. Accounts roster check
      const matchedAccount = accounts.find((a) => a.identifier.toLowerCase() === cleanId);

      if (matchedAccount) {
        // Role mismatch check
        if (matchedAccount.role !== role) {
          recordFailedAttempt(cleanId);
          const capActual = matchedAccount.role.charAt(0).toUpperCase() + matchedAccount.role.slice(1);
          setErrorMessage(`That account is registered as a ${capActual}. Please switch to the ${capActual} login.`);
          return;
        }

        if (matchedAccount.status === 'Suspended') {
          setErrorMessage('This account is suspended. Please contact the institution administration.');
          return;
        }

        if (matchedAccount.password !== password && password !== 'demo123') {
          recordFailedAttempt(cleanId);
          if (isRateLimited(cleanId)) {
            setErrorMessage('Too many tries, wait 5 minutes');
          } else {
            setErrorMessage('Wrong ID or password');
          }
          return;
        }

        onLoginSuccess(role, matchedAccount);
        return;
      }

      // 3. Fallback demo account check
      if (cleanId === demoInfo.identifier.toLowerCase() && (password === demoInfo.password || password === 'demo123')) {
        onLoginSuccess(role);
        return;
      }

      // No match
      recordFailedAttempt(cleanId);
      if (isRateLimited(cleanId)) {
        setErrorMessage('Too many tries, wait 5 minutes');
      } else {
        setErrorMessage('Wrong ID or password');
      }
    }, 180);
  };

  // Handle Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanId = regUserId.trim().toLowerCase();
    const cleanName = regFullName.trim();

    // User ID validation: letters, numbers, underscore, 3-20 chars
    const idRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!idRegex.test(cleanId)) {
      setRegError('User ID must be 3-20 characters using letters, numbers, and underscores only.');
      return;
    }

    if (!cleanName) {
      setRegError('Please enter your full name.');
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }

    // Uniqueness check (case-insensitive)
    const exists = accounts.some((a) => a.identifier.toLowerCase() === cleanId);
    if (exists || cleanId === 'principal.menon') {
      setRegError('That ID is already taken');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const newAccount: UserAccount = {
        id: `acc-${regRole}-${Date.now()}`,
        name: cleanName,
        role: regRole,
        identifier: cleanId,
        password: regPassword,
        status: 'Active',
        createdAt: 'Today',
        email: `${cleanId}@stjude.edu`,
        studentData:
          regRole === 'student'
            ? {
                course: 'B.Tech in Computer Science & Engineering',
                semester: 'Semester 6',
                section: 'Section B',
                rollNo: String(Math.floor(20 + Math.random() * 50)),
                attendanceRate: 100,
              }
            : undefined,
        teacherData:
          regRole === 'teacher'
            ? {
                facultyId: `FAC-${Math.floor(100 + Math.random() * 900)}`,
                department: 'Department of Computer Science',
                designation: 'Faculty Member',
                subjects: ['Data Structures & Algorithms'],
              }
            : undefined,
        parentData:
          regRole === 'parent'
            ? {
                relationship: 'Parent/Guardian',
                linkedStudentRegNumber: 'STU-2026-4401',
                linkedStudentName: 'Aarav Verma',
              }
            : undefined,
      };

      if (onRegisterAccount) {
        onRegisterAccount(newAccount);
      }

      // Immediate redirect to dashboard
      onLoginSuccess(regRole, newAccount);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0f1c18] text-[#e2e8f0] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      {/* Top back button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94a3b8] hover:text-[#5cc79a] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Role Selection</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto">
        <div className="bg-[#16271f] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#233a30]">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <Logo size="lg" className="mb-3" />
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {authMode === 'login' ? roleTitleMap[role] : 'Create Account'}
            </h1>
            <p className="text-xs font-medium text-[#5cc79a] tracking-wide mt-0.5">
              ClassWatch · StudyOn Classroom Platform
            </p>
          </div>

          {/* Mode Tabs: Sign In vs Register (for non-principals) */}
          {role !== 'principal' && (
            <div className="flex rounded-xl bg-[#0f1c18] p-1 border border-[#233a30] mb-5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                  setRegError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer text-center ${
                  authMode === 'login'
                    ? 'bg-[#5cc79a] text-[#0f1c18] font-bold shadow-xs'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage('');
                  setRegError('');
                }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer text-center ${
                  authMode === 'register'
                    ? 'bg-[#5cc79a] text-[#0f1c18] font-bold shadow-xs'
                    : 'text-[#94a3b8] hover:text-white'
                }`}
              >
                Register
              </button>
            </div>
          )}

          {/* AUTH MODE 1: LOGIN FORM */}
          {authMode === 'login' ? (
            <>
              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">{errorMessage}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wider">
                    {identifierLabelMap[role]}
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={identifierPlaceholderMap[role]}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#94a3b8] mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-[#0f1c18] bg-[#5cc79a] hover:bg-[#6ee4b3] transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
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

              {/* Quick-Select Demo Accounts */}
              <div className="mt-6 pt-5 border-t border-[#233a30]">
                <div className="p-3.5 rounded-2xl bg-[#0f1c18] border border-[#233a30]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <KeyRound className="w-3.5 h-3.5 text-[#5cc79a]" />
                      <span>Quick Demo Logins</span>
                    </div>
                    <span className="text-[10px] text-[#5cc79a] bg-[#16271f] px-2 py-0.5 rounded-full border border-[#233a30] font-semibold">
                      Instant Access
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-2.5 max-h-36 overflow-y-auto">
                    {roleAccounts.length > 0 ? (
                      roleAccounts.map((acc) => (
                        <div
                          key={acc.id}
                          className="p-2 rounded-xl bg-[#16271f] border border-[#233a30] flex items-center justify-between text-xs hover:border-[#385e4c] transition-colors"
                        >
                          <div className="truncate pr-2">
                            <div className="font-bold text-white truncate">{acc.name}</div>
                            <div className="text-[11px] font-mono text-[#5cc79a]">
                              {acc.identifier} · <span className="text-[#94a3b8]">{acc.password}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleSelectAccountToFill(acc)}
                            className="px-2.5 py-1 rounded-lg bg-[#1f3d30] hover:bg-[#284f3e] text-[#5cc79a] text-[11px] font-bold shrink-0 border border-[#3b6754] cursor-pointer"
                          >
                            Fill
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="p-2 rounded-xl bg-[#16271f] border border-[#233a30] flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-white">{demoInfo.roleLabel}</div>
                          <div className="text-[11px] font-mono text-[#5cc79a]">{demoInfo.identifier}</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleAutoFillDemo}
                          className="px-2.5 py-1 rounded-lg bg-[#1f3d30] hover:bg-[#284f3e] text-[#5cc79a] text-[11px] font-bold border border-[#3b6754] cursor-pointer"
                        >
                          Fill
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* AUTH MODE 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* User ID */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1 uppercase tracking-wider">
                  User ID
                </label>
                <input
                  type="text"
                  value={regUserId}
                  onChange={(e) => setRegUserId(e.target.value)}
                  placeholder="letters, numbers, underscore only"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                  autoComplete="username"
                  required
                />
                <p className="text-[10px] text-[#64748b] mt-1 leading-tight">
                  Letters, numbers, underscore, 3-20 chars, case-insensitive, unique. This is what you type to log in, not the class code.
                </p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="e.g. Maya Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                  required
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1 uppercase tracking-wider">
                  Role
                </label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white bg-[#0f1c18] outline-none cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="parent">Parent</option>
                </select>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-[#94a3b8] mb-1 uppercase tracking-wider">
                  Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white p-1 cursor-pointer"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-[#0f1c18] bg-[#5cc79a] hover:bg-[#6ee4b3] transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-70"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register & Open Dashboard</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
