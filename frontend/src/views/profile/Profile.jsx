import "./Profile.css";
import { Outlet } from "react-router-dom";

const Profile = () => {

    return (
        <>
            <div className="content">
                <Outlet />
            </div>
        </>
    );
};

export default Profile;
