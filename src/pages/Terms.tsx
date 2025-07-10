import termsHtml from '../../docs/legal/terms.mdx';

const Terms = () => (
  <div
    className="prose prose-invert max-w-3xl mx-auto p-4"
    dangerouslySetInnerHTML={{ __html: termsHtml }}
  />
);

export default Terms;
