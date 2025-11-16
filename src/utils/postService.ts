import { BlogPost } from '../types';
import { posts as seedPosts } from '../data/posts';
import { useDataStore } from '../store/dataStore';
import { getSupabaseClient } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type BlogPostRow = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

const generateUniqueSlug = async (supabase: ReturnType<typeof getSupabaseClient>, title: string): Promise<string> => {
  const baseSlug = slugify(title);

  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('slug')
      .ilike('slug', `${baseSlug}%`);

    if (error) {
      console.warn('PostService: Could not verify slug uniqueness, fallback to timestamp suffix', error);
      return `${baseSlug}-${Date.now()}`;
    }

    const existingSlugs = (data || []).map(row => row.slug);
    if (!existingSlugs.includes(baseSlug)) {
      return baseSlug;
    }

    let counter = 2;
    let candidate = `${baseSlug}-${counter}`;
    while (existingSlugs.includes(candidate)) {
      counter += 1;
      candidate = `${baseSlug}-${counter}`;
    }
    return candidate;
  } catch (error) {
    console.error('PostService: Failed while generating unique slug, using timestamp fallback', error);
    return `${baseSlug}-${Date.now()}`;
  }
};

// Convert Supabase row to BlogPost
const rowToBlogPost = (row: BlogPostRow): BlogPost => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  image: row.image || '',
  date: row.date,
  author: row.author,
  category: row.category,
  tags: row.tags || []
});

// Convert BlogPost to Supabase insert
const blogPostToInsert = (post: Partial<BlogPost>): BlogPostInsert => ({
  id: post.id!,
  title: post.title!,
  slug: post.slug || slugify(post.title!),
  excerpt: post.excerpt!,
  content: post.content!,
  image: post.image || undefined,
  date: post.date ? new Date(post.date).toISOString() : undefined,
  author: post.author || 'Redacción',
  category: post.category || 'Noticias',
  tags: post.tags || []
});

// Convert BlogPost to Supabase update
const blogPostToUpdate = (post: Partial<BlogPost>): BlogPostUpdate => ({
  id: post.id,
  title: post.title,
  slug: post.slug,
  excerpt: post.excerpt,
  content: post.content,
  image: post.image,
  date: post.date ? new Date(post.date).toISOString() : undefined,
  author: post.author,
  category: post.category,
  tags: post.tags
});

export const createPost = async (data: { title: string; excerpt: string; content: string; image?: string; category: string; author: string; date?: string; tags?: string[] }): Promise<BlogPost> => {
  try {
    const supabase = getSupabaseClient();
    const id = `post-${Date.now()}`;
    const slug = await generateUniqueSlug(supabase, data.title);

    const postData: BlogPostInsert = {
      id,
      title: data.title.trim(),
      slug,
      excerpt: data.excerpt.trim(),
      content: data.content.trim(),
      image: data.image?.trim() || `https://images.unsplash.com/photo-1511406361295-0a1ff814c0ce`,
      date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
      author: data.author?.trim() || 'Redacción',
      category: data.category || 'Noticias',
      tags: data.tags || []
    };

    const { data: insertedPost, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single();

    if (error) {
      console.error('PostService: Error creating post:', error);
      throw new Error(`Error creating post: ${error.message}`);
    }

    if (!insertedPost) {
      throw new Error('Post was not created');
    }

    const blogPost = rowToBlogPost(insertedPost);

    // Update the Zustand store
    const { updatePosts } = useDataStore.getState();
    const currentPosts = await listPosts();
    updatePosts(currentPosts);

    return blogPost;
  } catch (error) {
    console.error('PostService: Error in createPost:', error);
    throw error;
  }
};

export const updatePost = async (updated: BlogPost): Promise<BlogPost> => {
  try {
    const supabase = getSupabaseClient();

    const updateData: BlogPostUpdate = {
      title: updated.title.trim(),
      slug: updated.slug || slugify(updated.title),
      excerpt: updated.excerpt.trim(),
      content: updated.content.trim(),
      image: updated.image?.trim() || undefined,
      date: new Date(updated.date).toISOString(),
      author: updated.author?.trim(),
      category: updated.category,
      tags: updated.tags || []
    };

    const { data: updatedPost, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', updated.id)
      .select()
      .single();

    if (error) {
      console.error('PostService: Error updating post:', error);
      throw new Error(`Error updating post: ${error.message}`);
    }

    if (!updatedPost) {
      throw new Error('Post was not updated');
    }

    const blogPost = rowToBlogPost(updatedPost);

    // Update the Zustand store
    const { updatePosts } = useDataStore.getState();
    const currentPosts = await listPosts();
    updatePosts(currentPosts);

    return blogPost;
  } catch (error) {
    console.error('PostService: Error in updatePost:', error);
    throw error;
  }
};

export const deletePost = async (id: string): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('PostService: Error deleting post:', error);
      throw new Error(`Error deleting post: ${error.message}`);
    }

    // Update the Zustand store
    const { updatePosts } = useDataStore.getState();
    const currentPosts = await listPosts();
    updatePosts(currentPosts);
  } catch (error) {
    console.error('PostService: Error in deletePost:', error);
    throw error;
  }
};

export const listPosts = async (): Promise<BlogPost[]> => {
  try {
    const supabase = getSupabaseClient();

    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('PostService: Error fetching posts:', error);
      return [];
    }

    return posts ? posts.map(rowToBlogPost) : [];
  } catch (error) {
    console.error('PostService: Error in listPosts:', error);
    return [];
  }
};

// Initialize posts with seed data (for development/migration)
export const initializePosts = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    // Check if posts already exist
    const { data: existingPosts, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('PostService: Error checking existing posts:', checkError);
      return;
    }

    if (existingPosts && existingPosts.length > 0) {
      console.log('PostService: Posts already exist, skipping initialization');
      return;
    }

    // Convert seed posts to Supabase format
    const postsToInsert = seedPosts.map(post => blogPostToInsert(post));

    const { error: insertError } = await supabase
      .from('blog_posts')
      .insert(postsToInsert);

    if (insertError) {
      console.error('PostService: Error initializing posts:', insertError);
    } else {
      console.log('PostService: Posts initialized with seed data');
    }
  } catch (error) {
    console.error('PostService: Error in initializePosts:', error);
  }
};

// Clear all posts (for development/testing)
export const clearPosts = async (): Promise<void> => {
  try {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .neq('id', ''); // Delete all posts

    if (error) {
      console.error('PostService: Error clearing posts:', error);
    } else {
      console.log('PostService: All posts cleared');
    }
  } catch (error) {
    console.error('PostService: Error in clearPosts:', error);
  }
};
