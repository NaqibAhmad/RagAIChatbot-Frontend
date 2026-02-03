import { RAGRequest, RAGResponse } from '@/types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const licenseKey = localStorage.getItem('LICENSE_KEY') || '';
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(licenseKey ? { 'X-License-Key': licenseKey } : {}),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
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
    const licenseKey = localStorage.getItem('LICENSE_KEY') || '';
    
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
