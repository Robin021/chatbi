'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, loginWithOAuth } from '@/utils/pocketbase';
import { Layout, Typography, Spin, Space, Card, Row, Col, Button } from 'antd';
import { LoginOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks/useToast';
import { useLanguage } from '@/contexts/LanguageContext';

const { Content } = Layout;
const { Text } = Typography;

const LoadingScreen = () => (
  <Layout>
    <Content>
      <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
        <Space>
          <Spin size="large" />
          <Text>Loading...</Text>
        </Space>
      </Row>
    </Content>
  </Layout>
);

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isAuthChecked, setIsAuthChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { t } = useLanguage();
  const { error } = useToast();
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated()) {
        router.push('/');
      }
      setIsAuthChecked(true);
    };

    checkAuth();
  }, [router]);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithOAuth('oidc');
      router.push('/');
    } catch (err) {
      error({ message: t('common.auth.errors.failed') });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthChecked || isAuthenticated()) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <Content>
        <Row justify="center" align="middle" style={{ minHeight: '100vh' }}>
          <Col xs={20} sm={8} md={6} lg={4}>
            <Card>
              <Button
                type="primary"
                icon={isLoading ? <Spin /> : <LoginOutlined />}
                loading={isLoading}
                onClick={handleLogin}
                size="large"
                block
              >
                {t('common.auth.ssoButton')}
              </Button>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default LoginPage;
