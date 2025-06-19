import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="max-w-sm mx-auto space-y-4">
      <h1 className="text-2xl font-bold text-center">Iniciar Sesión</h1>
      <form className="space-y-3 glass p-4 rounded">
        <label htmlFor="login-email" className="block space-y-1">
          <span className="text-sm">Correo electrónico</span>
          <input
            id="login-email"
            type="email"
            placeholder="Correo electrónico"
            className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
          />
        </label>
        <label htmlFor="login-password" className="block space-y-1">
          <span className="text-sm">Contraseña</span>
          <input
            id="login-password"
            type="password"
            placeholder="Contraseña"
            className="w-full px-3 py-2 bg-zinc-900 border border-[var(--primary)] rounded"
          />
        </label>
        <button
          type="submit"
          className="w-full bg-[var(--primary)] text-black font-bold py-2 rounded"
        >
          Entrar
        </button>
      </form>
      <p className="text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link to="/registro" className="underline text-[var(--primary)]">
          Regístrate
        </Link>
      </p>
    </div>
  )
}
