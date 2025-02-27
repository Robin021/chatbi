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
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const csvRecord = await csvController.getById(params.id);
    const csvFileUrl = await csvController.getFileURL(csvRecord);
    const csvData = await CSVProcessor.parseWithLimitURL(csvFileUrl, limit);
    return Response.json(csvData);

  } catch (error) {
    console.error('Failed to fetch CSV data:', error);
    return Response.json({ error: 'Failed to fetch CSV data' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuth(request);

  try {
    const { rowIndex, updatedData } = await request.json();
    const csvRecord = await csvController.getById(params.id);
    const csvFile = await csvController.getFile(csvRecord);
    const csvText = await csvFile.text();
    const updatedFile = await CSVProcessor.updateRow(csvText, rowIndex, updatedData);
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
      message: 'CSV updated successfully' 
    });

  } catch (error) {
    console.error('Failed to update CSV data:', error);
    return Response.json({ 
      error: 'Failed to update CSV data' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await getAuth(request);

  try {
    const { rowIndex } = await request.json();
    const csvRecord = await csvController.getById(params.id);
    const csvFile = await csvController.getFile(csvRecord);
    const csvText = await csvFile.text();

    const updatedFile = await CSVProcessor.deleteRow(csvText, rowIndex);
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
      message: 'Row deleted successfully' 
    });

  } catch (error) {
    console.error('Failed to delete CSV row:', error);
    return Response.json({ 
      error: 'Failed to delete CSV row' 
    }, { status: 500 });
  }
} 