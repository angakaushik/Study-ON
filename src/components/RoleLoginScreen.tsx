import React, { useState } from 'react';
import { UserRole } from '../types.ts';
import { DEMO_CREDENTIALS } from '../data/mockData.ts';
import { Logo } from './Logo.tsx';
import { dataService, UserSession } from '../lib/dataService.ts';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  RefreshCw,
  KeyRound,
  UserCheck,
  UserPlus,
  AlertCircle,
} from 'lucide-react';

interface RoleLoginScreenProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (role: UserRole, session?: UserSession) => void;
}

export const RoleLoginScreen: React.FC<RoleLoginScreenProps> = ({
  role,
  onBack,
  onLoginSuccess,
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

  // Registration form state
  const [regUserId, setRegUserId] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>(role === 'principal' ? 'teacher' : role);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');

  const roleTitleMap = {
    student: 'Student Login',
    teacher: 'Teacher Login',
    parent: 'Parent Login',
    principal: 'Principal Login',
  };

  const identifierLabelMap = {
    student: 'Student User ID',
    teacher: 'Faculty User ID',
    parent: 'Parent User ID',
    principal: 'Administrative User ID',
  };

  const identifierPlaceholderMap = {
    student: 'e.g. aarav.verma',
    teacher: 'e.g. teacher.menon',
    parent: 'e.g. parent.verma',
    principal: 'e.g. principal.menon',
  };

  const handleSelectAccountToFill = (idVal: string, passVal: string) => {
    setIdentifier(idVal);
    setPassword(passVal);
    setErrorMessage('');
  };

  const handleAutoFillDemo = () => {
    setIdentifier(demoInfo.identifier);
    setPassword(demoInfo.password || 'demo123');
    setErrorMessage('');
  };

  // Handle Login via DataService
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = identifier.trim().toLowerCase();

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

    setLoading(true);

    try {
      const session = await dataService.login(cleanId, password);

      // Verify role alignment
      if (session.role !== role) {
        const capActual = session.role.charAt(0).toUpperCase() + session.role.slice(1);
        setErrorMessage(`That account is registered as a ${capActual}. Please switch to the ${capActual} login.`);
        setLoading(false);
        return;
      }

      onLoginSuccess(session.role, session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Registration via DataService
  const handleRegisterSubmit = async (e: React.FormEvent) => {
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

    setLoading(true);

    try {
      const session = await dataService.register({
        id: cleanId,
        name: cleanName,
        role: regRole,
        password: regPassword,
      });

      // Immediately log in and open the corresponding dashboard
      onLoginSuccess(session.role, session);
    } catch (err: any) {
      setRegError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
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
                <div className="mb-5 p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2 animate-fadeIn">
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

                {/* Submit Button with Spinner */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm text-[#0f1c18] bg-[#5cc79a] hover:bg-[#6ee4b3] transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Authenticating...</span>
                    </>
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
                      <span>Default Demo Account</span>
                    </div>
                    <span className="text-[10px] text-[#5cc79a] bg-[#16271f] px-2 py-0.5 rounded-full border border-[#233a30] font-semibold">
                      Instant Fill
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#16271f] border border-[#233a30] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white">{demoInfo.roleLabel}</div>
                      <div className="text-[11px] font-mono text-[#5cc79a]">
                        {demoInfo.identifier} · <span className="text-[#94a3b8]">demo123</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAutoFillDemo}
                      className="px-3 py-1 rounded-lg bg-[#1f3d30] hover:bg-[#284f3e] text-[#5cc79a] text-[11px] font-bold border border-[#3b6754] cursor-pointer transition-colors"
                    >
                      Fill
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* AUTH MODE 2: REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {regError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-300 flex items-start gap-2 animate-fadeIn">
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
                  placeholder="e.g. rahul_student"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#2a473b] focus:border-[#5cc79a] text-sm text-white placeholder:text-[#64748b] bg-[#0f1c18] outline-none transition-all"
                  autoComplete="username"
                  required
                />
                <p className="text-[10px] text-[#5cc79a]/90 mt-1 leading-tight">
                  Letters, numbers, underscore, 3-20 chars, case-insensitive, unique. This is what you log in with, not the class code or an email.
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
                  placeholder="e.g. Rahul Sharma"
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
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-[#0f1c18] bg-[#5cc79a] hover:bg-[#6ee4b3] transition-colors shadow-lg flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Open Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
