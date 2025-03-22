import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { toast } from 'sonner';
import { getMonthlyDateRange } from "../../../utils/dates";
import { useAuth } from "../../../context/AuthContext";
import "./AdminModalUsers.css";

const AdminModalUsers = ({ closeModal, popupData, isNewUser }) => {
    const { addUser, updateUser } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const initialValues = {
        name: popupData?.name || "",
        email: popupData?.email || "",
        password: "",
        role: popupData?.role || "user",
        balance: popupData?.balance || 0,
        gimnasio: popupData?.alta?.gimnasio?.estado || false,
        atletismo: popupData?.alta?.atletismo?.estado || false,
    };

    const onSubmit = async (data) => {
        const { startDate, endDate } = await getMonthlyDateRange(data);
        const formattedData = {
            ...data,
            alta: {
                gimnasio: {
                    estado: data.gimnasio,
                    fechaInicio: data.gimnasio ? startDate : null,
                    fechaFin: data.gimnasio ? endDate : null
                },
                atletismo: {
                    estado: data.atletismo,
                    fechaInicio: data.atletismo ? startDate : null,
                    fechaFin: data.atletismo ? endDate : null
                },
            },
        };
        // Delete props not in alta object
        delete formattedData.gimnasio;
        delete formattedData.atletismo;

        try {
            if (isNewUser) {
                const res = await addUser(formattedData);
                if (res.status === 409) {
                    toast.error('El correo ya está registrado. Por favor, usa uno diferente.');
                    return;
                }
                if (res.ok === false) {
                    toast.error("Ocurrió un error al añadir el usuario.");
                    return;
                }
                toast.success("Usuario añadido correctamente");
                closeModal();
            } else {
                const res = await updateUser(popupData._id, formattedData);
                if (res.status !== 200) {
                    toast.error("Ocurrió un error al editar el usuario.");
                    return;
                }
                toast.success("Usuario editado correctamente");
                closeModal();
            }
        } catch (error) {
            toast.error("Ocurrió un error al procesar la solicitud.");
            console.error("Error en onSubmit:", error);
        }
    };

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
            {isNewUser ? <h2>Añadir usuario</h2> : <h2>Editar usuario</h2>}
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="inputs">
                    <div className="input-container">
                        <label>
                            Nombre:
                            <input
                                type="text"
                                {...register("name", { required: "Por favor, introduce el nombre" })}
                                defaultValue={initialValues.name}
                            />
                            {errors.name && <span className="error-message">{errors.name.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Email:
                            <input
                                type="email"
                                {...register("email", { required: "Por favor, introduce el email" })}
                                defaultValue={initialValues.email}
                            />
                            {errors.email && <span className="error-message">{errors.email.message}</span>}
                        </label>
                    </div>
                    {isNewUser && (
                        <div className="input-container">
                            <label>
                                Contraseña:
                                <input
                                    type="password"
                                    {...register("password", {
                                        required: "Por favor, introduce una contraseña",
                                        minLength: {
                                            value: 6,
                                            message: "La contraseña debe tener al menos 6 caracteres",
                                        },
                                    })}
                                    defaultValue={initialValues.password}
                                />
                                {errors.password && (
                                    <span className="error-message">{errors.password.message}</span>
                                )}
                            </label>
                        </div>
                    )}
                    <div className="input-container">
                        <label>
                            Rol:&nbsp;
                            <select
                                {...register("role", { required: "Por favor, selecciona un rol" })}
                                defaultValue={initialValues.role}
                            >
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                            {errors.role && <span className="error-message">{errors.role.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Saldo:
                            <input
                                type="number"
                                {...register("balance", {
                                    required: "Por favor, introduce el saldo",
                                    min: { value: 0, message: "El saldo no puede ser negativo" },
                                })}
                                defaultValue={initialValues.balance}
                            />
                            {errors.balance && <span className="error-message">{errors.balance.message}</span>}
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Gimnasio:
                            <input
                                type="checkbox"
                                {...register("gimnasio")}
                                defaultChecked={initialValues.gimnasio}
                            />
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Atletismo:
                            <input
                                type="checkbox"
                                {...register("atletismo")}
                                defaultChecked={initialValues.atletismo}
                            />
                        </label>
                    </div>
                </div>
                <div>
                    <button type="submit" className="button-light">Guardar cambios</button>
                </div>
            </form>
        </div>
    );
};

AdminModalUsers.propTypes = {
    closeModal: PropTypes.func.isRequired,
    popupData: PropTypes.shape({
        name: PropTypes.string,
        email: PropTypes.string,
        role: PropTypes.string,
        balance: PropTypes.number,
        alta: PropTypes.shape({
            gimnasio: PropTypes.shape({
                estado: PropTypes.bool,
            }),
            atletismo: PropTypes.shape({
                estado: PropTypes.bool,
            }),
        }),
    }),
    isNewUser: PropTypes.bool.isRequired,
};

export default AdminModalUsers;
