import React, { useState, useEffect } from "react";
import './Login.css';
import { useAuth } from "../../../context/AuthContext";
import { set, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Spinner from "../../../components/spinner/Spinner";

const Login = () => {
    const { user, login, logout, register } = useAuth();
    let navigate = useNavigate();
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);

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
        clearErrors: clearErrorsLogin,
        watch,
        formState: { errors: errorsLogin },
    } = useForm();

    const onSubmitRegister = handleSubmitRegister(async (data) => {
        clearErrorsRegister(); // Clear previous errors
        setIsRegisterLoading(true);
        try{ 
            if (!user) {
                const updatedData = handleAdmin(data);
                const resRegister = await register(updatedData, navigate);
                if (resRegister.ok) {
                    navigate("/profile");
                    resetRegister();
                } else if ( resRegister.status === 500 ) {
                    setErrorRegister("register", {
                        type: "manual",
                        message: "Email ya en uso"
                    });
                } else if ( !resRegister.ok ) {
                    setErrorRegister("register", {
                        type: "manual",
                        message: "Se ha producido un error. Por favor, inténtalo de nuevo."
                    });
                }
            } else {
                logout();
            }
        } catch (error) {
            console.error("Error al registrarse:", error);
        } finally {
            setIsRegisterLoading(false);
        }
    });

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name && errorsLogin.login) {
                clearErrorsLogin("login");
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, clearErrorsLogin, errorsLogin]);
    
    const onSubmitLogin = handleSubmitLogin(async (data) => {
        clearErrorsLogin(); // Clear previous errors
        setIsLoginLoading(true);

        const dataWatch = {
            loginEmail: watch("loginEmail"),
            loginPassword: watch("loginPassword"),
        };

        const updatedData = handleAdmin(dataWatch);
        try {
            const userData = {
                email: updatedData.loginEmail,
                password: updatedData.loginPassword,
                role: updatedData.role
            };
            const resLogin = await login(userData, navigate);

            if ( resLogin.status === 401 ) {
                setErrorLogin("login", {
                    type: "manual",
                    message: "Email o contraseña incorrectos"
                });
            } else if ( !resLogin.ok ) {
                setErrorLogin("login", {
                    type: "manual",
                    message: "Se ha producido un error. Por favor, inténtalo de nuevo."
                });
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
            setErrorLogin("login", {
                type: "manual",
                message: error.message
            });
        } finally {
            setIsLoginLoading(false);
        }
    });

    const handleAdmin = (data) => {
        const email = watchRegister("email");
        const role = email.includes("@admin") ? "admin" : "user";
        return { ...data, role };
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
            clearErrorsRegister(["password"]);
        }
    };

    return (
        <>
            <h1>Consultar perfil</h1>
            <p>
                Bienvenido a la página de perfil de URJC Deportes. Aquí podrás
                consultar y modificar tu perfil.
            </p>
            <div className="profile-content">
            <div id="profile-card">
                    <div className="profile-card-content">
                        <h3>Iniciar sesión</h3>
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
                                        {errorsLogin.loginEmail && <span className="error-message">{errorsLogin.loginEmail.message}</span>}
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
                                        {errorsLogin.loginPassword && <span className="error-message">{errorsLogin.loginPassword.message}</span>}
                                    </label>
                                </div>
                            </div>
                            <div className="login-button">
                                {!isLoginLoading ? <button type="submit">Iniciar sesión</button> : <Spinner />}
                            </div>
                            {errorsLogin.login && <span className="error-message">{errorsLogin.login.message}</span>}
                        </form>
                    </div>
                </div>
                <div id="profile-card">
                    <div className="profile-card-content">
                        <section>
                            <h3>Registrarse</h3>
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
                                            {errorsRegister.name && <span className="error-message">{errorsRegister.name.message}</span>}
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
                                            {errorsRegister.email && <span className="error-message">{errorsRegister.email.message}</span>}
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
                                            {errorsRegister.password && <span className="error-message">{errorsRegister.password.message}</span>}
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
                                            {errorsRegister.repeatPassword && <span className="error-message">{errorsRegister.repeatPassword.message}</span>}
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    {!isRegisterLoading ? <button type="submit">Registrarse</button> : <Spinner />}
                                </div>
                                {errorsRegister.register && <span className="error-message">{errorsRegister.register.message}</span>}
                            </form>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
