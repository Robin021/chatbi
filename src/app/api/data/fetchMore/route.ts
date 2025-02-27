import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/utils/auth-middleware';
import type { DataFetchingConfig, DataSource, FetchedData } from '@/utils/dataSource/type';
import { dataControllers } from '@/utils/dataSource/dataControllers';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const {oldData, newConfig}: {oldData: FetchedData, newConfig: DataFetchingConfig} = await request.json();
    
    const data = await dataControllers[oldData.dataSource.type].fetchMore(oldData, newConfig);

    return NextResponse.json(data);
  
}