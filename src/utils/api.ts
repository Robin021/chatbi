import { getPocketBaseClient } from '@/utils/pocketbase';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiRequest<T = any>(
  endpoint: string,
  method: RequestMethod = 'GET',
  body?: any
): Promise<T> {
  // Validate input parameters
  if (!endpoint) {
    throw new Error('Endpoint is required');
  }

  if (!method) {
    throw new Error('HTTP method is required');
  }

  // Get PocketBase client
  let pb;
  try {
    pb = getPocketBaseClient();
  } catch (error) {
    throw new Error('Failed to initialize PocketBase client: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
  
  if (!pb.authStore.isValid) {
    throw new Error('Unauthorized - Please login first');
  }

  // Make the API request
  let response;
  try {
    response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${pb.authStore.token}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    throw new Error('Network error: ' + (error instanceof Error ? error.message : 'Failed to make request'));
  }

  // Parse response
  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new Error('Invalid JSON response: ' + (error instanceof Error ? error.message : 'Failed to parse response'));
  }

  // Check response status
  if (!response.ok) {
    const errorMessage = data.error || data.message || 'Request failed';
    const statusCode = response.status;
    throw new Error(`Request failed with status ${statusCode}: ${errorMessage}`);
  }

  return data;
}

/**
 * Make an authenticated streaming API request
 */
export async function apiRequestStream(
  endpoint: string,
  method: RequestMethod = 'POST',
  body?: any
): Promise<ReadableStream<Uint8Array>> {
  // Validate input parameters
  if (!endpoint) {
    throw new Error('Endpoint is required');
  }

  if (!method) {
    throw new Error('HTTP method is required');
  }

  // Get PocketBase client
  let pb;
  try {
    pb = getPocketBaseClient();
  } catch (error) {
    throw new Error('Failed to initialize PocketBase client: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
  
  if (!pb.authStore.isValid) {
    throw new Error('Unauthorized - Please login first');
  }

  // Make the API request
  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${pb.authStore.token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Response body is null');
  }

  return response.body;
}