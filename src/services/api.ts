import { RAGRequest, RAGResponse } from '@/types';
import { licenseService } from '@/services/license';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
console.log(API_BASE_URL);
class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        [licenseService.headerName]: licenseService.getKey() || '',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          // License invalid or missing, clear it so UI re-gates
          licenseService.clearKey();
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
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
  async deleteSessionDocuments(sessionId: string): Promise<{ message: string; documents_deleted: number; timestamp: string }> {
    return this.request(`/api/documents/sessions/${sessionId}`, {
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
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        headers: {
          [licenseService.headerName]: licenseService.getKey() || '',
        },
      });
      
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          licenseService.clearKey();
        }
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
