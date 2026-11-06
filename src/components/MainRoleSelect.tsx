import React from 'react';
import { UserRole } from '../types.ts';
import { Logo } from './Logo.tsx';
import { GraduationCap, BookOpen, Users, Building2, ChevronRight } from 'lucide-react';

interface MainRoleSelectProps {
  onSelectRole: (role: UserRole) => void;
  onQuickDemo: (role: UserRole) => void;
}

export const MainRoleSelect: React.FC<MainRoleSelectProps> = ({ onSelectRole, onQuickDemo }) => {
  const roles: {
    id: UserRole;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'student',
      title: 'Student Login',
      description: 'Sign in with registration number',
      icon: GraduationCap,
    },
    {
      id: 'teacher',
      title: 'Teacher Login',
      description: 'Sign in with faculty username',
      icon: BookOpen,
    },
    {
      id: 'parent',
      title: 'Parent Login',
      description: 'Sign in with parent credentials',
      icon: Users,
    },
    {
      id: 'principal',
      title: 'Principal Login',
      description: 'Sign in with administrative username',
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-sky-50/70 flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" className="mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            StudyOn
          </h1>
          <p className="text-base font-semibold text-sky-700 tracking-wide mt-0.5">
            Student Educator
          </p>
        </div>

        {/* Four Main Login Option Cards */}
        <div className="space-y-3.5">
          {roles.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSelectRole(item.id)}
                className="w-full bg-white hover:bg-sky-50/80 active:bg-sky-100/70 border border-sky-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-150 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900 group-hover:text-sky-900 transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Prototype Demo Fast-Access Bar */}
        <div className="mt-8 pt-6 border-t border-sky-200/60 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-100/80 text-sky-800 text-xs font-medium mb-3">
            <span>Prototype Quick Access</span>
          </div>
          <p className="text-xs text-slate-500 mb-3">
            Test any role immediately without typing credentials:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => onQuickDemo('student')}
              className="px-2.5 py-1.5 text-xs font-medium text-sky-800 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 active:bg-sky-100 transition-colors shadow-2xs"
            >
              Demo Student
            </button>
            <button
              onClick={() => onQuickDemo('teacher')}
              className="px-2.5 py-1.5 text-xs font-medium text-sky-800 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 active:bg-sky-100 transition-colors shadow-2xs"
            >
              Demo Teacher
            </button>
            <button
              onClick={() => onQuickDemo('parent')}
              className="px-2.5 py-1.5 text-xs font-medium text-sky-800 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 active:bg-sky-100 transition-colors shadow-2xs"
            >
              Demo Parent
            </button>
            <button
              onClick={() => onQuickDemo('principal')}
              className="px-2.5 py-1.5 text-xs font-medium text-sky-800 bg-white border border-sky-200 rounded-lg hover:bg-sky-50 active:bg-sky-100 transition-colors shadow-2xs"
            >
              Demo Principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
