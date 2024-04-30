import Header from '../../components/header/Header.jsx';
import Footer from '../../components/footer/Footer.jsx';
import { Outlet } from 'react-router-dom';

const Layout = () => {
    return (
        <div className='layout'>
            <Header />
            <Outlet />
            <Footer />
        </div>
    );
}
export default Layout;