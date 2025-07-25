import { createBrowserRouter } from 'react-router-dom';
import Ligas_internas from '../views/ligas_internas/LigasInternas';
import Layout from '../views/layout/Layout';
import Profile from '../views/profile/Profile';
import NotFound from '../views/notFound/NotFound';
import Home from '../views/home/Home';
import Rankings from '../views/ligas_internas/rankings/Rankings';
import Results from '../views/ligas_internas/results/Results';
import InternLeaguesContent from '../components/internLeaguesContent/InternLeaguesContent';
import FitnessRooms from '../views/fitnessRooms/FitnessRooms';
import FitnessRoomsContent from '../components/fitnessRoomsContent/FitnessRoomsContent';
import Registration from '../views/fitnessRooms/registration/Registration';
import FitnessRoomsReservations from '../views/fitnessRooms/fitnessRoomsReservations/FitnessRoomsReservations';
import Facilities from '../views/facilities/Facilities';
import MyReservations from '../views/profile/myReservations/MyReservations';
import MySubscriptions from '../views/profile/mySubscriptions/MySubscriptions';
import SeeProfile from '../views/profile/seeProfile/SeeProfile';
import ContentProfile from '../components/contentProfile/ContentProfile';
import Login from '../views/profile/login/Login';
import PaymentSubscription from '../views/fitnessRooms/paymentSubscription/PaymentSubscription';
import WalletReload from '../views/walletReload/WalletReload';
import AdminPanel from '../views/admin/cover/AdminPanel';
import AdminTeams from '../views/admin/cover/teams/AdminTeams';
import AdminUsers from '../views/admin/cover/users/AdminUsers';
import AdminReservations from '../views/admin/cover/reservation/AdminReservations';
import AdminFacilities from '../views/admin/cover/facilities/AdminFacilities';
import ContentAdminPanel from '../components/contentAdminPanel/ContentAdminPanel';
import UserDetail from '../views/admin/cover/users/UserDetail';

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
                    { path: '', element: <InternLeaguesContent /> },
                    { path: 'encuentros', element: <Results /> },
                    { path: 'clasificaciones', element: <Rankings /> },
                ]
            },
            { 
                path: 'salas-preparacion', 
                element: <FitnessRooms />,
                children: [
                    { path: '', element: <FitnessRoomsContent /> },
                    { path: 'alta', element: <Registration /> },
                    { path: 'reservas-preparacion', element: <FitnessRoomsReservations /> },
                    { path: 'pago-abono', element: <PaymentSubscription /> },
                ]
            },
            { 
                path: 'instalaciones', 
                element: <Facilities />,
            },
            { 
                path: 'profile',
                element: <Profile />,
                children: [
                    { path: '', element: <ContentProfile /> },
                    { path: 'mis-reservas', element: <MyReservations /> },
                    { path: 'mis-abonos', element: <MySubscriptions /> },
                    { path: 'consultar-perfil', element: <SeeProfile /> },
                    { path: 'login', element: <Login /> },
                ]
            },
            { 
                path: 'monedero', 
                element: <WalletReload />,
            },
            { 
                path: 'admin-panel', 
                element: <AdminPanel />,
                children: [
                    { path: '', element: <ContentAdminPanel /> },
                    { path: 'admin-equipos', element: <AdminTeams /> },
                    { path: 'admin-usuarios', element: <AdminUsers />},
                    { path: 'admin-reservas', element: <AdminReservations />},
                    { path: 'admin-instalaciones', element: <AdminFacilities />},
                ]
            },
            { path: 'admin-panel/admin-usuarios/:id', element: <UserDetail /> },
        ]
    },
]);
