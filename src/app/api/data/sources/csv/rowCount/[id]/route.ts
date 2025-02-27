import { NextRequest } from 'next/server';
import { csvController } from '@/utils/pocketbase/collections/csvController';
import { getAuth } from '@/utils/auth-middleware';
import { CSVProcessor } from '@/utils/csv';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {

  const auth = await getAuth(request);

  try {

    const csvRecord = await csvController.getById(params.id);
    const csvFileUrl = await csvController.getFileURL(csvRecord);
    const count = await CSVProcessor.getTotalRowsURL(csvFileUrl);
    return Response.json(count);

  } catch (error) {
    console.error('Failed to fetch CSV data:', error);
    return Response.json({ error: 'Failed to fetch CSV data' }, { status: 500 });
  }
}