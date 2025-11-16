/**
 * Script para migrar posts del blog desde localStorage a Supabase
 * Ejecutar este script después de crear la tabla blog_posts en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { posts as seedPosts } from '../src/data/posts';
import type { BlogPost } from '../src/types';

// Configuración de Supabase (ajustar según tu configuración)
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas');
  console.log('Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY configuradas');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función para obtener posts de localStorage (simula la lógica del postService)
const getLocalStoragePosts = (): BlogPost[] => {
  try {
    // Simula las claves que usa el postService
    const KEY = 'virtual_zone_posts';

    // En un entorno Node.js, localStorage no existe, así que usaremos un archivo JSON
    // o datos de ejemplo para simular
    console.log('ℹ️ Simulando obtención de posts desde localStorage...');

    // Para este script, usaremos los seedPosts como ejemplo
    // En producción, deberías leer de un archivo JSON exportado o de una base de datos
    return seedPosts;
  } catch (error) {
    console.error('❌ Error obteniendo posts de localStorage:', error);
    return [];
  }
};

// Función para migrar posts a Supabase
const migratePostsToSupabase = async () => {
  console.log('🚀 Iniciando migración de posts a Supabase...');

  try {
    // 1. Obtener posts existentes
    const postsToMigrate = getLocalStoragePosts();
    console.log(`📋 Encontrados ${postsToMigrate.length} posts para migrar`);

    if (postsToMigrate.length === 0) {
      console.log('⚠️ No hay posts para migrar. Usando datos de ejemplo...');
      // Usar seedPosts si no hay datos locales
    }

    // 2. Verificar si ya existen posts en Supabase
    const { data: existingPosts, error: checkError } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('❌ Error verificando posts existentes:', checkError);
      return;
    }

    if (existingPosts && existingPosts.length > 0) {
      console.log('⚠️ Ya existen posts en Supabase. Omitiendo migración para evitar duplicados.');
      console.log('💡 Si deseas forzar la migración, elimina primero los posts existentes.');
      return;
    }

    // 3. Preparar datos para inserción
    const postsForInsert = postsToMigrate.map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      image: post.image || undefined,
      date: post.date,
      author: post.author,
      category: post.category,
      tags: post.tags || []
    }));

    // 4. Insertar posts en Supabase
    console.log('📤 Insertando posts en Supabase...');
    const { data: insertedPosts, error: insertError } = await supabase
      .from('blog_posts')
      .insert(postsForInsert)
      .select();

    if (insertError) {
      console.error('❌ Error insertando posts:', insertError);
      return;
    }

    console.log(`✅ Migración completada exitosamente!`);
    console.log(`📊 Posts migrados: ${insertedPosts?.length || 0}`);

    // 5. Mostrar resumen
    console.log('\n📈 Resumen de migración:');
    insertedPosts?.forEach((post, index) => {
      console.log(`${index + 1}. ${post.title} (${post.category})`);
    });

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
};

// Función para limpiar posts de Supabase (útil para testing)
const clearSupabasePosts = async () => {
  console.log('🧹 Limpiando posts de Supabase...');

  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .neq('id', ''); // Eliminar todos

    if (error) {
      console.error('❌ Error limpiando posts:', error);
      return;
    }

    console.log('✅ Posts eliminados de Supabase');
  } catch (error) {
    console.error('❌ Error:', error);
  }
};

// Ejecutar migración
const runMigration = async () => {
  const args = process.argv.slice(2);

  if (args.includes('--clear')) {
    await clearSupabasePosts();
  } else {
    await migratePostsToSupabase();
  }
};

// Ejecutar si se llama directamente
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Script completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Error fatal:', error);
      process.exit(1);
    });
}

export { migratePostsToSupabase, clearSupabasePosts };
