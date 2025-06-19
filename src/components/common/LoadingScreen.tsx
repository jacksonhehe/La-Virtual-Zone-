const  LoadingScreen = () => {
  return (
    <div className="flex w-full h-screen items-center justify-center flex-col space-y-6 p-2 bg-gray-900">
      <div className="loader" />
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">La Virtual Zone</h2>
        <p className="text-gray-400">Cargando experiencia gaming...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
 