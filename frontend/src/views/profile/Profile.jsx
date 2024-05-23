import React from "react";
import "./Profile.css";

import { useAuth } from "../../context/AuthContext";
import { useForm } from "react-hook-form";

const Profile = () => {
    const { user, login, logout, register } = useAuth();

    const {
        register: registerRegister,
        handleSubmit: handleSubmitRegister,
        watch: watchRegister,
        clearErrors: clearErrorsRegister,
        setError: setErrorRegister,
        formState: { errors: errorsRegister },
        reset: resetRegister,
    } = useForm();

    const {
        register: registerLogin,
        handleSubmit: handleSubmitLogin,
        setError: setErrorLogin,
        formState: { errors: errorsLogin },
    } = useForm();

    const onSubmitRegister = handleSubmitRegister((data) => {
        if (!user) {
            const updatedData = handleAdmin(data);
            register(updatedData);
            resetRegister();
        } else {
            logout();
        }
    });

    const onSubmitLogin = handleSubmitLogin(async (data) => {
        try {
            const userData = {
                email: data.loginEmail,
                password: data.loginPassword
            };
            await login(userData);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            // Manejar errores según sea necesario
            setErrorLogin("login", {
                message: "Email o contraseña incorrectos",
            });
        }
    });
    

    const handleAdmin = (data) => {
        const email = watchRegister("email");
        const role = email.includes("@admin") ? "admin" : "user";
        return { ...data, role };
    };

    const handleLogout = () => {
        if (user) {
            logout();
        }
    };

    const handleEmailValidationRegister = () => {
        const email = watchRegister("email");

        if (!email.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
            setErrorRegister("email", {
                message: "Por favor, introduce un email válido",
            });
        }
    };

    const handlePasswordValidationRegister = () => {
        if (errorsRegister.password) {
            clearErrorsRegister("password");
        }

        const password = watchRegister("password");
        const repeatPassword = watchRegister("repeatPassword");

        if (password.length < 8) {
            return setErrorRegister("password", {
                message: "La contraseña debe tener al menos 8 caracteres",
            });
        }

        if (password === repeatPassword) {
            clearErrorsRegister();
        }
    };

    return (
        <>
            <h1>Perfil</h1>
            <p>
                Bienvenido a la página de perfil de URJC Deportes. Aquí podrás
                consultar y modificar tu perfil.
            </p>
            {!user ? (
                <div className="profile-content">
                    <div id="profile-card">
                        <div className="profile-card-content">
                            <section>
                                <h2>Formulario de registro</h2>
                                <form onSubmit={onSubmitRegister}>
                                    <div className="inputs">
                                        <div className="input-container">
                                            <label>
                                                Nombre:
                                                <input
                                                    type="text"
                                                    {...registerRegister("name", {
                                                        required: "Por favor, introduce tu nombre",
                                                        minLength: {
                                                            value: 3,
                                                            message: "El nombre debe tener al menos 3 caracteres"
                                                        },
                                                        maxLength: 40,
                                                    })}
                                                />
                                                {errorsRegister.name && <span>{errorsRegister.name.message}</span>}
                                            </label>
                                        </div>
                                        <div className="input-container">
                                            <label>
                                                Email:
                                                <input
                                                    type="email"
                                                    {...registerRegister("email", {
                                                        required: "Por favor, introduce tu email",
                                                    })}
                                                    onBlur={handleEmailValidationRegister}
                                                />
                                                {errorsRegister.email && <span>{errorsRegister.email.message}</span>}
                                            </label>
                                        </div>
                                        <div className="input-container">
                                            <label>
                                                Contraseña:
                                                <input
                                                    type="password"
                                                    {...registerRegister("password", {
                                                        required: true,
                                                        minLength: {
                                                            value: 8,
                                                            message: "La contraseña debe tener al menos 8 caracteres"
                                                        }
                                                    })}
                                                    onBlur={handlePasswordValidationRegister}
                                                />
                                                {errorsRegister.password && <span>{errorsRegister.password.message}</span>}
                                            </label>
                                        </div>
                                        <div className="input-container">
                                            <label>
                                                Repetir contraseña:
                                                <input
                                                    type="password"
                                                    {...registerRegister("repeatPassword", {
                                                        required: "Por favor, repite la contraseña",
                                                        validate: (value) => value === watchRegister("password") || "Las contraseñas no coinciden",
                                                    })}
                                                    onBlur={handlePasswordValidationRegister}
                                                />
                                                {errorsRegister.repeatPassword && <span>{errorsRegister.repeatPassword.message}</span>}
                                            </label>
                                        </div>
                                    </div>
                                    <div><button>Registrarse</button></div>
                                </form>
                            </section>
                        </div>
                    </div>
                    <div id="profile-card">
                        <div className="profile-card-content">
                            <h2>Iniciar sesión</h2>
                            <form onSubmit={onSubmitLogin}>
                                <div className="inputs">
                                    <div className="input-container">
                                        <label>
                                            Email:
                                            <input
                                                type="email"
                                                {...registerLogin("loginEmail", {
                                                    required: "Por favor, introduce tu email",
                                                })}
                                            />
                                            {errorsLogin.loginEmail && <span>{errorsLogin.loginEmail.message}</span>}
                                        </label>
                                    </div>
                                    <div className="input-container">
                                        <label>
                                            Contraseña:
                                            <input
                                                type="password"
                                                {...registerLogin("loginPassword", {
                                                    required: "Por favor, introduce tu contraseña",
                                                })}
                                            />
                                            {errorsLogin.loginPassword && <span>{errorsLogin.loginPassword.message}</span>}
                                        </label>
                                    </div>
                                </div>
                                <div><button>Iniciar sesión</button></div>
                                {errorsLogin.login && <span>{errorsLogin.login.message}</span>}
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="profile-content">
                    <div id="profile-card">
                        <div className="profile-card-content">
                            <section>
                                <h2>Consulta de perfil</h2>
                                <div>
                                    <p>Nombre: {user.name}</p>
                                    <p>Email: {user.email}</p>
                                </div>
                                <h2>Modificación de perfil</h2>
                                <p>Próximamente...</p>
                            </section>
                            <div><button onClick={handleLogout}>Cerrar sesión</button></div>
                            {user && (
                                <div>
                                    <p>¿Quieres cerrar sesión {user.name}?</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;
