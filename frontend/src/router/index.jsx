import { createBrowserRouter } from 'react-router-dom';
import Ligas_internas from '../views/ligas_internas/LigasInternas';
import Layout from '../views/layout/Layout';
import Profile from '../views/profile/Profile';
import NotFound from '../views/notFound/NotFound';
import Home from '../views/home/Home';
import Clasificaciones from '../views/ligas_internas/clasificaciones/Clasificaciones';
import Encuentros from '../views/ligas_internas/encuentros/Encuentros';
import ContentLigasInternas from '../components/contentLigasInternas/ContentLigasInternas';
import SalasPreparacion from '../views/salasPreparacion/SalasPreparacion';
import ContentSalasPreparacion from '../components/contentSalasPreparacion/ContentSalasPreparacion';
import Alta from '../views/salasPreparacion/alta/Alta';
import ReservasPreparacion from '../views/salasPreparacion/reservasPreparacion/ReservasPreparacion';
import Instalaciones from '../views/instalaciones/Instalaciones';
import MisReservas from '../views/profile/misReservas/MisReservas';
import MisAbonos from '../views/profile/misAbonos/MisAbonos.jsx';
import ConsultarPerfil from '../views/profile/consultarPerfil/ConsultarPerfil';
import ContentProfile from '../components/ContentProfile/ContentProfile';
import Login from '../views/profile/login/Login';
import PagoAbono from '../views/salasPreparacion/pagoAbono/PagoAbono';
import RecargaMonedero from '../views/monedero/RecargaMonedero';
import AdminPanel from '../views/admin/portada/AdminPanel';
import AdminTeams from '../views/admin/portada/Teams/AdminTeams';
import AdminUsers from '../views/admin/portada/Users/AdminUsers';
import ContentAdminPanel from '../components/ContentAdminPanel/ContentAdminPanel';
import UserDetail from '../views/admin/portada/Users/UserDetail';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <NotFound />,
        children: [
            { path: '/', element: <Home /> },
            { 
                path: 'ligas-internas', 
                element: <Ligas_internas />,
                children: [
                    { path: '', element: <ContentLigasInternas /> },
                    { path: 'encuentros', element: <Encuentros /> },
                    { path: 'clasificaciones', element: <Clasificaciones /> },
                ]
            },
            { 
                path: 'salas-preparacion', 
                element: <SalasPreparacion />,
                children: [
                    { path: '', element: <ContentSalasPreparacion /> },
                    { path: 'alta', element: <Alta /> },
                    { path: 'reservas-preparacion', element: <ReservasPreparacion /> },
                    { path: 'pago-abono', element: <PagoAbono /> },
                ]
            },
            { 
                path: 'instalaciones', 
                element: <Instalaciones />,
            },
            { 
                path: 'profile',
                element: <Profile />,
                children: [
                    { path: '', element: <ContentProfile /> },
                    { path: 'mis-reservas', element: <MisReservas /> },
                    { path: 'mis-abonos', element: <MisAbonos /> },
                    { path: 'consultar-perfil', element: <ConsultarPerfil /> },
                    { path: 'login', element: <Login /> },
                ]
            },
            { 
                path: 'monedero', 
                element: <RecargaMonedero />,
            },
            { 
                path: 'admin-panel', 
                element: <AdminPanel />,
                children: [
                    { path: '', element: <ContentAdminPanel /> },
                    { path: 'admin-equipos', element: <AdminTeams /> },
                    { 
                        path: 'admin-usuarios', 
                        element: <AdminUsers />,
                    },
                ]
            },
            { path: 'admin-panel/admin-usuarios/:id', element: <UserDetail /> },
        ]
    },
]);
