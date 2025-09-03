export interface Utterance {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export interface RAGRequest {
  transcript: Utterance[];
  search_type?: 'hybrid' | 'semantic' | 'keyword';
  temperature?: number;
  model?: string;
  selected_documents?: string[];  // List of file names to focus on
}

export interface RAGResponse {
  response: string;
  context_used?: string;
  documents_retrieved?: number;
  processing_time?: number;
  search_type?: string;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    documents_retrieved?: number;
    processing_time?: number;
    search_type?: string;
  };
}

export interface ChatSession {
  id: string;
  name: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  settings: {
    model: string;
    temperature: number;
    search_type: 'hybrid' | 'semantic' | 'keyword';
  };
}

export interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: 'processing' | 'ready' | 'error';
  content?: string;
}

export interface ModelOption {
  value: string;
  label: string;
  description: string;
}

export interface SearchTypeOption {
  value: 'hybrid' | 'semantic' | 'keyword';
  label: string;
  description: string;
}

export interface TemperatureSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}
