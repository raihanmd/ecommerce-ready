import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function useAdminAuth() {
  const router = useRouter();
  const { admin, token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token || !admin) {
      router.replace('/admin/login');
    }
  }, [isAuthenticated, token, admin, router]);

  return {
    admin,
    token,
    isAuthenticated,
    isLoading: false,
  };
}

export function useAdminCheck() {
  const { admin, isAuthenticated } = useAuthStore();

  return {
    isAdmin: isAuthenticated && admin?.role === 'Admin',
    isSuperAdmin: isAuthenticated && admin?.role === 'Super Admin',
    canManageOrders: isAuthenticated && (admin?.role === 'Admin' || admin?.role === 'Super Admin'),
    canManageProducts: isAuthenticated && admin?.role === 'Super Admin',
    canManageCategories: isAuthenticated && admin?.role === 'Super Admin',
  };
}
