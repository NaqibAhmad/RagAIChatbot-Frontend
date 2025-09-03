import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Settings, FileText } from 'lucide-react';
import { ChatSession, ChatMessage, Utterance } from '@/types';
import { apiService } from '@/services/api';
import { chatStorageService } from '@/services/chatStorage';
import { formatRelativeTime, cn } from '@/utils';
import DocumentSelector from './DocumentSelector';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  session: ChatSession;
  onSessionUpdate: (session: ChatSession) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ session, onSessionUpdate }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.messages]);

  // Auto-focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content: inputMessage.trim(),
    };

    // Add user message to session
    const newUserMessage = chatStorageService.addMessage(session.id, userMessage);
    if (newUserMessage) {
      const updatedSession = {
        ...session,
        messages: [...session.messages, newUserMessage],
      };
      onSessionUpdate(updatedSession);
    }

    const messageToSend = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Prepare transcript for RAG API
      const transcript: Utterance[] = [
        ...session.messages.map(msg => ({
          role: (msg.role === 'user' ? 'user' : 'agent') as 'user' | 'agent',
          content: msg.content,
        })),
        { role: 'user' as const, content: messageToSend },
      ];

      // Send to RAG API
      const response = await apiService.processRAGQuery({
        transcript,
        search_type: session.settings.search_type,
        temperature: session.settings.temperature,
        model: session.settings.model,
        selected_documents: selectedDocuments,
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Add assistant response to session
      const assistantMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: response.response,
        metadata: {
          documents_retrieved: response.documents_retrieved,
          processing_time: response.processing_time,
          search_type: response.search_type,
        },
      };

      const newAssistantMessage = chatStorageService.addMessage(session.id, assistantMessage);
      if (newAssistantMessage) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, newUserMessage!, newAssistantMessage],
        };
        onSessionUpdate(updatedSession);
      }

      toast.success('Response received successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to session
      const errorMessage: Omit<ChatMessage, 'id' | 'timestamp'> = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };

      const newErrorMessage = chatStorageService.addMessage(session.id, errorMessage);
      if (newErrorMessage) {
        const updatedSession = {
          ...session,
          messages: [...session.messages, newUserMessage!, newErrorMessage],
        };
        onSessionUpdate(updatedSession);
      }

      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.role === 'user';
    
    return (
      <div className={cn(
        "flex space-x-3 mb-4 animate-slide-up",
        isUser ? "justify-end" : "justify-start"
      )}>
        {!isUser && (
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary-600" />
          </div>
        )}
        
        <div className={cn(
          "max-w-[70%] rounded-lg px-4 py-3",
          isUser 
            ? "bg-primary-600 text-white" 
            : "bg-white border border-gray-200 text-gray-900"
        )}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {!isUser && message.metadata && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500 space-y-1">
              {message.metadata.documents_retrieved && (
                <div>📚 {message.metadata.documents_retrieved} documents retrieved</div>
              )}
              {message.metadata.processing_time && (
                <div>⏱️ {message.metadata.processing_time.toFixed(2)}s processing time</div>
              )}
              {message.metadata.search_type && (
                <div>🔍 {message.metadata.search_type} search</div>
              )}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-gray-600" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{session.name}</h2>
            <p className="text-sm text-gray-500">
              {session.messages.length} messages • Last updated {formatRelativeTime(session.updatedAt)}
            </p>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <DocumentSelector
              selectedDocuments={selectedDocuments}
              onSelectionChange={setSelectedDocuments}
            />
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span className="capitalize">{session.settings.search_type}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Settings className="w-4 h-4" />
              <span>{session.settings.model}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        {session.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-primary-600" />
            </div>
                         <h3 className="text-lg font-medium text-gray-900 mb-2">
               Welcome to your RAG Assistant
             </h3>
             <p className="text-gray-500 max-w-md mx-auto">
               Start a conversation by typing a message below. I can help you with questions using the knowledge base.
             </p>
          </div>
        ) : (
          <div className="space-y-4">
            {session.messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            
            {isTyping && (
              <div className="flex space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
                             placeholder="Type your question here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '120px' }}
              disabled={isLoading}
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className={cn(
              "px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2",
              inputMessage.trim() && !isLoading
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
