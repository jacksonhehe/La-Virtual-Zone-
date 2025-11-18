import { Comment } from '../types';
import { config } from '../lib/config';
import { getSupabaseClient, getSupabaseAdminClient } from '../lib/supabase';

const KEY = 'virtual_zone_comments';
const TABLE_NAME = 'blog_comments';

const safeSupabase = (requireAdmin = false) => {
  if (!config.useSupabase) return null;
  try {
    if (requireAdmin) {
      if (!config.supabase.serviceRoleKey) {
        console.warn('CommentService: admin operations require VITE_SUPABASE_SERVICE_ROLE_KEY');
        return null;
      }
      return getSupabaseAdminClient();
    }
    return getSupabaseClient();
  } catch (error) {
    console.warn('CommentService: Supabase unavailable', error);
    return null;
  }
};

const rowToComment = (row: any): Comment => ({
  id: row.id,
  postId: row.post_id,
  author: row.author,
  authorAvatar: row.author_avatar,
  content: row.content,
  date: row.date,
  likes: Number(row.likes ?? 0),
  replies: row.replies || [],
  likedBy: Array.isArray(row.liked_by) ? row.liked_by : []
});

const commentToRow = (comment: Comment) => ({
  id: comment.id,
  post_id: comment.postId,
  author: comment.author,
  author_avatar: comment.authorAvatar,
  content: comment.content,
  date: comment.date,
  likes: comment.likes,
  replies: comment.replies || [],
  liked_by: comment.likedBy || []
});

const loadLocalComments = (): Comment[] => {
  try {
    const json = localStorage.getItem(KEY);
    if (!json) return [];
    return JSON.parse(json) as Comment[];
  } catch (error) {
    console.error('CommentService: error parsing local comments', error);
    localStorage.removeItem(KEY);
    return [];
  }
};

const persistLocalComments = (comments: Comment[]) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(comments));
  } catch (error) {
    console.error('CommentService: error saving local comments', error);
  }
};

const sampleComments = (): Comment[] => [
  {
    id: 'sample-comment-1',
    postId: 'post1',
    author: 'pixelmanager',
    authorAvatar: 'https://ui-avatars.com/api/?name=pixelmanager&background=10b981&color=fff&size=128',
    content: 'Gran artículo, muy buen análisis. Espero ver más contenido como este.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 3,
    likedBy: []
  },
  {
    id: 'sample-comment-2',
    postId: 'post1',
    author: 'neonmanager',
    authorAvatar: 'https://ui-avatars.com/api/?name=neonmanager&background=c026d3&color=fff&size=128',
    content: 'Interesante perspectiva, aunque no estoy de acuerdo con algunos puntos. En mi opinión, la presión alta puede ser riesgosa si no se ejecuta correctamente.',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 1,
    likedBy: []
  },
  {
    id: 'sample-comment-3',
    postId: 'post2',
    author: 'tacticmaster',
    authorAvatar: 'https://ui-avatars.com/api/?name=tacticmaster&background=059669&color=fff&size=128',
    content: 'Excelente análisis táctico. La presión alta es fundamental en el fútbol moderno. ¿Podrías hacer un artículo sobre transiciones defensivas?',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 5,
    likedBy: []
  },
  {
    id: 'sample-comment-4',
    postId: 'post2',
    author: 'futbolfan',
    authorAvatar: 'https://ui-avatars.com/api/?name=futbolfan&background=dc2626&color=fff&size=128',
    content: 'Totalmente de acuerdo. En La Virtual Zone hemos visto cómo equipos con buena presión alta dominan los partidos.',
    date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    likes: 2,
    likedBy: []
  }
];

const insertCommentSupabase = async (comment: Comment): Promise<Comment | null> => {
  const supabase = safeSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert(commentToRow(comment))
    .select()
    .maybeSingle();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('CommentService: insert error', error);
    }
    return null;
  }

  return data ? rowToComment(data) : null;
};

const updateCommentSupabase = async (comment: Comment): Promise<Comment | null> => {
  const supabase = safeSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .upsert(commentToRow(comment), { onConflict: 'id', ignoreDuplicates: false, returning: 'representation' })
    .maybeSingle();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error('CommentService: update error', error);
    }
    return null;
  }

  return data ? rowToComment(data) : null;
};

const deleteCommentSupabase = async (commentId: string): Promise<void> => {
  const supabase = safeSupabase(true);
  if (!supabase) return;

  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', commentId);

  if (error) {
    console.error('CommentService: delete error', error);
  }
};

