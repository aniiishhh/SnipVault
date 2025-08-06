import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { snippetApi } from '@/lib/api';

interface Tag {
  id: number;
  name: string;
  created_at: string;
}

interface TagManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onTagSelect?: (tag: Tag) => void;
  mode?: 'view' | 'select';
}

const TagManager: React.FC<TagManagerProps> = ({ 
  isOpen, 
  onClose, 
  onTagSelect, 
  mode = 'view' 
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingTag, setCreatingTag] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchTags();
    }
  }, [isOpen]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await snippetApi.getTags();
      setTags(response.data);
    } catch (err: any) {
      console.error('Failed to fetch tags:', err);
      setError('Failed to load tags. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setCreatingTag(true);
      setError('');
      const response = await snippetApi.createTag({ name: newTagName.trim() });
      setTags([...tags, response.data]);
      setNewTagName('');
    } catch (err: any) {
      console.error('Failed to create tag:', err);
      setError('Failed to create tag. Please try again.');
    } finally {
      setCreatingTag(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      createTag();
    }
  };

  const handleTagClick = (tag: Tag) => {
    if (mode === 'select' && onTagSelect) {
      onTagSelect(tag);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {mode === 'select' ? 'Select Tag' : 'Manage Tags'}
                </CardTitle>
                <CardDescription>
                  {mode === 'select' 
                    ? 'Choose a tag to add to your snippet' 
                    : 'Create and manage your tags'
                  }
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Create New Tag */}
            {mode === 'view' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Create New Tag
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={creatingTag}
                      className="flex-1"
                    />
                    <Button
                      onClick={createTag}
                      disabled={!newTagName.trim() || creatingTag}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {creatingTag ? 'Creating...' : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Tags List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  {mode === 'select' ? 'Available Tags' : 'Your Tags'}
                </h3>
                {mode === 'view' && (
                  <span className="text-xs text-gray-500">
                    {tags.length} tag{tags.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600">Loading tags...</span>
                </div>
              ) : tags.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-sm">No tags yet</p>
                  {mode === 'view' && (
                    <p className="text-xs text-gray-400 mt-1">Create your first tag above</p>
                  )}
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {tags.map((tag) => (
                    <div
                      key={tag.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        mode === 'select' 
                          ? 'cursor-pointer hover:bg-gray-50 border-gray-200' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleTagClick(tag)}
                    >
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                          {tag.name}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Created {new Date(tag.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {mode === 'select' && (
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {mode === 'view' && (
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TagManager; 