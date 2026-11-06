
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './routes/PrivateRoute';
import MainLayout from './components/layout/MainLayout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Calificaciones from './pages/Calificaciones';
import Kardex from './pages/Kardex';
import Horarios from './pages/Horarios';
import Profesores from './pages/Profesores';

// Administración
import { AdminAuthProvider } from './context/AdminAuthContext';
import AdminPrivateRoute from './routes/AdminPrivateRoute';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLayout from './components/layout/AdminLayout';
import AdminProfesores from './pages/admin/AdminProfesores';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminAuthProvider>
          <Routes>

            {/* LOGIN DE ESTUDIANTES */}
            <Route
              path="/login"
              element={<Login />}
            />

            {/* RUTAS PROTEGIDAS DE ESTUDIANTES */}
            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>

                <Route
                  path="/dashboard"
                  element={<Dashboard />}
                />

                <Route
                  path="/calificaciones"
                  element={<Calificaciones />}
                />

                <Route
                  path="/kardex"
                  element={<Kardex />}
                />

                <Route
                  path="/horario"
                  element={<Horarios />}
                />

                <Route
                  path="/profesores"
                  element={<Profesores />}
                />

              </Route>
            </Route>

            {/* LOGIN DE ADMINISTRADOR */}
            <Route path="/admin/login" element={<AdminLogin />} />

           <Route element={<AdminPrivateRoute />}>
              <Route element={<AdminLayout />}>
                <Route
                  path="/admin/dashboard"
                  element={<AdminDashboard />}
                />

                <Route
                  path="/admin/profesores"
                  element={<AdminProfesores />}
                />
              </Route>
            </Route>

          </Routes>
        </AdminAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
