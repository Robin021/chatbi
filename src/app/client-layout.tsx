'use client';

import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import enUS from 'antd/locale/en_US';
import { useRouter, usePathname } from 'next/navigation';
import { isAuthenticated } from '@/utils/pocketbase';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated() && pathname !== '/login') {
      router.push('/login');
    }
  }, [pathname, router]);

  return (
    <ConfigProvider locale={enUS}>
      <AuthProvider>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </AuthProvider>
    </ConfigProvider>
  );
} 