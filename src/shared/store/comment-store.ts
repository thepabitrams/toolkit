import { create } from 'zustand';

export interface Comment {
  id: string;
  toolId: string;
  parentId: string | null;
  author: string;
  avatar: string;
  content: string;
  createdAt: number;
  language: string;
}

interface CommentStore {
  comments: Comment[];
  addComment: (toolId: string, content: string, parentId?: string | null) => void;
  getCommentsByTool: (toolId: string) => Comment[];
}

export const useCommentStore = create<CommentStore>((set, get) => ({
  // Mock initial data for Precision Crop
  comments: [
    {
      id: 'c1',
      toolId: 'precision-crop',
      parentId: null,
      author: 'John Doe',
      avatar: 'JD',
      content: 'This tool is incredibly fast. Love that it doesn\'t upload to a server!',
      createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      language: 'en',
    },
    {
      id: 'c1-1',
      toolId: 'precision-crop',
      parentId: 'c1',
      author: 'Pabitra',
      avatar: 'PM',
      content: 'Thanks John! Everything is 100% local.',
      createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
      language: 'en',
    }
  ],

  addComment: (toolId, content, parentId = null) => {
    const state = get();
    
    // 🚨 THE FIFO LOGIC (Only for Root Comments)
    if (parentId === null) {
      const rootComments = state.comments
        .filter(c => c.toolId === toolId && c.parentId === null)
        .sort((a, b) => a.createdAt - b.createdAt); // Oldest first

      // If we already have 15 root comments, delete the oldest one and its replies
      if (rootComments.length >= 15) {
        const oldestRoot = rootComments[0];
        
        // Find all children of the oldest root to cascade delete
        const childrenIds = state.comments
          .filter(c => c.parentId === oldestRoot.id)
          .map(c => c.id);

        const remainingComments = state.comments.filter(c => 
          c.id !== oldestRoot.id && !childrenIds.includes(c.id)
        );

        set({ comments: remainingComments });
      }
    }

    // Add the new comment
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      toolId,
      parentId,
      author: 'Guest User', // Mock Auth
      avatar: 'GU',
      content,
      createdAt: Date.now(),
      language: 'en',
    };

    set((state) => ({ comments: [...state.comments, newComment] }));
  },

  getCommentsByTool: (toolId) => {
    return get().comments.filter(c => c.toolId === toolId);
  }
}));