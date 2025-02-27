'use client';

import React from "react";
import { Layout, Typography, Row, Col, Flex } from 'antd';
import LLMConfig from '@/components/llmConfig/LLMConfig';

const { Content } = Layout;
const { Title } = Typography;

const UserPage: React.FC = () => {
  return (
    <Layout>
      <Content>
           <Flex align="center" vertical style={{width: '100%'}}>
            <Flex justify='flex-start' style={{width: '80%'}}>
            <Title level={2}>User Profile</Title>
            </Flex>
            <LLMConfig />
            </Flex>
      </Content>
    </Layout>
  );
};

export default UserPage;