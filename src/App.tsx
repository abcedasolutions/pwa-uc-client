import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ToastProvider, useToast } from "./components/common/Toast";
import { setupServiceWorker } from "./pwa/registerSW";
import { AppShell } from "./components/layout/AppShell";
import { LoginPage } from "./pages/LoginPage";
import { RegisterBusinessPage } from "./pages/RegisterBusinessPage";
import { ProductListPage } from "./pages/ProductListPage";
import { MaestroProductosPage } from "./pages/MaestroProductosPage";
import { InventoryManagementPage } from "./pages/InventoryManagementPage";
import { TomaInventarioPage } from "./pages/TomaInventarioPage";
import { ReportesPage } from "./pages/ReportesPage";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { startSyncTriggers, stopSyncTriggers } from "./db/syncEngine";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-svh items-center justify-center text-slate-400">Cargando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <div className="flex min-h-svh items-center justify-center text-slate-400">Cargando…</div>;
  }
  if (user) return <Navigate to="/productos" replace />;
  return <>{children}</>;
}

function SyncBootstrap() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user) return;
    startSyncTriggers();
    return () => stopSyncTriggers();
  }, [user]);
  return null;
}

function PwaUpdater() {
  const showToast = useToast();
  useEffect(() => {
    setupServiceWorker({
      onNeedRefresh: () => showToast("Nueva versión disponible. Recarga la app para actualizar."),
      onOfflineReady: () => showToast("Lista para usarse sin conexión."),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/register"
        element={
          <RedirectIfAuthed>
            <RegisterBusinessPage />
          </RedirectIfAuthed>
        }
      />
      <Route
        path="/productos"
        element={
          <RequireAuth>
            <AppShell>
              <ProductListPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/maestro-productos"
        element={
          <RequireAuth>
            <AppShell>
              <MaestroProductosPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/inventarios"
        element={
          <RequireAuth>
            <AppShell>
              <InventoryManagementPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/toma-inventario"
        element={
          <RequireAuth>
            <AppShell>
              <TomaInventarioPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route
        path="/reportes"
        element={
          <RequireAuth>
            <AppShell>
              <ReportesPage />
            </AppShell>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/productos" replace />} />
      <Route path="*" element={<Navigate to="/productos" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <PwaUpdater />
          <BrowserRouter>
            <SyncBootstrap />
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
