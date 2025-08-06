import React from 'react';
import { Snippet } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SnippetCardProps {
  snippet: Snippet;
  onEdit: (snippet: Snippet) => void;
  onDelete: (snippetId: number) => void;
  onToggleVisibility: (snippetId: number) => void;
  onView: (snippet: Snippet) => void;
}

const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onEdit,
  onDelete,
  onToggleVisibility,
  onView,
}) => {
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

  return (
    <Card 
      className="hover:shadow-lg transition-all duration-200 border-0 shadow-md cursor-pointer"
      onClick={() => onView(snippet)}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Title and Description */}
            <CardTitle className="text-lg font-semibold text-gray-900 mb-2">
              {snippet.title}
            </CardTitle>
            <CardDescription className="text-gray-600 mb-4">
              {snippet.description || 'No description provided'}
            </CardDescription>
            
            {/* Language and Visibility Badges - Top Row */}
            <div className="flex items-center space-x-2 mb-4">
              <Badge className={getLanguageColor(snippet.language)}>
                {snippet.language}
              </Badge>
              <Badge variant={snippet.is_public ? 'default' : 'secondary'} className={snippet.is_public ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                {snippet.is_public ? 'Public' : 'Private'}
              </Badge>
            </div>
            
            {/* Tags Section - Clear Label */}
            {snippet.tags && snippet.tags.length > 0 && (
              <div className="mb-4">
                <div className="text-xs font-medium text-gray-500 mb-2">Tags:</div>
                <div className="flex flex-wrap gap-1">
                  {snippet.tags.map((tag) => (
                    <Badge key={tag.id} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Date Information */}
            <p className="text-xs text-gray-500">
              Created {formatDate(snippet.created_at)}
              {snippet.updated_at && snippet.updated_at !== snippet.created_at && (
                <span> • Updated {formatDate(snippet.updated_at)}</span>
              )}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Action Buttons - Better Organized */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(snippet);
              }}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility(snippet.id);
              }}
              className={`${
                snippet.is_public
                  ? 'text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300'
                  : 'text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {snippet.is_public ? 'Make Private' : 'Make Public'}
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(snippet.id);
            }}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SnippetCard; 