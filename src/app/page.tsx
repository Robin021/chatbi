'use client';

import React from 'react';
import { Card, Typography, Row, Col, Space, Image } from 'antd';

const { Title } = Typography;

const Home: React.FC = () => {
  return (
    <Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 64px)' }}>
      <Col xs={24} sm={22} md={20} lg={16}>
        <Card bordered={false}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Row justify="center">
              <Col>
                <Image
                  src="/Porsche_wordmark_black_rgb.svg"
                  alt="Porsche Logo"
                  width={200}
                  height="auto"
                  preview={false}
                />
              </Col>
            </Row>

            <Row justify="center">
              <Col xs={24} md={16}>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Title>Welcome to PDI</Title>
                </Space>
              </Col>
            </Row>
          </Space>
        </Card>
      </Col>
    </Row>
  );
};

export default Home;

