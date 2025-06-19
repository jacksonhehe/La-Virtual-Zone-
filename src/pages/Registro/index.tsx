export default function Registro() {
  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Registro</h1>
      <form className="space-y-3 glass p-4 rounded">
        <label htmlFor="reg-username" className="block space-y-1">
          <span className="text-sm">Nombre de usuario</span>
          <input
            id="reg-username"
            type="text"
            placeholder="Nombre de usuario"
            className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
          />
        </label>
        <label htmlFor="reg-email" className="block space-y-1">
          <span className="text-sm">Correo electrónico</span>
          <input
            id="reg-email"
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
          />
        </label>
        <label htmlFor="reg-password" className="block space-y-1">
          <span className="text-sm">Contraseña</span>
          <input
            id="reg-password"
            type="password"
            placeholder="Contraseña"
            className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
          />
        </label>
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
