'use client';

import Link from 'next/link';
import { Layout, Typography, Button, Menu, Avatar, Flex, Space, Image, Card } from 'antd';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { logout } from '@/utils/pocketbase';
import LanguageSwitcher from './LanguageSwitcher';
import { useLanguage } from '@/contexts/LanguageContext';
import { HomeOutlined, DatabaseOutlined, LineChartOutlined, UserOutlined } from '@ant-design/icons';
import { theme } from 'antd';

const { Sider } = Layout;
const { useToken } = theme;

interface PageHeaderProps {
  collapsible?: boolean;
  width?: number;
}

const PageSider: React.FC<PageHeaderProps> = ({ collapsible = false, width = 250 }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { token } = useToken();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: t('common.menu.home') },
    { key: '/data', icon: <DatabaseOutlined />, label: t('common.menu.database') },
    { key: '/chart-analysis', icon: <LineChartOutlined />, label: t('common.menu.chartAnalysis') },
    { key: '/user', icon: <UserOutlined />, label: t('common.menu.user') },
  ];

  return (
    <Sider
      theme="light"
      collapsible={collapsible}
      width={width}
      style={{ height: '100vh', position: 'sticky', padding: token.padding, overflow: 'auto', borderRight: `1px solid ${token.colorBorder}` }}
    >
      <Flex vertical justify="space-between" align="center" style={{ height: '100%' }}>

        <Flex vertical>
        <Link href="/">
          <Image
            src="/Porsche_wordmark_black_rgb.svg"
            alt="Porsche Logo"
            style={{ width: '100%' }}
            preview={false}
          />
        </Link>

        <Menu
          mode='inline'
          theme='light'

          selectedKeys={[pathname ?? '/']}
          items={menuItems.map((item) => ({
            key: item.key,
            icon: item.icon,
            label: <Link href={item.key}>{item.label}</Link>,
          }))}
          style={{ marginTop: 16, border: 'none' }}
        />
        </Flex>

        <Flex vertical>
        <LanguageSwitcher />

        {user ? (
          <>
            <Space align="center" direction="horizontal" style={{ marginTop: 16 }}>
              <Avatar icon={<UserOutlined />} />
              <Typography.Text>{user.username || user.email}</Typography.Text>
            </Space>
            <Button type="primary" danger onClick={handleLogout} style={{ marginTop: 8 }}>
              {t('common.auth.logout')}
            </Button>
          </>
        ) : (

          <Link href="/login">
            <Button type="primary" block>{t('common.auth.login')}</Button>
          </Link>

        )}
        </Flex>
      </Flex>
    </Sider>
  );
};

export default PageSider;
