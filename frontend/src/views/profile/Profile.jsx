import "./Profile.css";
import { Outlet } from "react-router-dom";

const Profile = () => {

    return (
        <>
            <div id="ligas-internas-content">
                <Outlet />
            </div>

        </>
    );
};

export default Profile;
