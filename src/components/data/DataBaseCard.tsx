import { Card, Tooltip, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useContext } from 'react';
import  {useDataPageContext, moveCardTypeBack }  from '@/contexts/DataPageContext';

export const DataBaseCard = ({children}: {children: React.ReactNode}) => {
    const dataPageContext = useDataPageContext();

    return (
        <Card 
            style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                flex: 1,
            }} 
            styles={{
                body: {
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }}
            title={dataPageContext.currentCard !== 'DataSet' && (
                <Tooltip title="Go back">
                    <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => dataPageContext.setCurrentCard(moveCardTypeBack(dataPageContext.currentCard))} />
                </Tooltip>
            )}
        > 
            {children}
        </Card>
    )
}