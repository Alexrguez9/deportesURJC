import { Outlet } from "react-router-dom";

const LigasInternas = () => {
    return (
        <div id="ligas-internas-content" className="content">
            <Outlet />
        </div>
    );
}

export default LigasInternas;
