'use client'

import React, { useEffect, useState } from 'react';
import { Layout, Menu, Input, Button, theme, Space, Popconfirm, Flex, Typography, Card  } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';

import { DataSetRecord } from '@/utils/pocketbase/collections/type';
import { dataSetController } from '@/utils/pocketbase/collections/dataSetController';
import {useDataPageContext} from '@/contexts/DataPageContext';
import { CreateDataSetModal } from '@/components/modals/CreateDataSetModal';
import { AccessManagementModal } from '@/components/modals/AccessManagementModal';
const {useToken} = theme;
const { Sider } = Layout;
const { Search } = Input;

interface DataSiderProps {
  width: number;
}

const DataSider: React.FC<DataSiderProps> = ({ width }) => {
  const [dataSets, setDataSets] = useState<DataSetRecord[]>([]);
  const [filteredSets, setFilteredSets] = useState<DataSetRecord[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const { setSelectedDataSet, currentCard, setCurrentCard } = useDataPageContext();
  const { token } = useToken();
  const [editingDataSet, setEditingDataSet] = useState<DataSetRecord | null>(null);

  const fetchDataSets = async () => {
    setLoading(true);
    try {
      const sets = await dataSetController.list();
      setDataSets(sets);
      setFilteredSets(sets);
    } catch (error) {
      console.error('Error fetching data sets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSets();
  }, []);

  const handleSearch = (value: string) => {
    const filtered = dataSets.filter(set => 
      set.name.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSets(filtered);
  };

  const handleDelete = async (id: string) => {
    try {
      await dataSetController.delete(id);
      fetchDataSets();
    } catch (error) {
      console.error('Error deleting data set:', error);
    }
  };

  const menuItems = filteredSets.map(set => ({
    key: set.id,
    label: (
      <Flex justify="space-between" style={{ width: '100%' }}>
      
       <Flex style={{width: '60%'}}>
        <Typography.Text ellipsis={true} style={{ width: '100%' }}>{set.name}</Typography.Text>
       </Flex>
       <Flex>
        <Popconfirm
          title="Delete data set"
          description="Are you sure you want to delete this data set?"
          onConfirm={() => handleDelete(set.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button     
            type="text"         
            icon={<DeleteOutlined />}
            size="small"
          />
          
        </Popconfirm>
        <Button
            type="text"
            icon={<UserOutlined />}
            size="small"
            onClick={() => {
              setEditingDataSet(set);
              setAccessModalOpen(true);
            }}
          />
        </Flex>
      </Flex>
    ),
    onClick: () => {
      setSelectedDataSet(set);
      setCurrentCard('DataSet');
    }
  }));

  return (
    <Sider width={width} theme="light" style={{ padding: token.padding, height: '100vh', position: 'sticky', overflow: 'auto'}}>
        <Space style={{ width: '100%' }} size={'small'}>
        <Search
          placeholder="Search"
          onSearch={handleSearch}
        />
        <Button
          type="primary"
          onClick={() => setIsModalOpen(true)}
          style={{ width: '100%' }}
          block
        >New</Button>

        </Space>

      <Typography.Title level={5}>Datasets</Typography.Title>

        <Card size='small' style={{ marginTop: token.margin, maxHeight: '30vh' }} >
        
      <Menu
        mode="inline"
        items={menuItems}
        style={{ border: 'none' }}
      />
      </Card>
      <CreateDataSetModal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchDataSets();
        }}
      />

      {editingDataSet && (
        <AccessManagementModal
          open={accessModalOpen}
          dataset={editingDataSet}
          onCancel={() => setAccessModalOpen(false)}
          onSuccess={() => {
            setAccessModalOpen(false);
            fetchDataSets();
          }}
        />
      )}
    </Sider>
  );
};

export default DataSider;
