export interface Snippet {
  id: number;
  title: string;
  code: string;
  language: string;
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  user_id: number;
  tags: Tag[];
}

export interface Tag {
  id: number;
  name: string;
  created_at: string;
}

export interface CreateSnippetRequest {
  title: string;
  code: string;
  language: string;
  description?: string;
  is_public: boolean;
  tags?: string[];
}

export interface UpdateSnippetRequest {
  title?: string;
  code?: string;
  language?: string;
  description?: string;
  is_public?: boolean;
  tags?: string[];
} 