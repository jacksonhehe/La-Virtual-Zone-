import React from 'react';
import { sanitizeForInnerHTML, containsDangerousContent } from '../../utils/sanitization';

interface SafeHtmlContentProps {
  content: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  fallback?: React.ReactNode;
  allowHtml?: boolean;
}

export const SafeHtmlContent: React.FC<SafeHtmlContentProps> = ({
  content,
  className = '',
  tag: Tag = 'div',
  fallback = null,
  allowHtml = true,
}) => {
  // Verificar si el contenido contiene código peligroso
  if (containsDangerousContent(content)) {
    console.warn('Contenido peligroso detectado y bloqueado:', content);
    return fallback ? <>{fallback}</> : null;
  }

  // Si no se permite HTML, mostrar como texto plano
  if (!allowHtml) {
    return (
      <Tag className={className}>
        {content}
      </Tag>
    );
  }

  // Sanitizar el contenido HTML
  const sanitizedContent = sanitizeForInnerHTML(content);

  // Si el contenido se vació después de la sanitización, mostrar fallback
  if (!sanitizedContent.trim()) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <Tag 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Componente específico para contenido de blog
export const SafeBlogContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <SafeHtmlContent
      content={content}
      className="prose prose-invert max-w-none"
      tag="div"
      fallback={
        <div className="text-gray-400 italic">
          Contenido no disponible o bloqueado por seguridad.
        </div>
      }
    />
  );
};

// Componente para comentarios
export const SafeCommentContent: React.FC<{ content: string }> = ({ content }) => {
  return (
    <SafeHtmlContent
      content={content}
      className="text-sm"
      tag="span"
      allowHtml={false} // Los comentarios no deben permitir HTML
    />
  );
};

// Componente para títulos
export const SafeTitle: React.FC<{ title: string; level?: 1 | 2 | 3 | 4 | 5 | 6 }> = ({ 
  title, 
  level = 1 
}) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <SafeHtmlContent
      content={title}
      tag={Tag}
      allowHtml={false} // Los títulos no deben permitir HTML
    />
  );
};

// Componente para descripciones
export const SafeDescription: React.FC<{ description: string }> = ({ description }) => {
  return (
    <SafeHtmlContent
      content={description}
      className="text-gray-300"
      tag="p"
      allowHtml={false} // Las descripciones no deben permitir HTML
    />
  );
}; 