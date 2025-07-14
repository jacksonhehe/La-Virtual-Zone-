import { create } from 'zustand'
import { supabase } from '../lib/supabaseClient'
import { Comment } from '../types'

interface CommentState {
  comments: Comment[]
  fetchComments: () => Promise<void>
  addComment: (comment: Omit<Comment, 'id' | 'created_at'>) => Promise<void>
  approveComment: (id: string) => Promise<void>
  hideComment: (id: string) => Promise<void>
  deleteComment: (id: string) => Promise<void>
}

export const useCommentStore = create<CommentState>((set) => ({
  comments: [],
  fetchComments: async () => {
    const { data, error } = await supabase.from('comments').select('*').order('created_at')
    if (error) throw error
    set({ comments: data })
  },
  addComment: async (comment) => {
    const { data, error } = await supabase.from('comments').insert(comment).single()
    if (error) throw error
    set((state) => ({ comments: [data, ...state.comments] }))
  },
  approveComment: async (id) => {
    const { data, error } = await supabase.from('comments').update({ reported: false, hidden: false }).eq('id', id).single()
    if (error) throw error
    set((state) => ({ comments: state.comments.map(c => c.id === id ? data : c) }))
  },
  hideComment: async (id) => {
    const { data, error } = await supabase.from('comments').update({ hidden: true, reported: false }).eq('id', id).single()
    if (error) throw error
    set((state) => ({ comments: state.comments.map(c => c.id === id ? data : c) }))
  },
  deleteComment: async (id) => {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
    set((state) => ({ comments: state.comments.filter(c => c.id !== id) }))
  }
}))
