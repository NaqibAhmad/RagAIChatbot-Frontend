import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/Sidebar';
import ChatInterface from '@/components/ChatInterface';
import DocumentManager from '@/components/DocumentManager';
import SettingsPanel from '@/components/SettingsPanel';
import { ChatSession } from '@/types';
import { chatStorageService } from '@/services/chatStorage';
import { apiService } from '@/services/api';
import { DEFAULT_SETTINGS } from '@/constants';
import toast from 'react-hot-toast';

type ViewMode = 'chat' | 'documents' | 'settings';

function App() {
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [apiHealth, setApiHealth] = useState<boolean | null>(null);

  // Load sessions and check API health on mount
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load existing sessions
        const existingSessions = chatStorageService.getSessions();
        setSessions(existingSessions);

        // Check API health
        try {
          await apiService.getHealth();
          setApiHealth(true);
        } catch (error) {
          setApiHealth(false);
          toast.error('Cannot connect to RAG API. Please ensure the backend is running.');
        }

        // Create default session if none exist
        if (existingSessions.length === 0) {
          const defaultSession = chatStorageService.createSession(
            'New Chat Session',
            DEFAULT_SETTINGS
          );
          setCurrentSession(defaultSession);
          setSessions([defaultSession]);
        } else {
          setCurrentSession(existingSessions[0]);
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        toast.error('Failed to initialize application');
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Create new chat session
  const createNewSession = () => {
    const newSession = chatStorageService.createSession(
      `New Chat Session ${sessions.length + 1}`,
      currentSession?.settings || DEFAULT_SETTINGS
    );
    
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setViewMode('chat');
    
    toast.success('New chat session created');
  };

  // Switch to a different session
  const switchSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      setViewMode('chat');
    }
  };

  // Delete a session
  const deleteSession = (sessionId: string) => {
    if (chatStorageService.deleteSession(sessionId)) {
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      
      // If we deleted the current session, switch to another one
      if (currentSession?.id === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          setCurrentSession(remainingSessions[0]);
        } else {
          // Create a new session if none remain
          const newSession = chatStorageService.createSession(
            'New Chat Session',
            DEFAULT_SETTINGS
          );
          setCurrentSession(newSession);
          setSessions([newSession]);
        }
      }
      
      toast.success('Chat session deleted');
    }
  };

  // Update session settings
  const updateSessionSettings = (sessionId: string, settings: Partial<ChatSession['settings']>) => {
    if (chatStorageService.updateSessionSettings(sessionId, settings)) {
      setSessions(prev => 
        prev.map(s => 
          s.id === sessionId 
            ? { ...s, settings: { ...s.settings, ...settings } }
            : s
        )
      );
      
      if (currentSession?.id === sessionId) {
        setCurrentSession(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : null);
      }
      
      toast.success('Settings updated');
    }
  };

  // Export all sessions
  const exportSessions = () => {
    try {
      chatStorageService.exportSessions();
      toast.success('Chat sessions exported successfully');
    } catch (error) {
      toast.error('Failed to export sessions');
    }
  };

  // Import sessions
  const importSessions = async (file: File) => {
    try {
      const success = await chatStorageService.importSessions(file);
      if (success) {
        const updatedSessions = chatStorageService.getSessions();
        setSessions(updatedSessions);
        toast.success('Chat sessions imported successfully');
      } else {
        toast.error('Invalid file format or corrupted data');
      }
    } catch (error) {
      toast.error('Failed to import sessions');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading RAG Assistant...</h2>
          <p className="text-gray-500 mt-2">Initializing your AI-powered assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          sessions={sessions}
          currentSession={currentSession}
          onCreateSession={createNewSession}
          onSwitchSession={switchSession}
          onDeleteSession={deleteSession}
          onExportSessions={exportSessions}
          onImportSessions={importSessions}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          apiHealth={apiHealth}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {viewMode === 'chat' && currentSession && (
            <ChatInterface
              session={currentSession}
              onSessionUpdate={(updatedSession) => {
                setCurrentSession(updatedSession);
                setSessions(prev => 
                  prev.map(s => s.id === updatedSession.id ? updatedSession : s)
                );
              }}
            />
          )}

          {viewMode === 'documents' && (
            <DocumentManager />
          )}

          {viewMode === 'settings' && currentSession && (
            <SettingsPanel
              session={currentSession}
              onSettingsUpdate={(settings) => 
                updateSessionSettings(currentSession.id, settings)
              }
            />
          )}
        </div>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '8px',
            padding: '12px 16px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
}

export default App;
