const  LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-700"></div>
        <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-blue-500 animate-spin absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
 