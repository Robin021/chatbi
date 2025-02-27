import { useState, useRef } from 'react';
import { Form, Input, Alert, Typography, Space, theme, Button, Flex } from 'antd';
import { UploadOutlined, CheckOutlined } from '@ant-design/icons';
import { csvController } from '@/utils/pocketbase/collections/csvController';
import { useToast } from '@/hooks/useToast';
import { getCSVData, getCSVRowCount } from '@/utils/csv/api';
import PasteText from '@/components/ui/PasteText';
import { CSVData } from '@/utils/csv/type';

const { Text } = Typography;

interface CreateCSVProps {
    dataSetId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

const CreateCSV = ({ dataSetId, onSuccess, onCancel }: CreateCSVProps) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileContent, setFileContent] = useState('');
    const { token } = theme.useToken();
    const toast = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const checkData = (data: any): data is CSVData => {
        if (!data || !Array.isArray(data.columns) || !Array.isArray(data.rows)) {
          return false;
        }
    
        // Check for duplicate columns
        const columnSet = new Set<string>();
        for (const column of data.columns) {
          if (typeof column !== 'string' || column.trim() === '') {
            return false; // Invalid column name
          }
          if (columnSet.has(column)) {
            console.error(`Duplicate column found: ${column}`);
            return false; // Duplicate column
          }
          columnSet.add(column);
        }
    
        // Check for consistent row structure
        const columnCount = data.columns.length;
        for (const row of data.rows) {
          if (Object.keys(row).length !== columnCount) {
            console.error('Row structure is inconsistent with columns');
            return false; // Inconsistent row structure
          }
        }
    
        return true; // All checks passed
      };
    

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        if (selectedFile.size > 100 * 1024 * 1024) {
            toast.error({
                message: 'File too large',
                description: 'Please upload a file smaller than 100MB'
            });
            return;
        }

        if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
            toast.error({
                message: 'Invalid file type',
                description: 'Please upload a CSV file'
            });
            return;
        }

        setFile(selectedFile);
        const text = await selectedFile.text();
        setFileContent(text);
    };

    const handleFinish = async (values: { name: string }) => {
        if (!file) return;

        try {
            setUploading(true);
            const finalFile = fileContent 
                ? new File([fileContent], file.name, { type: 'text/csv' })
                : file;

            const record = await csvController.create(finalFile, values.name, dataSetId);
            const totalRows = await getCSVRowCount(record.id);
            
            await csvController.update(record.id, {
                ...record,
                totalAvailableRows: totalRows
            });

            const csvData = await getCSVData(record.id, 50);

            const isValid = checkData(csvData)

            if (!isValid) {
                await csvController.delete(record.id)
                throw 'Invalid csv data detected! Try to clean up your file.'
            }

            toast.success({
                message: 'CSV created successfully',
                description: `Created with ${totalRows} rows`
            });

            form.resetFields();
            setFile(null);
            setFileContent('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            onSuccess();
        } catch (error) {
            console.error('Failed to create CSV:', error);
            toast.error({
                message: `Failed to create CSV - ${error}`,
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            disabled={uploading}
            style={{ width: '100%' }}
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please enter a name' }]}
                >
                    <Input
                        placeholder="Enter a name for this data source"
                        size="large"
                    />
                </Form.Item>

                {!file ? (
                    <Form.Item required>
                        <Button
                            icon={<UploadOutlined />}
                            onClick={() => fileInputRef.current?.click()}
                            size="large"
                            type="dashed"
                            style={{ width: '100%', height: 'auto', padding: token.padding }}
                        >
                            <Space direction="vertical" size="small">
                                <Text>Click to Upload CSV File</Text>
                                <Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                                    Support for single CSV file up to 100MB
                                </Text>
                            </Space>
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </Form.Item>
                ) : (
                    <>
                        <Alert
                            message={
                                <Space>
                                    <Text strong>Selected File: {file.name}</Text>
                                    <Button 
                                        type="link" 
                                        onClick={() => {
                                            setFile(null);
                                            setFileContent('');
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        style={{ padding: 0 }}
                                    >
                                        Change File
                                    </Button>
                                </Space>
                            }
                            type="info"
                            showIcon
                        />
                        
                        <PasteText
                            value={fileContent}
                            onChange={(content) => {
                                if (content) {
                                    const newFile = new File([content], file.name, { type: 'text/csv' });
                                    setFile(newFile);
                                    setFileContent(content);
                                }
                            }}
                        />
                    </>
                )}

                <Alert
                    message="File Requirements"
                    description={
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text>• Must be a CSV file</Text>
                            <Text>• Maximum size: 100MB</Text>
                            <Text>• First row should contain column headers</Text>
                        </Space>
                    }
                    type="info"
                    showIcon
                />

                <Flex justify="flex-end" gap="small" style={{ marginTop: token.marginLG }}>
                    <Button onClick={onCancel} size="large">
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => form.submit()}
                        loading={uploading}
                        disabled={!file}
                        size="large"
                        icon={<CheckOutlined />}
                    >
                        Create
                    </Button>
                </Flex>
            </Space>
        </Form>
    );
};

export default CreateCSV;