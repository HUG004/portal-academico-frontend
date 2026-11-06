import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

import '../../styles/layout.css';

export default function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <main className="contenido-principal">
        <Outlet />
      </main>
    </div>
  );
}