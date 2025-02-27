import React, { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card, Typography, List, Input, Select, Switch, Space, Button, Tooltip, Modal, Form } from 'antd';
import { TableNodeData } from '@/utils/db/type';
import { EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { ColumnRecord } from '@/utils/pocketbase/collections/type';

const { Text } = Typography;
const { Option } = Select;

interface EditableColumnProps {
  column: ColumnRecord;
  onSave: (columnId: string, updates: Partial<ColumnRecord>) => void;
  onCancel: () => void;
}

const EditableColumn: React.FC<EditableColumnProps> = ({ column, onSave, onCancel }) => {
  const [editedColumn, setEditedColumn] = useState({ ...column });

  const handleSave = () => {
    onSave(column.id, {
      name: editedColumn.name,
      type: editedColumn.type,
      allowNull: editedColumn.allowNull,
      primaryKey: editedColumn.primaryKey,
      autoIncrement: editedColumn.autoIncrement || false,
      defaultValue: editedColumn.defaultValue,
      comment: editedColumn.comment,
      references: editedColumn.references,
      table: editedColumn.table
    });
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Input
        value={editedColumn.name}
        onChange={(e) => setEditedColumn({ ...editedColumn, name: e.target.value })}
        placeholder="Column name"
      />
      <Input
        value={editedColumn.type}
        onChange={(e) => setEditedColumn({ ...editedColumn, type: e.target.value })}
        placeholder="Column type"
      />
      <Space>
        <Switch
          checked={editedColumn.primaryKey}
          onChange={(checked) => setEditedColumn({ ...editedColumn, primaryKey: checked })}
          checkedChildren="PK"
          unCheckedChildren="PK"
        />
        <Switch
          checked={!editedColumn.allowNull}
          onChange={(checked) => setEditedColumn({ ...editedColumn, allowNull: !checked })}
          checkedChildren="Required"
          unCheckedChildren="Optional"
        />
      </Space>
      <Space>
        <Button 
          type="primary" 
          icon={<SaveOutlined />} 
          size="small"
          onClick={handleSave}
        >
          Save
        </Button>
        <Button 
          icon={<CloseOutlined />} 
          size="small"
          onClick={onCancel}
        >
          Cancel
        </Button>
      </Space>
    </Space>
  );
};

interface EditColumnModalProps {
  column: ColumnRecord;
  open: boolean;
  onSave: (columnId: string, updates: Partial<ColumnRecord>) => void;
  onCancel: () => void;
}

const EditColumnModal: React.FC<EditColumnModalProps> = ({ column, open, onSave, onCancel }) => {
  const [editedColumn, setEditedColumn] = useState({ ...column });

  const handleSave = () => {
    onSave(column.id, {
      name: editedColumn.name,
      type: editedColumn.type,
      allowNull: editedColumn.allowNull,
      primaryKey: editedColumn.primaryKey,
      autoIncrement: editedColumn.autoIncrement || false,
      defaultValue: editedColumn.defaultValue,
      comment: editedColumn.comment,
      references: editedColumn.references,
      table: editedColumn.table
    });
  };

  return (
    <Modal
      title="Edit Column"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>
      ]}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Form layout="vertical">
          <Form.Item label="Column Name">
            <Input
              value={editedColumn.name}
              onChange={(e) => setEditedColumn({ ...editedColumn, name: e.target.value })}
              placeholder="Column name"
            />
          </Form.Item>
          <Form.Item label="Data Type">
            <Input
              value={editedColumn.type}
              onChange={(e) => setEditedColumn({ ...editedColumn, type: e.target.value })}
              placeholder="Column type"
            />
          </Form.Item>
          <Form.Item label="Properties">
            <Space>
              <Switch
                checked={editedColumn.primaryKey}
                onChange={(checked) => setEditedColumn({ ...editedColumn, primaryKey: checked })}
                checkedChildren="PK"
                unCheckedChildren="PK"
              />
              <Switch
                checked={!editedColumn.allowNull}
                onChange={(checked) => setEditedColumn({ ...editedColumn, allowNull: !checked })}
                checkedChildren="Required"
                unCheckedChildren="Optional"
              />
              <Switch
                checked={editedColumn.autoIncrement}
                onChange={(checked) => setEditedColumn({ ...editedColumn, autoIncrement: checked })}
                checkedChildren="Auto Inc"
                unCheckedChildren="Auto Inc"
              />
            </Space>
          </Form.Item>
          <Form.Item label="Default Value">
            <Input
              value={editedColumn.defaultValue}
              onChange={(e) => setEditedColumn({ ...editedColumn, defaultValue: e.target.value })}
              placeholder="Default value"
            />
          </Form.Item>
          <Form.Item label="Comment">
            <Input.TextArea
              value={editedColumn.comment || ''}
              onChange={(e) => setEditedColumn({ ...editedColumn, comment: e.target.value })}
              placeholder="Column comment"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

interface SchemaTableNodeProps extends NodeProps<TableNodeData> {
  data: TableNodeData & {
    onColumnUpdate?: (columnId: string, updates: Partial<ColumnRecord>) => void;
  };
}

export const SchemaTableNode: React.FC<SchemaTableNodeProps> = ({ data }) => {
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null);
  const [localColumns, setLocalColumns] = useState<ColumnRecord[]>(data.columns as ColumnRecord[]);

  const handleColumnUpdate = (columnId: string, updates: Partial<ColumnRecord>) => {
    setLocalColumns(prev => 
      prev.map(col => col.id === columnId ? { ...col, ...updates } : col)
    );
    
    if (data.onColumnUpdate) {
      data.onColumnUpdate(columnId, updates);
    }
    
    setEditingColumnId(null);
  };

  const editingColumn = localColumns.find(col => col.id === editingColumnId);

  return (
    <Card 
      title={data.tableName} 
      size="small"
      style={{ minWidth: 250 }}
    >
      <Handle type="target" position={Position.Top} />
      <List
        size="small"
        dataSource={localColumns}
        renderItem={(column) => (
          <List.Item>
            <Space>
              <Text strong={column.primaryKey}>
                {column.name} ({column.type})
                {!column.allowNull && '*'}
              </Text>
              <Tooltip title="Edit column">
                <Button 
                  type="text" 
                  icon={<EditOutlined />} 
                  size="small"
                  onClick={() => setEditingColumnId(column.id)}
                />
              </Tooltip>
            </Space>
          </List.Item>
        )}
      />
      {editingColumn && (
        <EditColumnModal
          column={editingColumn}
          open={!!editingColumnId}
          onSave={handleColumnUpdate}
          onCancel={() => setEditingColumnId(null)}
        />
      )}
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}; 