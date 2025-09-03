import React, { useState, useEffect } from 'react';
import { FileText, Check, X, Info } from 'lucide-react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

interface DocumentInfo {
  file_name: string;
  uploaded_at: string;
  content_type: string;
  total_chunks: number;
  sessions: string[];
}

interface DocumentSelectorProps {
  selectedDocuments: string[];
  onSelectionChange: (documents: string[]) => void;
}

const DocumentSelector: React.FC<DocumentSelectorProps> = ({ selectedDocuments, onSelectionChange }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllDocuments();
      setDocuments(response.files);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const toggleDocument = (fileName: string) => {
    const newSelection = selectedDocuments.includes(fileName)
      ? selectedDocuments.filter(name => name !== fileName)
      : [...selectedDocuments, fileName];
    onSelectionChange(newSelection);
  };

  const clearSelection = () => {
    onSelectionChange([]);
  };

  const getFileIcon = (contentType: string) => {
    switch (contentType) {
      case 'application/pdf':
        return '📄';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return '📝';
      case 'text/plain':
        return '📃';
      case 'text/markdown':
        return '📋';
      default:
        return '📄';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="relative">
      {/* Document Selection Button */}
      <button
        onClick={() => setShowSelector(!showSelector)}
        className={`px-3 py-2 text-sm rounded-lg border transition-colors duration-200 flex items-center space-x-2 ${
          selectedDocuments.length > 0
            ? 'bg-primary-50 border-primary-300 text-primary-700'
            : 'bg-white border-gray-300 text-gray-600 hover:border-primary-400'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span>
          {selectedDocuments.length === 0
            ? 'Select Documents'
            : `${selectedDocuments.length} Document${selectedDocuments.length === 1 ? '' : 's'} Selected`}
        </span>
        {selectedDocuments.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              clearSelection();
            }}
            className="ml-2 p-1 hover:bg-primary-100 rounded-full"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </button>

      {/* Document Selection Dropdown */}
      {showSelector && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">Select Documents to Focus On</h3>
              <button
                onClick={clearSelection}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Clear All
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Only selected documents will be used for RAG queries, reducing hallucinations
            </p>
          </div>

          <div className="p-2">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No documents uploaded yet</p>
                <p className="text-xs text-gray-400">Upload documents to enable selection</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.file_name}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors duration-200 ${
                      selectedDocuments.includes(doc.file_name)
                        ? 'border-primary-300 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleDocument(doc.file_name)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {selectedDocuments.includes(doc.file_name) ? (
                          <div className="w-4 h-4 bg-primary-600 rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">{getFileIcon(doc.content_type)}</span>
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {doc.file_name}
                          </h4>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>{doc.total_chunks} chunks</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploaded_at)}</span>
                          <span>•</span>
                          <span>{doc.sessions.length} session{doc.sessions.length === 1 ? '' : 's'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedDocuments.length > 0 && (
            <div className="p-3 bg-primary-50 border-t border-primary-200">
              <div className="flex items-center space-x-2 text-xs text-primary-700">
                <Info className="w-3 h-3" />
                <span>
                  RAG queries will focus on {selectedDocuments.length} selected document{selectedDocuments.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showSelector && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSelector(false)}
        />
      )}
    </div>
  );
};

export default DocumentSelector;
