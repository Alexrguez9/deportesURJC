import "./UserDetail.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import BackButton from "../../../../components/backButton/BackButton";
import Spinner from "../../../../components/spinner/Spinner";

const UserDetail = () => {
    const { id } = useParams(); // Obtain the user ID from the URL
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
            <div className="top-buttons-content">
                <BackButton />
            </div>
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
                    <strong>Alta GYM:</strong> <span>{user?.registration?.gym?.isActive ? "Sí" : "No"}</span>
                </div>
                {user.registration?.gym?.isActive && (
                <>
                    <div>
                    <strong>Inicio GYM:</strong> <span>{user?.registration?.gym?.initDate}</span>
                    </div>
                    <div>
                    <strong>Fin GYM:</strong> <span>{user?.registration?.gym?.endDate}</span>
                    </div>
                </>
                )}
                <div>
                    <strong>Alta Atletismo:</strong> <span>{user?.registration?.athletics?.isActive ? "Sí" : "No"}</span>
                </div>
                {user.registration?.athletics?.isActive && (
                <>
                    <div>
                    <strong>Inicio Atletismo:</strong> <span>{user?.registration?.athletics?.initDate}</span>
                    </div>
                    <div>
                    <strong>Fin Atletismo:</strong> <span>{user?.registration?.athletics?.endDate}</span>
                    </div>
                </>
                )}
                <div>
                    <strong>Suscripción GYM:</strong> <span>{user?.subscription?.gym?.isActive ? "Sí" : "No"}</span>
                </div>
                {user.subscription?.gym?.isActive && (
                <>
                    <div>
                    <strong>Inicio GYM:</strong> <span>{user?.subscription?.gym?.initDate}</span>
                    </div>
                    <div>
                    <strong>Fin GYM:</strong> <span>{user?.subscription?.gym?.endDate}</span>
                    </div>
                </>
                )}
                <div>
                    <strong>Suscripción Atletismo:</strong> <span>{user?.subscription?.athletics?.isActive ? "Sí" : "No"}</span>
                </div>
                {user.subscription?.athletics?.isActive && (
                <>
                    <div>
                    <strong>Inicio Atletismo:</strong> <span>{user?.subscription?.athletics?.initDate}</span>
                    </div>
                    <div>
                    <strong>Fin Atletismo:</strong> <span>{user?.subscription?.athletics?.endDate}</span>
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
