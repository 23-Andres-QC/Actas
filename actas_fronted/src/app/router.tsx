import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './layout';
import { ProtectedRoute } from '../shared/auth/protected-route';
import { LandingPage } from '../features/landing/landing-page';
import { LoginPage } from '../features/auth/login-page';
import { ActasDashboardPage } from '../features/actas/pages/actas-dashboard-page';
import { ActaDetallePage } from '../features/actas/pages/acta-detalle-page';
import { CrearActaPage } from '../features/actas/pages/crear-acta-page';
import { UsuariosPage } from '../features/usuarios/pages/usuarios-page';
import { AreasPage } from '../features/areas/pages/areas-page';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <ActasDashboardPage /> },
          { path: 'actas/nueva', element: <CrearActaPage /> },
          { path: 'actas/:id', element: <ActaDetallePage /> },
          {
            element: <ProtectedRoute roles={['superadmin', 'admin']} />,
            children: [{ path: 'usuarios', element: <UsuariosPage /> }],
          },
          {
            element: <ProtectedRoute roles={['superadmin']} />,
            children: [{ path: 'areas', element: <AreasPage /> }],
          },
        ],
      },
    ],
  },
]);
