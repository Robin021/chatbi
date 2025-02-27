'use client'

import { DataBaseCard } from '@/components/data/DataBaseCard';
import DataSider from '@/components/data/DataSider';
import DataPageContext, { CardType, DataPageProvider } from '@/contexts/DataPageContext';
import { Layout } from 'antd';
import { useDataPageContext } from '@/contexts/DataPageContext';
import React from 'react';
import { DataSetCard } from '@/components/data/DataSetCard';
import { DatabaseSchemaCard } from '@/components/data/DatabaseSchemaCard';
import { DataCSVCard } from '@/components/data/DataCSVCard';
import { DataDatabaseCard } from '@/components/data/DataDatabaseCard';

const CardController = () => {

    const dataPageContext = useDataPageContext()

    const cards: {cardType: CardType, card: React.ReactNode}[] = [{
        cardType: 'DataSet',
        card: <DataSetCard/>
    },
    {
        cardType: 'Database',
        card: <DataDatabaseCard/>
    },
    {
        cardType: 'CSV',
        card: <DataCSVCard/>
    },
    {
        cardType: 'DatabaseSchema',
        card: <DatabaseSchemaCard/>
    }
]

    return (
        cards.filter(card => card.cardType === dataPageContext.currentCard)[0].card
    )

}

const Data = () => {



    return <Layout style={{ height: '100%' }}>
         <DataPageProvider>
        <DataSider width={250} />
        <Layout.Content style={{ padding: 24, overflow: 'auto', height: '100%' }}>
                <DataBaseCard>
                    <CardController/>
                </DataBaseCard>
        </Layout.Content>
        </DataPageProvider>
    </Layout>
}

export default Data;