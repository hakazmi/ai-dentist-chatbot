import { Image, LogOut, User, Stethoscope } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ChatHeaderProps {
  onToggleImagePanel: () => void;
  hasAnalysis: boolean;
}

export function ChatHeader({ onToggleImagePanel, hasAnalysis }: ChatHeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
           <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Dental AI Assistant</h1>
            <p className="text-sm text-gray-500">Analyzing dental X-rays with AI</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {hasAnalysis && (
            <button
              onClick={onToggleImagePanel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
            >
              <Image className="w-5 h-5" />
              <span className="font-medium">View Analysis</span>
            </button>
          )}

          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}