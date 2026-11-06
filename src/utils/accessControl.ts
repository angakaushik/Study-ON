import {
  ResourceRestrictionRule,
  StudentLiveActivityStatus,
  ResourceAccessRequest,
  RestrictionAuditLogItem,
  AccessControlPolicyConfig,
  ResourceKind,
} from '../types.ts';

export const DEFAULT_POLICY_CONFIG: AccessControlPolicyConfig = {
  allowParentOverrideTeacher: true,
  enableLessonRestrictedMode: true,
  allowlistOnlyMode: false,
  defaultPriorityOrder: ['principal', 'parent', 'teacher'],
  dataRetentionDays: 90,
};

export const INITIAL_RESTRICTION_RULES: ResourceRestrictionRule[] = [
  {
    id: 'rule-pri-01',
    scope: 'institution',
    targetLabel: 'Entire Institution',
    resourceType: 'category',
    category: 'Entertainment & Gaming',
    resourceTitle: 'Non-Educational Gaming & Social Media',
    action: 'block',
    reason: 'Institutional Policy: Non-academic entertainment and social media platforms are prohibited on StudyOn campus portals.',
    createdByRole: 'principal',
    createdByName: 'Dr. K. S. Menon (Principal)',
    createdAt: 'Oct 10, 2026, 09:00 AM',
    isActive: true,
  },
  {
    id: 'rule-tch-01',
    scope: 'class',
    targetId: 'cls-01',
    targetLabel: 'B.Tech CSE - 6B (DSA & Lab)',
    resourceType: 'website',
    resourceId: 'web-06',
    resourceTitle: 'W3Schools: Interactive SQL Tutorial and Editor',
    action: 'block',
    reason: 'Temporary Classroom Focus: Blocked during Data Structures & Algorithms Lab hours so students focus on binary tree implementation.',
    createdByRole: 'teacher',
    createdByName: 'Dr. Ananya Sharma',
    createdAt: 'Oct 19, 2026, 10:15 AM',
    startTime: '10:00',
    endTime: '12:30',
    isActive: false, // Inactive by default so teacher can toggle it live to test!
  },
  {
    id: 'rule-par-01',
    scope: 'student',
    targetId: 'STU-2026-4401',
    targetLabel: 'Aarav Verma (STU-2026-4401)',
    resourceType: 'video',
    resourceId: 'vid-06',
    resourceTitle: 'Operating Systems: Virtual Memory & Page Replacement Strategies',
    action: 'block',
    reason: 'Parental Screen-Time Rule: Reserved for weekend study block after completing DSA Problem Set 4.',
    createdByRole: 'parent',
    createdByName: 'Rohit Verma (Father)',
    createdAt: 'Oct 18, 2026, 08:30 PM',
    isActive: false, // Inactive by default so parent can toggle live!
  },
];

export const INITIAL_LIVE_STATUSES: Record<string, StudentLiveActivityStatus> = {
  'STU-2026-4401': {
    studentRegNumber: 'STU-2026-4401',
    studentName: 'Aarav Verma',
    isOnline: true,
    lastActiveTimestamp: 'Just now (Active)',
    currentResource: {
      type: 'note',
      title: 'Unit 3: Self-Balancing Trees (AVL & Red-Black Trees)',
      urlOrSubject: 'Data Structures & Algorithms',
      startedAt: '10 mins ago',
    },
  },
  'STU-2026-4402': {
    studentRegNumber: 'STU-2026-4402',
    studentName: 'Pooja Nair',
    isOnline: true,
    lastActiveTimestamp: '3 mins ago (Active)',
    currentResource: {
      type: 'video',
      title: 'MIT 6.006: Balanced Search Trees & AVL Rotations',
      urlOrSubject: 'Data Structures & Algorithms',
      startedAt: '15 mins ago',
    },
  },
  'STU-2026-4403': {
    studentRegNumber: 'STU-2026-4403',
    studentName: 'Rohan Mehra',
    isOnline: false,
    lastActiveTimestamp: '2 hours ago (Offline)',
  },
};

export const INITIAL_AUDIT_LOGS: RestrictionAuditLogItem[] = [
  {
    id: 'aud-01',
    action: 'created',
    ruleSummary: 'Blocked category: Non-Educational Gaming & Social Media',
    performedBy: 'Dr. K. S. Menon',
    performedByRole: 'Principal',
    timestamp: 'Oct 10, 2026, 09:00 AM',
    details: 'Applied campus-wide study compliance policy.',
  },
  {
    id: 'aud-02',
    action: 'modified',
    ruleSummary: 'Lesson restriction toggle for Class CSE-6B',
    performedBy: 'Dr. Ananya Sharma',
    performedByRole: 'Teacher',
    timestamp: 'Oct 19, 2026, 10:15 AM',
    details: 'Configured temporary external reference restriction during lab test.',
  },
];

export const INITIAL_ACCESS_REQUESTS: ResourceAccessRequest[] = [
  {
    id: 'req-01',
    studentName: 'Aarav Verma',
    studentRegNumber: 'STU-2026-4401',
    resourceId: 'web-06',
    resourceTitle: 'W3Schools: Interactive SQL Tutorial and Editor',
    resourceType: 'Website',
    reason: 'Need to review SQL syntax for Database Systems lab assignment due tomorrow.',
    requestedAt: 'Today, 11:20 AM',
    status: 'Pending',
  },
];

