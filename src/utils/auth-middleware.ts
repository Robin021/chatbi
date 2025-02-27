import { NextRequest, NextResponse } from 'next/server';
import { getPocketBaseClient } from '@/utils/pocketbase';

export type AuthData = {
  token: string;
  pb: ReturnType<typeof getPocketBaseClient>;
};

export async function getAuth(request: NextRequest): Promise<AuthData> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw NextResponse.json(
      { error: 'Unauthorized - Missing or invalid token' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];
  const pb = getPocketBaseClient();
  
  pb.authStore.save(token);
  
  if (!pb.authStore.isValid) {
    pb.authStore.clear();
    throw NextResponse.json(
      { error: 'Unauthorized - Invalid token' },
      { status: 401 }
    );
  }

  // Wrap pb in a proxy to handle cleanup on any method call
  const wrappedPb = new Proxy(pb, {
    get(target, prop) {
      const original = target[prop];
      if (typeof original === 'function') {
        return function (...args: any[]) {
          try {
            return original.apply(target, args);
          } finally {
            target.authStore.clear();
          }
        };
      }
      return original;
    }
  });

  return { token, pb: wrappedPb };
} 