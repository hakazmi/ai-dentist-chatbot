import { useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/LoginPage';
import { ChatInterface } from './components/ChatInterface';

function App() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <ChatInterface /> : <LoginPage />;
}

export default App;
