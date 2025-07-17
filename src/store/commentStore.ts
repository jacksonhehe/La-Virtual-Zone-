import { create } from 'zustand';
import { Comment } from '../types';
import { VZ_COMMENTS_KEY } from '../utils/storageKeys';

const loadComments = (): Comment[] => {
  const json = localStorage.getItem(VZ_COMMENTS_KEY);
  return json ? JSON.parse(json) : [];
};

const saveComments = (comments: Comment[]) => {
  localStorage.setItem(VZ_COMMENTS_KEY, JSON.stringify(comments));
};

interface CommentState {
  comments: Comment[];
  addComment: (comment: Comment) => void;
  reportComment: (id: string) => void;
  approveComment: (id: string) => void;
  hideComment: (id: string) => void;
  deleteComment: (id: string) => void;
}

export const useCommentStore = create<CommentState>(set => ({
  comments: loadComments(),
  addComment: comment =>
    set(state => {
      const updated = [comment, ...state.comments];
      saveComments(updated);
      return { comments: updated };
    }),
  reportComment: id =>
    set(state => {
      const updated = state.comments.map(c =>
        c.id === id ? { ...c, reported: true } : c
      );
      saveComments(updated);
      return { comments: updated };
    }),
  approveComment: id =>
    set(state => {
      const updated = state.comments.map(c =>
        c.id === id ? { ...c, reported: false, hidden: false } : c
      );
      saveComments(updated);
      return { comments: updated };
    }),
  hideComment: id =>
    set(state => {
      const updated = state.comments.map(c =>
        c.id === id ? { ...c, hidden: true, reported: false } : c
      );
      saveComments(updated);
      return { comments: updated };
    }),
  deleteComment: id =>
    set(state => {
      const updated = state.comments.filter(c => c.id !== id);
      saveComments(updated);
      return { comments: updated };
    }),
}));
