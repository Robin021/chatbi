import Papa from 'papaparse';
import { CSVData } from './type';

const parseWithLimitURL = async (csvFileUrl: string, limit: number): Promise<CSVData> => {
  try {
    const response = await fetch(csvFileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(response.body!);
    
    return new Promise((resolve, reject) => {
      let headers: string[] = [];
      const targetRows: any[] = [];
      let rowCounter = 0;

      Papa.parse(nodeStream, {
        header: true,
        skipEmptyLines: true,
        stream: true,
      
        step: (results, parser) => {
          if (rowCounter === 0) {
            headers = Object.keys(results.data);
          }
          if (rowCounter < limit) {
            targetRows.push(results.data);
            rowCounter++;
          } else {
            parser.abort();
          }
        },
        complete: () => {
          resolve({
            columns: headers,
            rows: targetRows,
          });
        },
        error: (error) => {
          console.log(error)
          reject(new Error(`Failed to parse CSV data: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const parseWithLimit = (csvText: string, limit: number): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    let headers: string[] = [];
    const targetRows: any[] = [];
    let rowCounter = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        if (rowCounter === 0) {
          headers = Object.keys(results.data);
        }
        if (rowCounter < limit) {
          targetRows.push(results.data);
          rowCounter++;
        } else {
          parser.abort();
        }
      },
      complete: () => {
        resolve({
          columns: headers,
          rows: targetRows,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const parseWithLimitedColumns = (
  csvText: string,
  limit: number,
  columns: string[]
): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    let headers: string[] = [];
    const targetRows: Record<string, any>[] = [];
    let rowCounter = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (results, parser) => {
        if (rowCounter === 0) {
          headers = Object.keys(results.data);
        }
        if (rowCounter < limit) {
          const filteredRow = columns.reduce((acc, column) => {
            acc[column] = results.data[column];
            return acc;
          }, {} as Record<string, any>);
          
          targetRows.push(filteredRow);
          rowCounter++;
        } else {
          parser.abort();
        }
      },
      complete: () => {
        resolve({
          columns,
          rows: targetRows,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const updateRow = (
  csvText: string,
  rowIndex: number,
  updatedData: Record<string, any>
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const updatedContent: string[] = [];
    let headers: string[] = [];
    let currentRow = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        if (currentRow === 0) {
          headers = Object.keys(results.data);
          updatedContent.push(headers.join(','));
        }

        const rowData = currentRow === rowIndex ? updatedData : results.data;
        const csvRow = headers.map(header => {
          const value = rowData[header];
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',');

        updatedContent.push(csvRow);
        currentRow++;
      },
      complete: () => {
        resolve(updatedContent.join('\n'));
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const deleteRow = (
  csvText: string,
  rowIndex: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const updatedContent: string[] = [];
    let headers: string[] = [];
    let currentRow = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        if (currentRow === 0) {
          headers = Object.keys(results.data);
          updatedContent.push(headers.join(','));
        }

        if (currentRow !== rowIndex) {
          updatedContent.push(results.meta.fields!.map(f => results.data[f]).join(','));
        }
        currentRow++;
      },
      complete: () => {
        resolve(updatedContent.join('\n'));
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const updateColumn = (
  csvText: string,
  columnName: string,
  updatedColumnName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const updatedContent: string[] = [];
    let headers: string[] = [];
    let currentRow = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      step: (results) => {
        if (currentRow === 0) {
          headers = Object.keys(results.data).map(h => 
            h === columnName ? updatedColumnName : h
          );
          updatedContent.push(headers.join(','));
        }

        const csvRow = headers.map(header => {
          const value = results.data[header === updatedColumnName ? columnName : header];
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',');
        
        updatedContent.push(csvRow);
        currentRow++;
      },
      complete: () => {
        resolve(updatedContent.join('\n'));
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const getColumns = async (csvText: string): Promise<string[]> => {
  const data = await parseWithLimit(csvText, 1);
  return data.columns;
};

const parseWithLimitedColumnsFromFile = async (
  csvText: string,
  limit: number,
  columns: string[]
): Promise<CSVData> => {
  return new Promise((resolve, reject) => {
    let headers: string[] = [];
    const targetRows: Record<string, any>[] = [];
    let rowCounter = 0;

    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => {
        if (!headers.length) {
          headers = header;
        }
        return header;
      },
      step: (result, parser) => {
        if (rowCounter < limit) {
          const filteredRow = columns.reduce((acc, column) => {
            acc[column] = result.data[column];
            return acc;
          }, {} as Record<string, any>);
          
          targetRows.push(filteredRow);
          rowCounter++;
        } else {
          parser.abort();
        }
      },
      complete: () => {
        resolve({
          columns,
          rows: targetRows,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV data: ${error.message}`));
      }
    });
  });
};

const createCSVFile = async (csvText: string): Promise<File> => {
  const blob = new Blob([csvText], { type: 'text/csv' });
  return new File([blob], 'data.csv', { type: 'text/csv' });
};

const parseWithLimitedColumnsFromFileUrl = async (
  csvFileUrl: string,
  limit: number,
  columns: string[]
): Promise<CSVData> => {
  try {
    const response = await fetch(csvFileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(response.body!);
    
    return new Promise((resolve, reject) => {
      let headers: string[] = [];
      const targetRows: Record<string, any>[] = [];
      let rowCounter = 0;

      Papa.parse(nodeStream, {
        header: true,
        skipEmptyLines: true,
        stream: true,
        step: (results, parser) => {
          if (rowCounter === 0) {
            headers = Object.keys(results.data);
          }
          if (rowCounter < limit) {
            const filteredRow = columns.reduce((acc, column) => {
              acc[column] = results.data[column];
              return acc;
            }, {} as Record<string, any>);
            
            targetRows.push(filteredRow);
            rowCounter++;
          } else {
            parser.abort();
          }
        },
        complete: () => {
          resolve({
            columns,
            rows: targetRows,
          });
        },
        error: (error) => {
          reject(new Error(`Failed to parse CSV data: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const getTotalRowsURL = async (csvFileUrl: string): Promise<number> => {
  try {
    const response = await fetch(csvFileUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const { Readable } = require('stream');
    const nodeStream = Readable.fromWeb(response.body!);
    
    return new Promise((resolve, reject) => {
      let totalRows = 0;

      Papa.parse(nodeStream, {
        header: true,
        skipEmptyLines: true,
        stream: true,
        step: () => {
          totalRows++;
        },
        complete: () => {
          resolve(totalRows);
        },
        error: (error) => {
          reject(new Error(`Failed to count CSV rows: ${error.message}`));
        }
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const CSVProcessor = {
  parseWithLimit,
  parseWithLimitedColumns,
  parseWithLimitedColumnsFromFile,
  parseWithLimitedColumnsFromFileUrl,
  updateRow,
  deleteRow,
  updateColumn,
  getColumns,
  createCSVFile,
  parseWithLimitURL,
  getTotalRowsURL
} as const;