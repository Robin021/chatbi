import { Modal, Card, Space, Typography, Row, Col, theme, Button } from 'antd';
import { useState } from 'react';
import { dataSourceTypes } from '@/utils/dataSource';
import { DataSource } from '@/utils/dataSource/type';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { dataSourceComponentList } from '@/utils/dataSource/dataSourceComponentList';
const { Text, Title } = Typography;

interface CreateDataSourceModalProps {
  dataSetId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateDataSourceModal = ({ dataSetId, onCancel, onSuccess }: CreateDataSourceModalProps) => {
  const [selectedType, setSelectedType] = useState<DataSource['type'] | null>(null);
  const { token } = theme.useToken();

  const getTypeDescription = (type: string) => {
    switch(type) {
      case 'database':
        return 'Connect to SQL databases like PostgreSQL, MySQL, etc.';
      case 'csv':
        return 'Upload and import data from CSV files';
      default:
        return '';
    }
  };

  const getTypeName = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const renderTypeSelection = () => (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {dataSourceTypes.map(({ type, icon: Icon, tagColor }) => (
          <Col xs={24} sm={12} key={type}>
            <Card
              hoverable
              onClick={() => setSelectedType(type)}
              style={{
                borderColor: token.colorBorder,
                cursor: 'pointer',
                height: '100%'
              }}
            >
              <Space align="start" size="middle">
                <Icon style={{ fontSize: 24 }} />
                <Space direction="vertical" size={0}>
                  <Text strong>{getTypeName(type)}</Text>
                  <Text type="secondary">{getTypeDescription(type)}</Text>
                </Space>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );

  return (
    <Modal
      title="Create source"
      open={true}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {!selectedType ? renderTypeSelection() : (
        <>
          <Space style={{ marginBottom: token.margin }}>
            <Button 
              type="text" 
              onClick={() => setSelectedType(null)}
              style={{ cursor: 'pointer' }}
              icon={<ArrowLeftOutlined />}
            >
            </Button>
          </Space>
          {selectedType && dataSourceComponentList[selectedType].create(dataSetId, onCancel, onSuccess)}
        </>
      )}
    </Modal>
  );
};

export default CreateDataSourceModal;