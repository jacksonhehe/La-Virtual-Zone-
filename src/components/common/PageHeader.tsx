interface PageHeaderProps {
  title: string;
  subtitle?: string;
  image?: string;
  breadcrumb?: React.ReactNode;
  children?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, image, breadcrumb, children }: PageHeaderProps) => {
  return (
    <div className="relative bg-gray-900 py-16 md:py-24 overflow-hidden">
      {image && (
        <img
          src={image}
          alt="Estadio iluminado estilo eSports"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gray-900/80" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-30" />

      <div className="relative container mx-auto px-4">
        {breadcrumb}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display neon-text-blue">
          {title}
        </h1>

        {subtitle && (
          <p className="text-gray-300 mt-4 max-w-3xl">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default PageHeader;
 