import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { snippetApi, publicApi } from '@/lib/api';
import { Snippet } from '@/lib/types';
import { useAuth } from '@/contexts/AuthContext';

const PublicSnippets: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  useEffect(() => {
    fetchPublicSnippets();
  }, []);

  const fetchPublicSnippets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await publicApi.get('/public/snippets/');
      setSnippets(response.data);
    } catch (err: any) {
      console.error('Failed to fetch public snippets:', err);
      setError('Failed to load public snippets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  // Get unique languages and tags for filtering
  const languages = [...new Set(snippets.map(s => s.language))].sort();
  const allTags = snippets.flatMap(s => s.tags.map(t => t.name));
  const uniqueTags = [...new Set(allTags)].sort();

  // Filter snippets based on search term, language, and tag
  const filteredSnippets = snippets.filter(snippet => {
    const matchesSearch = searchTerm === '' || 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLanguage = selectedLanguage === '' || snippet.language === selectedLanguage;
    
    const matchesTag = selectedTag === '' || 
      snippet.tags.some(tag => tag.name === selectedTag);
    
    return matchesSearch && matchesLanguage && matchesTag;
  });

  const handleSnippetClick = (snippet: Snippet) => {
    navigate(`/snippets/public/${snippet.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading public snippets...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  SnipVault
                </h1>
                <p className="text-sm text-gray-600">Public Code Snippets</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (user) {
                    navigate('/dashboard');
                  } else {
                    navigate('/login');
                  }
                }}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {user ? 'Back to Dashboard' : 'Sign In'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Discover Code Snippets</h2>
            
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="Search snippets by title, description, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Languages</option>
                  {languages.map((language) => (
                    <option key={language} value={language}>
                      {language.charAt(0).toUpperCase() + language.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tag</label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Tags</option>
                  {uniqueTags.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredSnippets.length} of {snippets.length} snippets
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Snippets Grid */}
        {!error && (
          <>
            {filteredSnippets.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-8">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No snippets found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedLanguage || selectedTag 
                      ? 'Try adjusting your search or filters.'
                      : 'No public snippets available yet.'
                    }
                  </p>
                  {searchTerm || selectedLanguage || selectedTag ? (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedLanguage('');
                        setSelectedTag('');
                      }}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <Button
                      onClick={() => navigate('/dashboard')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Back to Dashboard
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredSnippets.map((snippet) => (
                  <Card
                    key={snippet.id}
                    className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer bg-white/80 backdrop-blur-sm"
                    onClick={() => handleSnippetClick(snippet)}
                  >
                                         <CardHeader className="pb-4">
                       <div className="flex items-start justify-between">
                         <div className="flex-1">
                           {/* Title and Description */}
                           <CardTitle className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                             {snippet.title}
                           </CardTitle>
                           {snippet.description && (
                             <CardDescription className="text-gray-600 mb-4 line-clamp-2">
                               {snippet.description}
                             </CardDescription>
                           )}
                           
                           {/* Language and Visibility Badges - Top Row */}
                           <div className="flex items-center space-x-2 mb-4">
                             <Badge className={getLanguageColor(snippet.language)}>
                               {snippet.language}
                             </Badge>
                             <Badge variant="default" className="bg-green-100 text-green-800">
                               Public
                             </Badge>
                           </div>
                           
                           {/* Tags Section - Clear Label */}
                           {snippet.tags && snippet.tags.length > 0 && (
                             <div className="mb-4">
                               <div className="text-xs font-medium text-gray-500 mb-2">Tags:</div>
                               <div className="flex flex-wrap gap-1">
                                 {snippet.tags.slice(0, 3).map((tag) => (
                                   <Badge key={tag.id} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                     {tag.name}
                                   </Badge>
                                 ))}
                                 {snippet.tags.length > 3 && (
                                   <Badge variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                                     +{snippet.tags.length - 3} more
                                   </Badge>
                                 )}
                               </div>
                             </div>
                           )}
                         </div>
                       </div>
                     </CardHeader>
                                         <CardContent>
                       <div className="flex items-center justify-between text-sm text-gray-500">
                         <span>Created {formatDate(snippet.created_at)}</span>
                         <div className="flex items-center space-x-1">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                           </svg>
                           <span>View</span>
                         </div>
                       </div>
                     </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicSnippets; 