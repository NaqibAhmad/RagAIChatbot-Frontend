import React, { useState } from 'react';
import { 
  MessageSquare, 
  FileText, 
  Settings, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3,
  Check,
  X,
  Activity,
  Clock
} from 'lucide-react';
import { ChatSession } from '@/types';
import { formatRelativeTime, getInitials, cn } from '@/utils';
import { chatStorageService } from '@/services/chatStorage';

interface SidebarProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  onCreateSession: () => void;
  onSwitchSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onExportSessions: () => void;
  onImportSessions: (file: File) => void;
  viewMode: 'chat' | 'documents' | 'settings';
  onViewModeChange: (mode: 'chat' | 'documents' | 'settings') => void;
  apiHealth: boolean | null;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSession,
  onCreateSession,
  onSwitchSession,
  onDeleteSession,
  onExportSessions,
  onImportSessions,
  viewMode,
  onViewModeChange,
  apiHealth,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showImportInput, setShowImportInput] = useState(false);

  const handleEditSession = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditingName(session.name);
  };

  const handleSaveEdit = (sessionId: string) => {
    if (editingName.trim()) {
      chatStorageService.updateSessionName(sessionId, editingName.trim());
      setEditingSessionId(null);
      setEditingName('');
      // Force re-render by updating the parent state
      window.location.reload();
    }
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingName('');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImportSessions(file);
      setShowImportInput(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      onDeleteSession(sessionId);
    }
  };

  const stats = chatStorageService.getSessionStats();

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">RAG Assistant</h1>
          <div className="flex items-center space-x-2">
            <div className={cn(
              "w-3 h-3 rounded-full",
              apiHealth === true ? "bg-green-500" : 
              apiHealth === false ? "bg-red-500" : "bg-yellow-500"
            )} />
            <span className="text-xs text-gray-500">
              {apiHealth === true ? "Connected" : 
               apiHealth === false ? "Disconnected" : "Checking..."}
            </span>
          </div>
        </div>
        
        <button
          onClick={onCreateSession}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-gray-200">
        <nav className="space-y-2">
          <button
            onClick={() => onViewModeChange('chat')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200",
              viewMode === 'chat' 
                ? "bg-primary-50 text-primary-700 border border-primary-200" 
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Chat</span>
          </button>
          
          <button
            onClick={() => onViewModeChange('documents')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200",
              viewMode === 'documents' 
                ? "bg-primary-50 text-primary-700 border border-primary-200" 
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <FileText className="w-5 h-5" />
            <span>Documents</span>
          </button>
          
          <button
            onClick={() => onViewModeChange('settings')}
            className={cn(
              "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200",
              viewMode === 'settings' 
                ? "bg-primary-50 text-primary-700 border border-primary-200" 
                : "text-gray-700 hover:bg-gray-50"
            )}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Session List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Chat Sessions</h3>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Total: {stats.totalSessions}</span>
              <span>Messages: {stats.totalMessages}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg: {stats.averageMessagesPerSession}</span>
              <span>per session</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                currentSession?.id === session.id
                  ? "border-primary-300 bg-primary-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )}
              onClick={() => onSwitchSession(session.id)}
            >
              {editingSessionId === session.id ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={() => handleSaveEdit(session.id)}
                    className="p-1 text-green-600 hover:bg-green-100 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-700">
                          {getInitials(session.name)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {session.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {session.messages.length} messages
                        </p>
                      </div>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(session.updatedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3" />
                      <span className="capitalize">{session.settings.search_type}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={onExportSessions}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <Download className="w-4 h-4" />
          <span>Export Sessions</span>
        </button>
        
        <button
          onClick={() => setShowImportInput(!showImportInput)}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200"
        >
          <Upload className="w-4 h-4" />
          <span>Import Sessions</span>
        </button>
        
        {showImportInput && (
          <div className="mt-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
