import { Link } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";

export function LoginPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <i className="fa fa-archive text-xl" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Iniciar sesión</h1>
          <p className="text-sm text-slate-500">Accede al inventario de tu negocio.</p>
        </div>
        <LoginForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          ¿No tienes un negocio registrado?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Crear negocio
          </Link>
        </p>
      </div>
    </div>
  );
}
