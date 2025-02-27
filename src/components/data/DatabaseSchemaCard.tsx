import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, { 
  Background,
  Controls,
  Node,
  ConnectionMode,
  useNodesState,  
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Flex, Button, Spin } from 'antd';
import { useDataPageContext } from '@/contexts/DataPageContext';
import { TableNodeData } from '@/utils/db/type';
import { fetchSchemaNodes, saveNodeSchema } from '@/utils/db/schema';
import { SchemaTableNode } from './flow/SchemaTableNode';
import { SaveOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks/useToast';
import { columnController } from '@/utils/pocketbase/collections/columnController';
import { ColumnRecord } from '@/utils/pocketbase/collections/type';

const SchemaTableNodeTypes = {
  tableNode: SchemaTableNode
} as const;

const GRID_SPACING = 300;
const NODES_PER_ROW = 3;

export const DatabaseSchemaCard: React.FC = () => {
  const { selectedDataSource } = useDataPageContext();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [loading, setLoading] = useState(false);
  const [pendingColumnUpdates, setPendingColumnUpdates] = useState<Map<string, Omit<ColumnRecord, 'id'>>>(new Map());
  const { success, error } = useToast();

  const nodeTypes = React.useMemo(() => SchemaTableNodeTypes, []);

  const handleColumnUpdate = (columnId: string, updates: Partial<ColumnRecord>) => {
    // Convert partial updates to full column record (minus id)
    const fullUpdates: Omit<ColumnRecord, 'id'> = {
      name: updates.name || '',
      type: updates.type || '',
      allowNull: updates.allowNull || false,
      primaryKey: updates.primaryKey || false,
      autoIncrement: updates.autoIncrement || false,
      defaultValue: updates.defaultValue,
      comment: updates.comment || null,
      references: updates.references,
      table: updates.table || ''
    };
    setPendingColumnUpdates(prev => new Map(prev).set(columnId, fullUpdates));
  };

  const loadSchema = useCallback(async () => {
    if (!selectedDataSource) return;
    
    setLoading(true);
    try {
      const schema = await fetchSchemaNodes(selectedDataSource.id);
      
      // Create nodes with grid-based positioning
      const newNodes: Node[] = schema.map((table, index) => ({
        id: table.tableName,
        type: 'tableNode',
        position: {
          x: table.nodeX || (index % NODES_PER_ROW) * GRID_SPACING,
          y: table.nodeY || Math.floor(index / NODES_PER_ROW) * GRID_SPACING
        },
        data: {
          ...table,
          onColumnUpdate: handleColumnUpdate
        }
      }));

      setNodes(newNodes);
    } catch (err) {
      error({
        message: 'Failed to load schema',
        description: err instanceof Error ? err.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedDataSource, setNodes, error]);

  useEffect(() => {
    loadSchema();
  }, []);

  const handleSave = async () => {
    if (selectedDataSource) {
      setLoading(true);
      try {
        // First save any pending column updates
        if (pendingColumnUpdates.size > 0) {
          await Promise.all(
            Array.from(pendingColumnUpdates.entries()).map(([columnId, updates]) =>
              columnController.update(columnId, updates)
            )
          );
          setPendingColumnUpdates(new Map());
        }

        // Then save node positions
        const schemaWithPositions: TableNodeData[] = nodes.map(node => ({
          ...(node.data as TableNodeData),
          nodeX: node.position.x,
          nodeY: node.position.y
        }));
        
        await saveNodeSchema(schemaWithPositions, selectedDataSource.id)

        // Reload the schema to reflect all changes
        await loadSchema();
      } catch (err) {
        error({
          message: 'Failed to save schema', 
          description: err instanceof Error ? err.message : 'Unknown error occurred'
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Flex vertical style={{ width: '100%', height: '100%' }} flex={1}>
      {loading ? (
        <Flex justify="center" align="center" style={{ width: '100%', height: '100%'}}>
          <Spin spinning={loading} tip="Loading schema..." size="large"/>
        </Flex>
      ) : (
        <Flex vertical style={{ width: '100%', height: '100%'}} flex={1}>
        <ReactFlow       
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          snapToGrid={true}
          snapGrid={[20, 20]}
          nodesConnectable={false}
          nodesDraggable={true}
          elementsSelectable={true}
          panOnDrag={true}
        >
          <Background />
          <Controls />
        </ReactFlow>

<Flex justify="flex-end" style={{ padding: '8px' }}>
<Button 
  type="primary"
  onClick={handleSave}
  icon={<SaveOutlined />}
  loading={loading}
>
  Save {pendingColumnUpdates.size > 0 ? `(${pendingColumnUpdates.size} pending)` : ''}
</Button>
</Flex>
        </Flex>
      )}
      
    </Flex>
  );
};
