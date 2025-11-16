interface  PageHeaderProps {
  title: string;
  subtitle?: string;
  image?: string;
}

const PageHeader = ({ title, subtitle, image }: PageHeaderProps) => {
  return (
    <div 
      className="relative bg-gray-900 py-16 md:py-24 overflow-hidden"
      style={{
        backgroundImage: image ? `linear-gradient(rgba(17, 24, 39, 0.8), rgba(17, 24, 39, 0.9)), url(${image})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-30" />
      
      <div className="relative container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-display neon-text-blue">
          {title}
        </h1>
        
        {subtitle && (
          <p className="text-gray-300 mt-4 max-w-3xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
 