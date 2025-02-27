import { NextRequest } from 'next/server';
import { csvController } from '@/utils/pocketbase/collections/csvController';
import { getAuth } from '@/utils/auth-middleware';
import { CSVProcessor } from '@/utils/csv';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuth(request);

  try {
    const { oldName, newName } = await request.json();
    const csvRecord = await csvController.getById(params.id);
    const csvFile = await csvController.getFile(csvRecord);
    const csvText = await csvFile.text();

    const updatedFile = await CSVProcessor.updateColumn(csvText, oldName, newName);
    const updatedCSVFile = await CSVProcessor.createCSVFile(updatedFile);
    await csvController.update(params.id, {
      name: csvRecord.name,
      description: csvRecord.description,
      dataset: csvRecord.dataset,
      totalAvailableRows: csvRecord.totalAvailableRows,
      contextDesc: csvRecord.contextDesc
    }, updatedCSVFile);
    
    return Response.json({ 
      success: true, 
      message: 'Column renamed successfully' 
    });

  } catch (error) {
    console.error('Failed to rename column:', error);
    return Response.json({ 
      error: 'Failed to rename column' 
    }, { status: 500 });
  }
} 