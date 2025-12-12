import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';

/**
 * Admin auth context type
 */
export interface AdminContext {
  isAdmin: boolean;
  token?: string;
}

/**
 * Check if user is authenticated as admin
 * Used in server components and server actions
 */
export async function getAdminContext(): Promise<AdminContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const secret = process.env.ADMIN_JWT_SECRET;

  if (!secret || !token || token !== secret) {
    return {isAdmin: false};
  }

  return {isAdmin: true, token};
}

/**
 * Protected route wrapper - redirects to login if not admin
 */
export async function requireAdmin() {
  const {isAdmin} = await getAdminContext();
  if (!isAdmin) {
    redirect('/admin/login');
  }
}

/**
 * API auth middleware - validates admin token from Authorization header
 */
export function validateAdminToken(authHeader?: string): boolean {
  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.slice(7);
  const secret = process.env.ADMIN_JWT_SECRET;

  return Boolean(secret && token === secret);
}

