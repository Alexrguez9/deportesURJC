import { createBrowserRouter } from 'react-router-dom';
import Ligas_internas from '../views/ligas_internas/LigasInternas';
import Layout from '../views/layout/Layout';
import Profile from '../views/profile/Profile';
import NotFound from '../views/notFound/NotFound';
import Home from '../views/home/Home';
import Clasificaciones from '../views/ligas_internas/clasificaciones/Clasificaciones';
import Encuentros from '../views/ligas_internas/encuentros/Encuentros';
import ContentLigasInternas from '../components/contentLigasInternas/ContentLigasInternas';

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
            { path: 'login', element: <Profile />},
        ]
    },
]);
