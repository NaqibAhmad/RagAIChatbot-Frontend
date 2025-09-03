import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  File, 
  Trash2, 
  Eye, 
  Clock
} from 'lucide-react';
import { Document } from '@/types';
import { formatFileSize, cn } from '@/utils';
import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/constants';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';

const DocumentManager: React.FC = () => {
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set());
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [databaseDocuments, setDatabaseDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Generate or retrieve session ID on component mount
  useEffect(() => {
    const storedSessionId = localStorage.getItem('rag_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('rag_session_id', newSessionId);
    }
  }, []);

  // Load documents from database on component mount
  useEffect(() => {
    loadDatabaseDocuments();
  }, []);

  // Load all documents from the database
  const loadDatabaseDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const response = await apiService.getAllDocuments();
      setDatabaseDocuments(response.files || []);
    } catch (error) {
      console.error('Failed to load database documents:', error);
      toast.error('Failed to load documents from database');
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Real document upload function that calls the backend
  const uploadDocument = async (file: File): Promise<Document> => {
    try {
      const response = await apiService.uploadDocument(file, sessionId);
      
      const document: Document = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date(),
        status: 'ready',
      };

      toast.success(`${file.name} uploaded and processed successfully! ${response.documents_processed} chunks created.`);
      
      // Refresh the database documents list after successful upload
      await loadDatabaseDocuments();
      
      return document;
      
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
        toast.error(`${file.name} is not a supported file type`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}`);
        continue;
      }
      
      try {
        await uploadDocument(file);
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: MAX_FILE_SIZE,
  });

  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId);
    } else {
      newSelected.add(documentId);
    }
    setSelectedDocuments(newSelected);
  };

  const deleteSelectedDocuments = async () => {
    if (selectedDocuments.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedDocuments.size} selected document(s)?`)) {
      try {
        // Delete each selected document
        for (const fileName of selectedDocuments) {
          await deleteDocument(fileName);
        }
        setSelectedDocuments(new Set());
        toast.success('Selected documents deleted');
      } catch (error) {
        console.error('Failed to delete selected documents:', error);
        toast.error('Some documents could not be deleted');
      }
    }
  };

  const deleteDocument = async (fileName: string) => {
    if (window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      try {
        // Find the document to get its session ID
        const document = databaseDocuments.find(doc => doc.file_name === fileName);
        if (!document) {
          toast.error('Document not found');
          return;
        }

        // Delete from the first session (you might want to implement session-specific deletion)
        const sessionId = document.sessions?.[0];
        if (sessionId) {
          await apiService.deleteSessionDocuments(sessionId);
          toast.success(`${fileName} deleted successfully`);
          // Refresh the documents list
          await loadDatabaseDocuments();
        } else {
          toast.error('No session found for document');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete document');
      }
    }
  };



  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Document Manager</h2>
            <p className="text-sm text-gray-500">
              Upload and manage documents for your RAG knowledge base
            </p>
            {sessionId && (
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-xs text-gray-500">Session ID:</span>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-700">
                  {sessionId}
                </code>
                <button
                  onClick={() => {
                    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    setSessionId(newSessionId);
                    localStorage.setItem('rag_session_id', newSessionId);
                    toast.success('New session created');
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  New Session
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {selectedDocuments.size > 0 && (
              <button
                onClick={deleteSelectedDocuments}
                className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({selectedDocuments.size})</span>
              </button>
            )}
            
            <button
              onClick={loadDatabaseDocuments}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Refresh Documents</span>
            </button>
            
            <button
              onClick={() => setShowUploadArea(!showUploadArea)}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Documents</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {showUploadArea && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200",
              isDragActive
                ? "border-primary-400 bg-primary-50"
                : "border-gray-300 hover:border-primary-400 hover:bg-primary-50"
            )}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary-600" />
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                </h3>
                <p className="text-gray-500 mb-4">
                  or click to browse files
                </p>
                
                <div className="text-sm text-gray-400 space-y-1">
                  <p>Supported formats: PDF, DOCX, TXT, MD</p>
                  <p>Maximum file size: 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

              {/* Documents List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingDocuments ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Loading documents...
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Please wait while we fetch documents from the database.
              </p>
            </div>
          ) : databaseDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No documents in database
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Upload documents to build your knowledge base and enable RAG-powered conversations.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {databaseDocuments.map((document, index) => (
                <div
                  key={document.file_name || index}
                  className={cn(
                    "bg-white border rounded-lg p-4 transition-all duration-200",
                    selectedDocuments.has(document.file_name)
                      ? "border-primary-300 bg-primary-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedDocuments.has(document.file_name)}
                      onChange={() => toggleDocumentSelection(document.file_name)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    
                    {/* File Icon */}
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-gray-600" />
                    </div>
                    
                    {/* Document Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {document.file_name}
                        </h4>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {document.total_chunks} chunks
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{document.content_type}</span>
                        <span>•</span>
                        <span>{new Date(document.uploaded_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{document.sessions?.length || 0} session{(document.sessions?.length || 0) === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {/* View document */}}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => deleteDocument(document.file_name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
};

export default DocumentManager;
