import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreateSnippet from './pages/CreateSnippet';
import EditSnippet from './pages/EditSnippet';
import ViewSnippet from './pages/ViewSnippet';
import PublicSnippetViewer from './pages/PublicSnippetViewer';
import PublicSnippets from './pages/PublicSnippets';
import { useEffect } from 'react';
import { api, endpoints } from '@/lib/api';

function App() {
  // Test API call on app startup
  useEffect(() => {
    const testApiConnection = async () => {
      try {
        const response = await api.get(endpoints.health);
        console.log('✅ API connection successful:', response.data);
      } catch (error) {
        console.error('❌ API connection failed:', error);
      }
    };

    testApiConnection();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/create-snippet" 
              element={
                <PrivateRoute>
                  <CreateSnippet />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/edit-snippet/:id" 
              element={
                <PrivateRoute>
                  <EditSnippet />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/view-snippet/:id" 
              element={
                <PrivateRoute>
                  <ViewSnippet />
                </PrivateRoute>
              } 
            />
            <Route path="/public-snippets" element={<PublicSnippets />} />
            <Route path="/snippets/public/:id" element={<PublicSnippetViewer />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
