import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useForm } from "react-hook-form";
import { useAuth } from "../../../context/AuthContext";
import "./AdminModalUsers.css";

const AdminModalUsers = ({ closeModal, popupData, isNewUser }) => {
    const { addUser, updateUser, handleAdmin } = useAuth();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    // Valores iniciales del formulario
    const initialValues = {
        name: popupData?.name || "",
        email: popupData?.email || "",
        password: "", // Contraseña vacía por defecto
        role: popupData?.role || "user",
        saldo: popupData?.saldo || 0,
        gimnasio: popupData?.alta?.gimnasio?.estado || false,
        atletismo: popupData?.alta?.atletismo?.estado || false,
    };

    const onSubmit = async (data) => {
        setSuccessMessage("");
        setErrorMessage("");

        const formattedData = {
            ...data,
            alta: {
                gimnasio: {
                    estado: data.gimnasio,
                },
                atletismo: {
                    estado: data.atletismo,
                },
            },
        };

        try {
            if (isNewUser) {
                const updatedData = handleAdmin(data);
                const res = await addUser(updatedData);
                console.log("--- adminModalUsers res", res);
                if (res.status === 409) {
                    console.log("---res", res);
                    setErrorMessage('El correo ya está registrado. Por favor, usa uno diferente.');
                    return;
                }
                if (res.ok === false) {
                    setErrorMessage("Ocurrió un error al añadir el usuario.");
                    return;
                }
                setSuccessMessage("Usuario añadido correctamente");
            } else {
                const res = await updateUser(popupData._id, formattedData);
                if (res.status !== 200) {
                    setErrorMessage("Ocurrió un error al editar el usuario.");
                    return;
                }
                closeModal();
            }
        } catch (error) {
            setErrorMessage("Ocurrió un error al procesar la solicitud.");
            console.error("Error en onSubmit:", error);
        }
    };

    return (
        <div id="admin-modal">
            <IoMdClose id="close-menu" onClick={closeModal} style={{ color: "black" }} />
            {isNewUser ? <h2>Añadir usuario</h2> : <h2>Editar usuario</h2>}
            {!successMessage && (
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
                                    {...register("saldo", {
                                        required: "Por favor, introduce el saldo",
                                        min: { value: 0, message: "El saldo no puede ser negativo" },
                                    })}
                                    defaultValue={initialValues.saldo}
                                />
                                {errors.saldo && <span className="error-message">{errors.saldo.message}</span>}
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
            )}
            {successMessage && <p className="success-message">{successMessage}</p>}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
    );
};

export default AdminModalUsers;
