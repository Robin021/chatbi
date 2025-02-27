import { NextRequest, NextResponse } from 'next/server';
import { createConnection, getCompleteSchema, testConnection, closeConnection } from '@/utils/db';
import type { DbConfig } from '@/utils/db/type';
import type { ErrorResponse, FetchSchemaResponse } from '../type';
import { Sequelize } from 'sequelize';
import { getAuth } from '@/utils/auth-middleware';

export async function POST(request: NextRequest) {

    const auth = await getAuth(request);

    let sequelize: Sequelize | null = null;

    try {
        const config: DbConfig = await request.json();
        // Test connection first
        const isConnected = await testConnection(config);
        if (!isConnected) {
            return NextResponse.json<ErrorResponse>(
                {
                    error: 'CONNECTION_FAILED',
                    message: 'Could not establish database connection'
                },
                { status: 503 }
            );
        }

        // Fetch schema
        sequelize = createConnection(config);
        const schema = await getCompleteSchema(sequelize);
        await closeConnection(sequelize);
        return NextResponse.json<FetchSchemaResponse>({
            success: true,
            data: schema,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Schema fetch error:', error);

        if (error instanceof Error) {
            // Authentication error
            if (error.message.includes('authentication')) {
                return NextResponse.json<ErrorResponse>(
                    {
                        error: 'AUTH_FAILED',
                        message: 'Database authentication failed',
                        details: error.message
                    },
                    { status: 401 }
                );
            }

            // Connection error
            if (error.message.includes('connect')) {
                return NextResponse.json<ErrorResponse>(
                    {
                        error: 'CONNECTION_ERROR',
                        message: 'Database connection error',
                        details: error.message
                    },
                    { status: 502 }
                );
            }
        }

        // Generic error
        return NextResponse.json<ErrorResponse>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An unexpected error occurred',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );

    } finally {
        if (sequelize) {
            await closeConnection(sequelize);
        }
    }
}