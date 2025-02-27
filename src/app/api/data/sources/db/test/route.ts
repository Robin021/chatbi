import { NextRequest, NextResponse } from 'next/server';
import { testConnection } from '@/utils/db';
import { getAuth } from '@/utils/auth-middleware';
import type { DbConfig } from '@/utils/db/type';
import type { ErrorResponse, TestConnectionResponse } from '../type';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    const config: DbConfig = await request.json();
    const isConnected = await testConnection(config);
    return NextResponse.json<TestConnectionResponse>({
        success: isConnected,
        timestamp: new Date().toISOString()
    });
  
}