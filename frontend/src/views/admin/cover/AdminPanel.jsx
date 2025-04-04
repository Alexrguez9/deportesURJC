import "./AdminPanel.css";
import { Outlet } from "react-router-dom";

const AdminPanel = () => {
    return (
        <>
            <div id="admin-panel-content">
                <Outlet />
            </div>
        </>
    );
};

export default AdminPanel;
