import  { create } from 'zustand';
import { Comment } from '../types';

interface CommentStore {
  comments: Comment[];
  approveComment: (id: string) => void;
  hideComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export const useCommentStore = create<CommentStore>((set) => ({
  comments: [],
  approveComment: (id) => set((state) => ({
    comments: state.comments.map(c => 
      c.id === id ? { ...c, reported: false } : c
    )
  })),
  hideComment: (id) => set((state) => ({
    comments: state.comments.map(c => 
      c.id === id ? { ...c, hidden: true } : c
    )
  })),
  deleteComment: (id) => set((state) => ({
    comments: state.comments.filter(c => c.id !== id)
  })),
}));
 