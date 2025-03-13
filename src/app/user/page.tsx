'use client';

import React from "react";
import { Layout, Typography, Row, Col, Flex } from 'antd';
import LLMConfig from '@/components/llmConfig/LLMConfig';
import { useAuth } from '@/contexts/AuthContext';
import { debugLog } from '@/utils/debug';
import { useLanguage } from '@/contexts/LanguageContext';

const { Content } = Layout;
const { Title, Text } = Typography;

const UserPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <Layout>
      <Content>
        <Flex align="center" vertical style={{width: '100%'}}>
          <Flex justify='flex-start' style={{width: '80%'}}>
            <Title level={2}>User Profile</Title>
          </Flex>
          <LLMConfig disabled={!user?.isAdmin} />
          {!user?.isAdmin && (
            <Flex justify='flex-start' style={{width: '80%', marginTop: 16}}>
              <Text type="secondary">{t('user.llm.noAccess')}</Text>
            </Flex>
          )}
        </Flex>
      </Content>
    </Layout>
  );
};

export default UserPage;