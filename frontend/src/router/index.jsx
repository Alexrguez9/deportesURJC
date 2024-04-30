import { createBrowserRouter } from 'react-router-dom';
import Ligas_internas from '../views/ligas_internas/Ligas_internas';
import Layout from '../views/layout/Layout';
import Profile from '../views/profile/Profile';
import NotFound from '../views/notFound/NotFound';
import Home from '../views/home/Home';




export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        errorElement: <NotFound />,
        children: [
            { path: '/', element: <Home /> },
            { path: '/ligas-internas', element: <Ligas_internas />},
            { path: '/login', element: <Profile />},
            //{ path: '/*', element: <NotFound />}
        ]
    },
    
]);