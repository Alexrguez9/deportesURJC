import React from "react";
import { Outlet } from "react-router-dom";

const SalasPreparacion = () => {
    return (
        <div id="salas-preparacion-content">
            <Outlet />
        </div>
    );
}

export default SalasPreparacion;