export interface AccessEvaluationResult {
  isAllowed: boolean;
  violatingRule?: ResourceRestrictionRule;
  reason?: string;
  decidedByRole?: 'principal' | 'parent' | 'teacher' | 'institution_allowlist' | 'default';
  priorityLevel?: number; // 1 = Principal, 2 = Parent, 3 = Teacher
}

/**
 * Evaluates whether a student can access a specific resource based on hierarchical priority:
 * 1. Institution-wide mandatory policies set by the principal.
 * 2. Parent restrictions for their registered child, where permitted by institutional policy.
 * 3. Teacher restrictions for assigned classes, within their granted permissions.
 * 4. Student access when no applicable restriction exists.
 */
export function evaluateResourceAccess(params: {
  studentRegNumber: string;
  classId?: string;
  resourceId?: string;
  resourceTitle: string;
  resourceType: ResourceKind;
  resourceCategory?: string;
  restrictions: ResourceRestrictionRule[];
  policyConfig?: AccessControlPolicyConfig;
}): AccessEvaluationResult {
  const {
    studentRegNumber,
    classId,
    resourceId,
    resourceTitle,
    resourceType,
    resourceCategory,
    restrictions,
    policyConfig = DEFAULT_POLICY_CONFIG,
  } = params;

  // Filter only active restrictions
  const activeRules = restrictions.filter((r) => r.isActive);

  // Helper to test if a rule matches this resource
  const ruleMatchesResource = (rule: ResourceRestrictionRule): boolean => {
    // 1. Direct ID match
    if (resourceId && rule.resourceId && rule.resourceId === resourceId) {
      return true;
    }
    // 2. Direct title match
    if (
      rule.resourceTitle &&
      resourceTitle &&
      rule.resourceTitle.toLowerCase().trim() === resourceTitle.toLowerCase().trim()
    ) {
      return true;
    }
    // 3. Category match
    if (
      rule.resourceType === 'category' &&
      rule.category &&
      resourceCategory &&
      rule.category.toLowerCase().trim() === resourceCategory.toLowerCase().trim()
    ) {
      return true;
    }
    // 4. All external match
    if (rule.resourceType === 'all_external' && resourceType === 'website') {
      return true;
    }
    return false;
  };

  // Helper to check time constraint if defined (e.g., "09:00" - "17:00")
  const isWithinTimeConstraint = (rule: ResourceRestrictionRule): boolean => {
    if (!rule.startTime || !rule.endTime) return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = rule.startTime.split(':').map(Number);
    const [endH, endM] = rule.endTime.split(':').map(Number);

    const startMinutes = (startH || 0) * 60 + (startM || 0);
    const endMinutes = (endH || 0) * 60 + (endM || 0);

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    }
    // Crossing midnight
    return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
  };

  // 1. PRIORITY 1: Principal Mandatory Policies (Institution-wide)
  const principalRules = activeRules.filter(
    (r) => r.scope === 'institution' && r.createdByRole === 'principal'
  );
  for (const rule of principalRules) {
    if (ruleMatchesResource(rule) && isWithinTimeConstraint(rule)) {
      if (rule.action === 'block') {
        return {
          isAllowed: false,
          violatingRule: rule,
          reason: rule.reason || 'Restricted by institutional campus policy set by Principal.',
          decidedByRole: 'principal',
          priorityLevel: 1,
        };
      }
    }
  }

  // 2. PRIORITY 2: Parent Restrictions (for registered child)
  const parentRules = activeRules.filter(
    (r) =>
      r.scope === 'student' &&
      r.targetId?.toLowerCase() === studentRegNumber.toLowerCase() &&
      r.createdByRole === 'parent'
  );
  for (const rule of parentRules) {
    if (ruleMatchesResource(rule) && isWithinTimeConstraint(rule)) {
      if (rule.action === 'block') {
        return {
          isAllowed: false,
          violatingRule: rule,
          reason: rule.reason || 'Restricted by parent settings for this student account.',
          decidedByRole: 'parent',
          priorityLevel: 2,
        };
      }
    }
  }

  // 3. PRIORITY 3: Teacher Restrictions (for assigned classes or students)
  const teacherRules = activeRules.filter(
    (r) =>
      r.createdByRole === 'teacher' &&
      ((r.scope === 'class' && (!classId || r.targetId === classId)) ||
        (r.scope === 'student' && r.targetId?.toLowerCase() === studentRegNumber.toLowerCase()))
  );
  for (const rule of teacherRules) {
    if (ruleMatchesResource(rule) && isWithinTimeConstraint(rule)) {
      if (rule.action === 'block') {
        return {
          isAllowed: false,
          violatingRule: rule,
          reason: rule.reason || 'Restricted by course faculty for assigned class during lesson hours.',
          decidedByRole: 'teacher',
          priorityLevel: 3,
        };
      }
    }
  }

  // 4. Strict Allowlist-only mode check
  if (policyConfig.allowlistOnlyMode && resourceType === 'website') {
    const isExplicitlyAllowlisted = activeRules.some(
      (r) => r.action === 'allow' && ruleMatchesResource(r)
    );
    if (!isExplicitlyAllowlisted) {
      return {
        isAllowed: false,
        reason: 'Restricted Mode Active: Only explicitly pre-approved institutional websites are accessible.',
        decidedByRole: 'institution_allowlist',
        priorityLevel: 1,
      };
    }
  }

  // 5. PRIORITY 4: Default Student Access
  return {
    isAllowed: true,
    decidedByRole: 'default',
  };
}
