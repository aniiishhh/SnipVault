import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { snippetApi } from '@/lib/api';
import { Snippet } from '@/lib/types';

const ViewSnippet: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSnippet = async () => {
      if (!id) {
        setError('Snippet ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await snippetApi.getSnippet(parseInt(id));
        setSnippet(response.data);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch snippet:', error);
        
        let errorMessage = 'Failed to load snippet.';
        
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = 'Snippet not found.';
          } else if (error.response.data?.detail) {
            errorMessage = error.response.data.detail;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchSnippet();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLanguageColor = (language: string) => {
    const colors: { [key: string]: string } = {
      javascript: 'bg-yellow-100 text-yellow-800',
      python: 'bg-blue-100 text-blue-800',
      java: 'bg-red-100 text-red-800',
      cpp: 'bg-purple-100 text-purple-800',
      csharp: 'bg-green-100 text-green-800',
      php: 'bg-indigo-100 text-indigo-800',
      ruby: 'bg-red-100 text-red-800',
      go: 'bg-cyan-100 text-cyan-800',
      rust: 'bg-orange-100 text-orange-800',
      swift: 'bg-pink-100 text-pink-800',
      kotlin: 'bg-purple-100 text-purple-800',
      typescript: 'bg-blue-100 text-blue-800',
      html: 'bg-orange-100 text-orange-800',
      css: 'bg-blue-100 text-blue-800',
      sql: 'bg-gray-100 text-gray-800',
      bash: 'bg-green-100 text-green-800',
    };
    return colors[language.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading snippet...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Snippet Not Found</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <p className="text-sm text-gray-500">
                This snippet might not exist or you don't have permission to view it.
              </p>
            </div>
            <Button onClick={() => navigate('/dashboard')} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                SnipVault
              </h1>
              <p className="text-sm text-gray-600">Your Code Snippet</p>
            </div>
          </div>
        </div>

        {/* Snippet Card */}
        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-semibold text-gray-900 mb-3">
                  {snippet.title}
                </CardTitle>
                {snippet.description && (
                  <CardDescription className="text-gray-600 text-base mb-4">
                    {snippet.description}
                  </CardDescription>
                )}
                <div className="flex items-center space-x-3 mb-4">
                  <Badge className={getLanguageColor(snippet.language)}>
                    {snippet.language}
                  </Badge>
                  <Badge variant={snippet.is_public ? 'default' : 'secondary'} className={snippet.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {snippet.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>
                {snippet.tags && snippet.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {snippet.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-sm">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Created {formatDate(snippet.created_at)}</span>
                  {snippet.updated_at && snippet.updated_at !== snippet.created_at && (
                    <span>• Updated {formatDate(snippet.updated_at)}</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Code Display */}
            <div className="bg-gray-900 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  {snippet.language}
                </Badge>
              </div>
              <pre className="text-gray-100 overflow-x-auto">
                <code className="text-sm leading-relaxed">{snippet.code}</code>
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(snippet.code);
                    // You could add a toast notification here
                  }}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/edit-snippet/${snippet.id}`)}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Snippet
                </Button>
                {snippet.is_public && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`/snippets/public/${snippet.id}`, '_blank')}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Public Link
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-500">
                <span>Your snippet</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ViewSnippet; 