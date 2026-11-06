import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';

export default function PrivateRoute(){
    const {autenticado, cargando} = useAuth();

    if(cargando){
        return(
            <div className="pantalla-carga">
                <div className="spinner"></div>
                <p>Verificando sesión...</p>
            </div>
        );
    }
    return autenticado ?<Outlet/> : <Navigate to="/login" replace />;
}