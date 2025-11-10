import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { ChatMessage, AnalysisResponse } from '../types';
import { DentalAPIService } from '../services/api';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { ImageAnalysisPanel } from './ImageAnalysisPanel';

const apiService = new DentalAPIService();

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Dental AI Assistant. Please upload an OPG X-ray image to begin the analysis.',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showImagePanel, setShowImagePanel] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);

    try {
      const result = await apiService.uploadXray(file);
      setAnalysisResult(result);
      setShowImagePanel(true);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `X-ray analysis complete! ${result.analysis_summary}\n\nFeel free to ask me any questions about the findings.`,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Upload error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, there was an error analyzing the X-ray. Please make sure the backend server is running and try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      await apiService.sendMessageStreaming(inputMessage, (chunk) => {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      });
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeUploadedFile = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setShowImagePanel(false);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <ChatHeader
          onToggleImagePanel={() => setShowImagePanel(!showImagePanel)}
          hasAnalysis={!!analysisResult}
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && messages[messages.length - 1]?.role === 'assistant' && (
            <div className="flex items-center gap-2 text-gray-500 ml-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t bg-white p-4">
          {uploadedFile && (
            <div className="mb-3 flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-gray-700 flex-1">{uploadedFile.name}</span>
              <button
                onClick={removeUploadedFile}
                className="p-1 hover:bg-blue-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          )}

          <div className="flex gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span className="font-medium">Upload X-ray</span>
            </button>

            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={analysisResult ? "Ask about the X-ray analysis..." : "Upload an X-ray first..."}
                disabled={isLoading || !analysisResult}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !analysisResult}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showImagePanel && analysisResult && (
        <ImageAnalysisPanel
          analysisResult={analysisResult}
          onClose={() => setShowImagePanel(false)}
        />
      )}
    </div>
  );
}
