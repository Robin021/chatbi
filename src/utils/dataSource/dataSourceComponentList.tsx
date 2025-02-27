import CreateDatabase from '@/components/modals/dataSourceModals/create/CreateDatabase';
import CreateCSV from '@/components/modals/dataSourceModals/create/CreateCSV';
import {DataSource, FetchedData} from './type';
import { CSVData } from '../csv/type';
import { Table } from 'antd';

interface DataSourceComponentList extends Record<DataSource['type'], {
    create: (dataSetId: string, onCancel: () => void, onSuccess: () => void) => React.ReactNode;
}> {}

export const dataSourceComponentList: DataSourceComponentList = {
    database: {
        create: (dataSetId, onCancel, onSuccess) => <CreateDatabase dataSetId={dataSetId} onCancel={onCancel} onSuccess={onSuccess} />
    },
    csv: {
        create: (dataSetId, onCancel, onSuccess) => <CreateCSV dataSetId={dataSetId} onCancel={onCancel} onSuccess={onSuccess} />  
    }
}

