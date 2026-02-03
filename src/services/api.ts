import { RAGRequest, RAGResponse } from '@/types';
import { licenseService } from './license';

// Get API URL from environment variable, with fallback for production
const getApiBaseUrl = () => {
  const meta = import.meta as any;
  const envUrl = meta.env?.VITE_API_URL;
  if (envUrl) return envUrl;
  
  // In production (Vercel), use the backend URL
  if (meta.env?.PROD) {
    return 'https://ragaichatbot-backend.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const licenseKey = licenseService.getKey() || '';
    
    // Build headers - ensure license key is always included if present
    const headers: Record<string, string> = {};
    
    // Copy existing headers if they're a plain object
    if (options.headers && typeof options.headers === 'object' && !(options.headers instanceof Headers)) {
      Object.assign(headers, options.headers);
    }
    
    // Only add Content-Type if not already set (for FormData requests)
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Always add license key header if available
    if (licenseKey) {
      headers['X-License-Key'] = licenseKey;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.detail || 'Unauthorized: Please check your license key');
        }
        
        // Handle other HTTP errors
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      // Handle CORS and network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const corsError = new Error(
          'Network error: Unable to connect to the server. This may be a CORS issue. Please check your backend configuration.'
        );
        (corsError as any).isCorsError = true;
        throw corsError;
      }
      
      // Re-throw other errors as-is
      throw error;
    }
  }

  // Health check
  async getHealth(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request('/health');
  }

  // RAG query
  async processRAGQuery(request: RAGRequest): Promise<RAGResponse> {
    return this.request('/api/rag/query', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Get all documents
  async getAllDocuments(): Promise<{
    total_documents: number;
    unique_files: number;
    files: Array<{
      file_name: string;
      uploaded_at: string;
      content_type: string;
      total_chunks: number;
      sessions: string[];
    }>;
    timestamp: string;
  }> {
    return this.request('/api/documents/all');
  }

  // Update search type
  async updateSearchType(searchType: string): Promise<{ message: string; search_type: string; timestamp: string }> {
    return this.request(`/api/rag/search-type?search_type=${searchType}`, {
      method: 'POST',
    });
  }

  // Get RAG status
  async getRAGStatus(): Promise<{ status: string; persist_directory: string; embedding_model: string; llm_model: string; timestamp: string }> {
    return this.request('/api/rag/status');
  }

  // Delete session documents
  async deleteSessionDocuments(sessionId: string): Promise<{ message: string; deleted_count: number; timestamp: string }> {
    return this.request(`/api/documents/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Delete documents by file name
  async deleteDocumentsByFileName(fileName: string): Promise<{ message: string; deleted_count: number; file_name: string; timestamp: string }> {
    // Encode the file name in case it contains special characters
    const encodedFileName = encodeURIComponent(fileName);
    return this.request(`/api/documents/file/${encodedFileName}`, {
      method: 'DELETE',
    });
  }

  // Document upload (placeholder for future implementation)
  async uploadDocument(file: File, sessionId?: string): Promise<{ message: string; documents_processed: number; status: string; session_id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    if (sessionId) {
      formData.append('session_id', sessionId);
    }
    
    const url = `${API_BASE_URL}/api/documents/upload`;
    const licenseKey = licenseService.getKey() || '';
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          ...(licenseKey ? { 'X-License-Key': licenseKey } : {}),
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }
}

export const apiService = new ApiService();
