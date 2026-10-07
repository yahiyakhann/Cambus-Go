import { SecurityAuditLog, UserRole } from '../types';

export interface AuditAttemptParams {
  attemptedRoute: string;
  userRole: UserRole | 'guest';
  userId?: string;
  userEmail?: string;
  reason?: string;
  severity?: 'warning' | 'high' | 'critical';
}

/**
 * Audit Service for security compliance monitoring.
 * Standardizes, formats, and logs unauthorized navigation attempts across protected routes (specifically '/buses').
 */
class AuditService {
  private lastLoggedEntry: {
    route: string;
    role: string;
    email: string;
    timestamp: number;
  } | null = null;

  /**
   * Evaluates if a given role is permitted to access a specific route.
   */
  isRoleAuthorized(role: UserRole | 'guest', route: string): boolean {
    const normalizedRoute = this.normalizeRoute(route);
    if (normalizedRoute === '/buses') {
      // /buses is restricted to driver and admin only; students and unauthenticated guests are unauthorized
      return role === 'driver' || role === 'admin';
    }
    if (normalizedRoute === '/driver') {
      return role === 'driver' || role === 'admin';
    }
    if (normalizedRoute === '/admin') {
      return role === 'admin';
    }
    return true;
  }

  /**
   * Normalizes route path strings for consistent evaluation and audit logging.
   */
  normalizeRoute(route: string): string {
    if (!route) return '/';
    const trimmed = route.trim().toLowerCase();
    const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return withLeadingSlash.replace(/\/+$/, '') || '/';
  }

  /**
   * Checks whether an attempt should be logged to prevent redundant entries
   * while a user remains on the same unauthorized route or re-renders trigger.
   */
  shouldLogAttempt(params: AuditAttemptParams): boolean {
    const normalizedRoute = this.normalizeRoute(params.attemptedRoute);
    const role = params.userRole || 'guest';
    const email = (params.userEmail || params.userId || 'anonymous').trim().toLowerCase();

    if (this.lastLoggedEntry) {
      const isSameRoute = this.lastLoggedEntry.route === normalizedRoute;
      const isSameRole = this.lastLoggedEntry.role === role;
      const isSameUser = this.lastLoggedEntry.email === email;
      const timeDiff = Date.now() - this.lastLoggedEntry.timestamp;

      // If the user remains on the same route and same role, suppress duplicate logs within 30 seconds
      if (isSameRoute && isSameRole && isSameUser && timeDiff < 30000) {
        return false;
      }
    }

    return true;
  }

  /**
   * Clears the in-memory route debounce state (called when user navigates away).
   */
  clearRouteDebounce(): void {
    this.lastLoggedEntry = null;
  }

  /**
   * Generates a standardized, properly formatted SecurityAuditLog entry.
   */
  createUnauthorizedAttemptLog(params: AuditAttemptParams): SecurityAuditLog {
    const now = Date.now();
    const normalizedRoute = this.normalizeRoute(params.attemptedRoute);
    const roleName = params.userRole || 'guest';
    const cleanEmail = params.userEmail?.trim().toLowerCase() || 'anonymous';
    const cleanUserId = params.userId?.trim() || 'unauthenticated';

    const defaultReason =
      params.reason ||
      `Unauthorized role '${roleName}' attempted direct navigation to restricted route '${normalizedRoute}'. Access blocked by security compliance policy.`;

    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    const logId = `AUDIT-${now}-${randomSuffix}`;

    // Update in-memory tracker
    this.lastLoggedEntry = {
      route: normalizedRoute,
      role: roleName,
      email: cleanEmail !== 'anonymous' ? cleanEmail : cleanUserId,
      timestamp: now,
    };

    return {
      id: logId,
      timestamp: now,
      isoTime: new Date(now).toISOString(),
      attemptedRoute: normalizedRoute,
      userRole: roleName,
      userId: cleanUserId,
      userEmail: cleanEmail,
      action: 'UNAUTHORIZED_NAVIGATION_ATTEMPT',
      reason: defaultReason,
      severity: params.severity || (normalizedRoute === '/buses' ? 'high' : 'warning'),
    };
  }
}

export const auditService = new AuditService();
