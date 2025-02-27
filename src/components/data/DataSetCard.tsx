import React, { useEffect, useState } from 'react';
import { Space, Input, Empty, Select, Button, Flex, theme } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import { dataSourceTypes, DataSource } from '@/utils/dataSource';
import { useDataPageContext } from '@/contexts/DataPageContext';
import { DataSourceCard } from './DataSourceCard';
import CreateDataSourceModal from '@/components/modals/dataSourceModals/CreateDataSourceModal';

export const DataSetCard: React.FC = () => {
  const { selectedDataSet, currentCard, setCurrentCard, setSelectedDataSource } = useDataPageContext();
  const [allSources, setAllSources] = useState<DataSource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const { token } = theme.useToken();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const results = await Promise.all(
          dataSourceTypes.map(config => config.list(selectedDataSet?.id ?? ''))
        );
        setAllSources(results.flat());
      } catch (error) {
        console.error('Failed to fetch sources:', error);
      }
    };

    if (selectedDataSet?.id) {
      fetchSources();
    }
  }, [selectedDataSet?.id]);

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleDataSourceClick = (source: DataSource) => {

    if (source.type === 'database') {
      setCurrentCard('Database');
    } else {
      setCurrentCard('CSV');
    }

    setSelectedDataSource(source);

  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    // Refresh the data sources list when modal closes
    if (selectedDataSet?.id) {
      const fetchSources = async () => {
        try {
          const results = await Promise.all(
            dataSourceTypes.map(config => config.list(selectedDataSet.id ?? ''))
          );
          setAllSources(results.flat());
        } catch (error) {
          console.error('Failed to fetch sources:', error);
        }
      };
      fetchSources();
    }
  };

  const handleDelete = () => {
    // Refresh the data sources list after deletion
    if (selectedDataSet?.id) {
      const fetchSources = async () => {
        try {
          const results = await Promise.all(
            dataSourceTypes.map(config => config.list(selectedDataSet.id ?? ''))
          );
          setAllSources(results.flat());
        } catch (error) {
          console.error('Failed to fetch sources:', error);
        }
      };
      fetchSources();
    }
  };

  const filteredSources = allSources.filter(source => {
    const config = dataSourceTypes.find(c => c.type === source.type)!;
    const { title } = config.getDisplayInfo(source);
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || source.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Flex gap="middle" align="center" style={{ marginBottom: token.margin }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search sources..."
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: 1 }}
          size='large'
        />
        <Select
          defaultValue="all"
          onChange={setTypeFilter}
          options={[
            { value: 'all', label: 'All Types' },
            ...dataSourceTypes.map(config => ({
              value: config.type,
              label: config.type.charAt(0).toUpperCase() + config.type.slice(1)
            }))
          ]}
          size='large'
        />
        <Button
          type='primary'
          icon={<PlusOutlined />}
          size='large'
          onClick={handleAdd}
        />

      </Flex>

      {filteredSources.length === 0 ? (
        <Empty description="No data sources found" />
      ) : (
        <Flex
          wrap="wrap"
          gap="middle"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 20rem), 1fr))',
            gridAutoRows: '1fr',
            alignItems: 'stretch'
          }}
        >
          {filteredSources.map((source) => (
            <DataSourceCard
              key={source.id}
              source={source}
              onClick={handleDataSourceClick}
              onDelete={handleDelete}
            />
          ))}
          <Button
            type="dashed"
            style={{
              height: '100%'
            }}
            onClick={handleAdd}
          >
            <PlusOutlined style={{ fontSize: 24 }} />

          </Button>
        </Flex>
      )}

      {isCreateModalOpen && selectedDataSet?.id && (
        <CreateDataSourceModal
          dataSetId={selectedDataSet.id}
          onCancel={handleModalClose}
          onSuccess={handleModalClose}
        />
      )}
    </Space>
  );
};
