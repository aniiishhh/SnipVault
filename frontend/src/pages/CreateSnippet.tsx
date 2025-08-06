import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { snippetApi } from '@/lib/api';
import { CreateSnippetRequest } from '@/lib/types';
import TagManager from '@/components/TagManager';

// Create snippet form schema
const createSnippetSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  language: z.string().min(1, 'Language is required'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  code: z.string().min(1, 'Code is required'),
  is_public: z.boolean(),
  customLanguage: z.string().optional(),
});

type CreateSnippetFormData = z.infer<typeof createSnippetSchema>;

const CreateSnippet: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [showCustomLanguage, setShowCustomLanguage] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);

  const form = useForm<CreateSnippetFormData>({
    resolver: zodResolver(createSnippetSchema),
    defaultValues: {
      title: '',
      language: '',
      description: '',
      code: '',
      is_public: false,
      customLanguage: '',
    },
  });

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagSelect = (tag: { id: number; name: string; created_at: string }) => {
    if (!tags.includes(tag.name)) {
      setTags([...tags, tag.name]);
    }
  };

  const handleLanguageChange = (language: string) => {
    setShowCustomLanguage(language === 'other');
    if (language !== 'other') {
      form.setValue('customLanguage', '');
    }
  };

  const onSubmit = async (data: CreateSnippetFormData) => {
    setIsLoading(true);
    setError('');

    try {
      // Use custom language if selected, otherwise use the selected language
      const finalLanguage = data.language === 'other' ? data.customLanguage : data.language;
      
      if (!finalLanguage) {
        setError('Please enter a custom language name.');
        setIsLoading(false);
        return;
      }

      const snippetData: CreateSnippetRequest = {
        title: data.title,
        language: finalLanguage,
        description: data.description || undefined,
        code: data.code,
        is_public: data.is_public,
        tags: tags,
      };

      await snippetApi.createSnippet(snippetData);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Create snippet error:', error);
      
      let errorMessage = 'Failed to create snippet. Please try again.';
      
      if (error.response) {
        if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.status === 422) {
          errorMessage = 'Invalid data. Please check your input.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        errorMessage = 'Network error. Please check your connection.';
      } else {
        errorMessage = error.message || 'Failed to create snippet. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'csharp', 'php', 'ruby',
    'go', 'rust', 'swift', 'kotlin', 'html', 'css', 'sql', 'bash', 'json', 'xml',
    'yaml', 'markdown', 'dockerfile', 'shell', 'powershell', 'other'
  ];

  const description = form.watch('description') || '';
  const charactersLeft = 500 - description.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Snippet</h1>
          <p className="text-gray-600">Share your code with the community</p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-semibold text-gray-900">Snippet Details</CardTitle>
            <CardDescription className="text-gray-600">
              Fill in the details below to create your code snippet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter snippet title"
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Language */}
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Language *</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleLanguageChange(e.target.value);
                          }}
                          className="h-12 w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 bg-white"
                          disabled={isLoading}
                        >
                          <option value="">Select a language</option>
                          {languages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang === 'other' ? 'Other' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Language Input */}
                {showCustomLanguage && (
                  <FormField
                    control={form.control}
                    name="customLanguage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Custom Language *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter the name of your programming language"
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Description</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <textarea
                            placeholder="Describe what this snippet does (optional)"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 min-h-[80px] resize-none overflow-hidden"
                            style={{ resize: 'none' }}
                            {...field}
                            disabled={isLoading}
                            maxLength={500}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = Math.min(target.scrollHeight, 300) + 'px';
                            }}
                          />
                          <div className="absolute bottom-2 left-2 text-xs text-gray-400">
                            {charactersLeft} chars left
                          </div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-4 h-4 bg-gray-200 rounded-sm cursor-ns-resize flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Code */}
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Code *</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <textarea
                            placeholder="Paste your code here..."
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200 font-mono text-sm min-h-[200px] resize-none overflow-hidden"
                            style={{ resize: 'none' }}
                            {...field}
                            disabled={isLoading}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                              target.style.height = Math.min(target.scrollHeight, 600) + 'px';
                            }}
                          />
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-4 h-4 bg-gray-200 rounded-sm cursor-ns-resize flex items-center justify-center">
                              <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">Tags</FormLabel>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <FormControl>
                        <Input
                          placeholder="Type a tag and press Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={handleAddTag}
                          className="flex-1 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowTagManager(true)}
                        className="h-12 border-gray-200 text-gray-700 hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Browse Tags
                      </Button>
                    </div>
                    
                    {/* Display Tags */}
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            <span>{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none"
                              disabled={isLoading}
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </FormItem>

                {/* Visibility */}
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-gray-700 font-medium">
                          Make this snippet public
                        </FormLabel>
                        <p className="text-sm text-gray-500">
                          Public snippets can be viewed by anyone without authentication
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Error Message */}
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-4 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/dashboard')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-2 rounded-lg transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </div>
                    ) : (
                      'Create Snippet'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      {/* Tag Manager Modal */}
      <TagManager
        isOpen={showTagManager}
        onClose={() => setShowTagManager(false)}
        onTagSelect={handleTagSelect}
        mode="select"
      />
    </div>
  );
};

export default CreateSnippet; 