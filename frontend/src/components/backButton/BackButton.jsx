import React from "react";
import { useNavigate } from "react-router-dom";
import "./BackButton.css";

const BackButton = () => {
    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    return (
        <button className="back-button" onClick={handleBack}>
            ⭠ Volver
        </button>
    );
};

export default BackButton;
