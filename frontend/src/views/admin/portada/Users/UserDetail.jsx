import "./UserDetail.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import BackButton from "../../../../components/backButton/BackButton";
import Spinner from "../../../../components/spinner/Spinner";

const UserDetail = () => {
    const { id } = useParams(); // Obtener el ID del usuario desde la URL
    const { getAllUsers } = useAuth();
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const userList = await getAllUsers();
            setUsers(userList || []);
            setIsLoading(false);
        } catch (error) {
            console.error("Error al obtener la lista de usuarios:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const user = users?.find((user) => user._id === id);

    if (!user) {
        return !isLoading ? <p>Usuario no encontrado.</p> : <Spinner />;
    }

    return (
        <div className="user-detail">
            <BackButton />
            <h1>Detalles del Usuario</h1>
            <div className="user-info">
                <div>
                    <strong>ID:</strong> <span>{user?._id}</span>
                </div>
                <div>
                    <strong>Nombre:</strong> <span>{user?.name}</span>
                </div>
                <div>
                    <strong>Email:</strong> <span>{user?.email}</span>
                </div>
                <div>
                    <strong>Rol:</strong> <span>{user?.role}</span>
                </div>
                <div>
                    <strong>Alta GYM:</strong> <span>{user?.alta?.gimnasio?.estado ? "Sí" : "No"}</span>
                </div>
                {user.alta?.gimnasio?.estado && (
                <>
                    <div>
                    <strong>Inicio GYM:</strong> <span>{user?.alta?.gimnasio?.fechaInicio}</span>
                    </div>
                    <div>
                    <strong>Fin GYM:</strong> <span>{user?.alta?.gimnasio?.fechaFin}</span>
                    </div>
                </>
                )}
                <div>
                <strong>Alta Atletismo:</strong> <span>{user?.alta?.atletismo?.estado ? "Sí" : "No"}</span>
                </div>
                {user.alta?.atletismo?.estado && (
                <>
                    <div>
                    <strong>Inicio Atletismo:</strong> <span>{user?.alta?.atletismo?.fechaInicio}</span>
                    </div>
                    <div>
                    <strong>Fin Atletismo:</strong> <span>{user?.alta?.atletismo?.fechaFin}</span>
                    </div>
                </>
                )}
                <div>
                <strong>Saldo:</strong> <span>{user.balance} €</span>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
