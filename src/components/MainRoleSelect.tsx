import React from 'react';
import { UserRole } from '../types.ts';
import { Logo } from './Logo.tsx';
import { GraduationCap, BookOpen, Users, Building2, ChevronRight, Shield } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0f1c18] flex flex-col justify-center items-center px-4 py-8 sm:px-6 text-[#f0fdf4]">
      <div className="w-full max-w-md">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" className="mb-4" />
          <h1 className="text-3xl font-bold tracking-tight text-[#f0fdf4]">
            StudyOn
          </h1>
          <p className="text-sm font-semibold text-[#5cc79a] tracking-wide mt-1 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-[#5cc79a]" />
            <span>ClassWatch Student Educator Portal</span>
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
                className="w-full bg-[#16271f] hover:bg-[#1a3328] active:bg-[#12221b] border border-[#233a30] hover:border-[#5cc79a]/60 rounded-2xl p-4 shadow-md transition-all duration-150 flex items-center justify-between text-left group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1f3d30] text-[#5cc79a] flex items-center justify-center shrink-0 group-hover:bg-[#5cc79a] group-hover:text-[#0f1c18] transition-colors shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-[#f0fdf4] group-hover:text-[#5cc79a] transition-colors">
                      {item.title}
                    </h2>
                    <p className="text-xs text-[#94a3b8]">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#1f3d30] flex items-center justify-center text-[#5cc79a] group-hover:translate-x-0.5 group-hover:bg-[#5cc79a] group-hover:text-[#0f1c18] transition-all shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Prototype Demo Fast-Access Bar */}
        <div className="mt-8 pt-6 border-t border-[#233a30] text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f3d30] text-[#5cc79a] text-xs font-semibold mb-3 border border-[#3b6754]">
            <span>Fast Role Demo Access</span>
          </div>
          <p className="text-xs text-[#94a3b8] mb-3">
            Quick-launch any role instantly without typing credentials:
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button
              onClick={() => onQuickDemo('student')}
              className="px-2.5 py-2 text-xs font-semibold text-[#5cc79a] bg-[#16271f] border border-[#233a30] rounded-xl hover:bg-[#1f3d30] hover:border-[#5cc79a] transition-colors cursor-pointer shadow-sm"
            >
              Student
            </button>
            <button
              onClick={() => onQuickDemo('teacher')}
              className="px-2.5 py-2 text-xs font-semibold text-[#5cc79a] bg-[#16271f] border border-[#233a30] rounded-xl hover:bg-[#1f3d30] hover:border-[#5cc79a] transition-colors cursor-pointer shadow-sm"
            >
              Teacher
            </button>
            <button
              onClick={() => onQuickDemo('parent')}
              className="px-2.5 py-2 text-xs font-semibold text-[#5cc79a] bg-[#16271f] border border-[#233a30] rounded-xl hover:bg-[#1f3d30] hover:border-[#5cc79a] transition-colors cursor-pointer shadow-sm"
            >
              Parent
            </button>
            <button
              onClick={() => onQuickDemo('principal')}
              className="px-2.5 py-2 text-xs font-semibold text-[#5cc79a] bg-[#16271f] border border-[#233a30] rounded-xl hover:bg-[#1f3d30] hover:border-[#5cc79a] transition-colors cursor-pointer shadow-sm"
            >
              Principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
