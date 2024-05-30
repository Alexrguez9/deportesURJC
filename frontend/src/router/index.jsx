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
import ConsultarPerfil from '../views/profile/consultarPerfil/ConsultarPerfil';
import ContentProfile from '../components/ContentProfile/ContentProfile';
import Login from '../views/profile/login/Login';

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
                ]
            },
            { 
                path: 'instalaciones', 
                element: <Instalaciones />,
            },
            { path: 'profile',
            element: <Profile />,
            children: [
                { path: '', element: <ContentProfile /> },
                { path: 'mis-reservas', element: <MisReservas /> },
                { path: 'consultar-perfil', element: <ConsultarPerfil /> },
                { path: 'login', element: <Login /> },
            ]
        },
        ]
    },
]);
