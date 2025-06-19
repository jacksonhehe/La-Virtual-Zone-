export default function Registro() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Registro</h1>
      <form className="space-y-3 bg-zinc-800 p-4 rounded">
        <input
          type="text"
          placeholder="Nombre de usuario"
          className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
        />
        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-black font-bold py-2 rounded"
        >
          Registrarme
        </button>
      </form>
    </div>
  )
}
