import privacyHtml from '../../docs/legal/privacy.mdx';

const Privacy = () => (
  <div
    className="prose prose-invert max-w-3xl mx-auto p-4"
    dangerouslySetInnerHTML={{ __html: privacyHtml }}
  />
);

export default Privacy;
