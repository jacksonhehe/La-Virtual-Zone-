import { create } from 'zustand';
import { supabase } from '../supabaseClient';
import type { Comment } from '../types';

interface CommentState {
  comments: Comment[];
  loading: boolean;
  fetchComments: () => Promise<void>;
  addComment: (comment: Comment) => Promise<void>;
  reportComment: (id: string) => Promise<void>;
  approveComment: (id: string) => Promise<void>;
  hideComment: (id: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
}


export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  loading: false,

  fetchComments: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data) {
      set({ comments: data as Comment[] });
    }
    set({ loading: false });
  },

  addComment: async (comment) => {
    await supabase.from('comments').insert(comment);
  },

  reportComment: async (id) => {
    await supabase.from('comments').update({ reported: true }).eq('id', id);
  },

  approveComment: async (id) => {
    await supabase
      .from('comments')
      .update({ reported: false, hidden: false })
      .eq('id', id);
  },

  hideComment: async (id) => {
    await supabase
      .from('comments')
      .update({ hidden: true, reported: false })
      .eq('id', id);
  },

  deleteComment: async (id) => {
    await supabase.from('comments').delete().eq('id', id);
  },
}));

const init = () => {
  useCommentStore.getState().fetchComments();
  supabase
    .channel('public:comments')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'comments' },
      () => useCommentStore.getState().fetchComments()
    )
    .subscribe();
};

init();
