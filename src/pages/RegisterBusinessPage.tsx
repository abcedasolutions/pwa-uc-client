import { Link } from "react-router-dom";
import { RegisterBusinessForm } from "../components/auth/RegisterBusinessForm";

export function RegisterBusinessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-blue-50 px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
            <i className="fa fa-archive text-xl" aria-hidden="true" />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Crear negocio</h1>
          <p className="text-sm text-slate-500">Registra tu negocio y tu cuenta de administrador.</p>
        </div>
        <RegisterBusinessForm />
        <p className="mt-4 text-center text-sm text-slate-500">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
