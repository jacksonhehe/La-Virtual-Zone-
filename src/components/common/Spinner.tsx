const Spinner = () => (
  <div className="flex items-center justify-center p-8" role="status">
    <div className="loader" />
    <span className="sr-only">Cargando...</span>
  </div>
);

export default Spinner;
