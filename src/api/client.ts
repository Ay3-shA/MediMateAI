/**
 * Centralized API client for MediMateAI.
 * All requests route through relative `/api` paths handled by the Express backend.
 */

const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('medimate_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Unauthorized (401)
  if (response.status === 401) {
    if (token) {
      localStorage.removeItem('medimate_token');
      localStorage.removeItem('medimate_user');
      // Dispatch custom event so AuthContext can handle logout without reload
      window.dispatchEvent(new CustomEvent('auth:expired'));
    }
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = (typeof data === 'object' && data?.message) 
      ? data.message 
      : (typeof data === 'string' && data.length > 0)
        ? data
        : `Request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status, data);
  }

  return data as T;
}

export const api = {
  get: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'GET', headers }),
    
  post: <T>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    request<T>(endpoint, { 
      method: 'POST', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),
    
  put: <T>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    request<T>(endpoint, { 
      method: 'PUT', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),

  patch: <T>(endpoint: string, body?: any, headers?: Record<string, string>) => 
    request<T>(endpoint, { 
      method: 'PATCH', 
      body: body ? JSON.stringify(body) : undefined,
      headers 
    }),
    
  delete: <T>(endpoint: string, headers?: Record<string, string>) => 
    request<T>(endpoint, { method: 'DELETE', headers }),
};
