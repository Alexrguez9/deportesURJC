import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { toast } from 'sonner';
import { getMonthlyDateRange, infinityDate } from "../../../utils/dates";
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
        alta_gimnasio: popupData?.alta?.gimnasio?.estado || false,
        alta_atletismo: popupData?.alta?.atletismo?.estado || false,
        subs_gimnasio: popupData?.subscription?.gimnasio?.estado || false,
        subs_atletismo: popupData?.subscription?.atletismo?.estado || false,
    };

    const onSubmit = async (data) => {
        const { startDate, endDate } = await getMonthlyDateRange(data);
        const formattedData = {
            ...data,
            alta: {
                gimnasio: {
                    estado: data.alta_gimnasio,
                    fechaInicio: data.alta_gimnasio ? startDate : null,
                    fechaFin: data.alta_gimnasio ? infinityDate : null
                },
                atletismo: {
                    estado: data.alta_atletismo,
                    fechaInicio: data.alta_atletismo ? startDate : null,
                    fechaFin: data.alta_atletismo ? infinityDate : null
                },
            },
            subscription: {
                gimnasio: {
                    estado: data.subs_gimnasio,
                    fechaInicio: data.subs_gimnasio ? startDate : null,
                    fechaFin: data.subs_gimnasio ? endDate : null
                },
                atletismo: {
                    estado: data.subs_atletismo,
                    fechaInicio: data.subs_atletismo ? startDate : null,
                    fechaFin: data.subs_atletismo ? endDate : null
                },
            },
        };
        // Delete props not in alta object
        delete formattedData.alta_gimnasio;
        delete formattedData.alta_atletismo;
        delete formattedData.subs_gimnasio;
        delete formattedData.subs_atletismo;

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
                            Alta gimnasio:
                            <input
                                type="checkbox"
                                {...register("alta_gimnasio")}
                                defaultChecked={initialValues.alta_gimnasio}
                            />
                        </label>
                    </div>
                    <div className="input-container">
                        <label>
                            Alta atletismo:
                            <input
                                type="checkbox"
                                {...register("alta_atletismo")}
                                defaultChecked={initialValues.alta_atletismo}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Suscripción gimnasio:
                            <input
                                type="checkbox"
                                {...register("subs_gimnasio")}
                                defaultChecked={initialValues.subs_gimnasio}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Suscripción atletismo:
                            <input
                                type="checkbox"
                                {...register("subs_atletismo")}
                                defaultChecked={initialValues.subs_atletismo}
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
        subscription: PropTypes.shape({
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