const fetchCommentsSupabase = async (): Promise<Comment[]> => {
  const supabase = safeSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('CommentService: fetch error', error);
    return [];
  }

  return (data || []).map(rowToComment);
};

const ensureLocalSeed = () => {
  const current = loadLocalComments();
  if (current.length === 0) {
    persistLocalComments(sampleComments());
  }
};

export const initializeComments = async (): Promise<void> => {
  const supabaseComments = await fetchCommentsSupabase();
  if (supabaseComments.length > 0) {
    persistLocalComments(supabaseComments);
    return;
  }
  ensureLocalSeed();
};

export const getCommentsForPost = async (postId: string): Promise<Comment[]> => {
  const all = await listAllComments();
  return all
    .filter(c => c.postId === postId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

interface AddCommentOptions {
  avatarUrl?: string;
}

export const addComment = async (
  postId: string,
  author: string,
  content: string,
  options: AddCommentOptions = {}
): Promise<Comment> => {
  const comments = await listAllComments();
  const now = new Date();
  const trimmedAuthor = author?.trim() || 'Usuario Anónimo';
  const avatarUrl = options.avatarUrl && options.avatarUrl.trim()
    ? options.avatarUrl.trim()
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedAuthor)}&background=111827&color=fff&size=128`;

  const comment: Comment = {
    id: `comment-${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    postId,
    author: trimmedAuthor,
    authorAvatar: avatarUrl,
    content: content.trim(),
    date: now.toISOString(),
    likes: 0,
    replies: [],
    likedBy: []
  };

  const supabaseResult = await insertCommentSupabase(comment);
  const savedComment = supabaseResult || comment;
  const updated = [savedComment, ...comments];
  persistLocalComments(updated);
  return savedComment;
};

export const likeComment = async (commentId: string, userId: string): Promise<Comment | null> => {
  const comments = await listAllComments();
  const index = comments.findIndex(c => c.id === commentId);
  if (index === -1) return null;

  const comment = comments[index];
  const likedBy = Array.isArray(comment.likedBy) ? comment.likedBy : [];
  if (likedBy.includes(userId)) {
    return comment;
  }

  const updatedComment: Comment = {
    ...comment,
    likes: comment.likes + 1,
    likedBy: [...likedBy, userId]
  };

  const supabaseResult = await updateCommentSupabase(updatedComment);
  const saved = supabaseResult || updatedComment;
  comments[index] = saved;
  persistLocalComments(comments);
  return saved;
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const comments = await listAllComments();
  const filtered = comments.filter(c => c.id !== commentId);
  persistLocalComments(filtered);
  await deleteCommentSupabase(commentId);
};

interface AddReplyOptions {
  avatarUrl?: string;
}

export const addReplyToComment = async (
  commentId: string,
  author: string,
  content: string,
  options: AddReplyOptions = {}
): Promise<Comment | null> => {
  const comments = await listAllComments();
  const parentIndex = comments.findIndex(c => c.id === commentId);
  if (parentIndex === -1) return null;

  const parent = comments[parentIndex];
  const now = new Date();
  const trimmedAuthor = author?.trim() || 'Usuario An��nimo';
  const avatarUrl = options.avatarUrl && options.avatarUrl.trim()
    ? options.avatarUrl.trim()
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(trimmedAuthor)}&background=111827&color=fff&size=128`;

  const reply: Comment = {
    id: `reply-${now.getTime()}-${Math.random().toString(36).slice(2, 9)}`,
    postId: parent.postId,
    author: trimmedAuthor,
    authorAvatar: avatarUrl,
    content: content.trim(),
    date: now.toISOString(),
    likes: 0,
    replies: [],
    likedBy: []
  };

  const updatedParent: Comment = {
    ...parent,
    replies: [...(parent.replies || []), reply]
  };

  const supabaseResult = await updateCommentSupabase(updatedParent);
  const savedParent = supabaseResult || updatedParent;
  comments[parentIndex] = savedParent;
  persistLocalComments(comments);
  return savedParent;
};

export const listAllComments = async (): Promise<Comment[]> => {
  const supabaseComments = await fetchCommentsSupabase();
  if (supabaseComments.length > 0) {
    persistLocalComments(supabaseComments);
    return supabaseComments;
  }
  const local = loadLocalComments();
  if (local.length === 0) {
    const seed = sampleComments();
    persistLocalComments(seed);
    return seed;
  }
  return local;
};

export const clearAllComments = async (): Promise<void> => {
  localStorage.removeItem(KEY);
  const supabase = safeSupabase(true);
  if (!supabase) return;
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .neq('id', '');
  if (error) {
    console.error('CommentService: Error clearing Supabase comments', error);
  }
};
