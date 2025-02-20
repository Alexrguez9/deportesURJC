import React from "react";
import { render, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { mockAuthContext } from "../utils/mocks";

jest.mock("../context/AuthContext", () => ({
    ...jest.requireActual("../context/AuthContext"),
    useAuth: jest.fn(),
}));

const TestComponent = ({ callback }) => {
    const auth = useAuth();
    callback(auth);
    return null;
};

describe("AuthProvider", () => {
    let authValues;

    beforeEach(() => {
        jest.clearAllMocks();
        authValues = null;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <AuthProvider>
                <TestComponent callback={(values) => (authValues = values)} />
            </AuthProvider>
        );
    });

    test("debería proporcionar valores iniciales por defecto", () => {
        expect(authValues.user).toBe(null);
        expect(authValues.isAuthenticated).toBe(false);
    });

    test("login debería autenticar al usuario", async () => {
        await act(async () => {
            await authValues.login({ email: "test@admin.com", password: "123456" }, jest.fn());
        });
        expect(mockAuthContext.login).toHaveBeenCalled();
        expect(mockAuthContext.user).toEqual({ _id: "123", email: "test@admin.com", role: "admin" });
        expect(mockAuthContext.isAuthenticated).toBe(true);
    });

    test("logout debería cerrar la sesión del usuario", async () => {
        await act(async () => {
            await authValues.logout();
        });
        expect(mockAuthContext.logout).toHaveBeenCalled();
        expect(mockAuthContext.user).toBe(null);
        expect(mockAuthContext.isAuthenticated).toBe(false);
    });

    test("addUser debería registrar a un usuario nuevo", async () => {
        await act(async () => {
            await authValues.addUser({ email: "new@test.com", password: "123456" }, jest.fn());
        });
        expect(mockAuthContext.addUser).toHaveBeenCalled();
    });

    test("updateUser debería actualizar la información del usuario", async () => {
        await act(async () => {
            await authValues.updateUser("123", { email: "updated@test.com" });
        });
        expect(mockAuthContext.updateUser).toHaveBeenCalledWith("123", { email: "updated@test.com" });
    });

    test("deleteUser debería eliminar a un usuario", async () => {
        await act(async () => {
            await authValues.deleteUser("123");
        });
        expect(mockAuthContext.deleteUser).toHaveBeenCalledWith("123");
    });

    test("getAllUsers debería obtener la lista de usuarios", async () => {
        await act(async () => {
            const users = await authValues.getAllUsers();
            expect(users).toEqual([
                { _id: "1", email: "user1@test.com" },
                { _id: "2", email: "user2@admin.com", role: "admin" },
            ]);
        });
    });

    test("isAdmin debería retornar true si el usuario es admin", () => {
        mockAuthContext.user = { _id: "123", email: "admin@test.com", role: "admin" };
        expect(authValues.isAdmin()).toBe(true);
    });

    test("isAdmin debería retornar false si el usuario no es admin", () => {
        mockAuthContext.user = { _id: "123", email: "user@test.com", role: "user" };
        expect(authValues.isAdmin()).toBe(false);
    });

    test("isStudent debería retornar true si el usuario tiene email de alumno", () => {
        mockAuthContext.user = { _id: "123", email: "student@alumnos.urjc.es", role: "student" };
        expect(authValues.isStudent()).toBe(true);
    });

    test("isStudent debería retornar false si el usuario no tiene email de alumno", () => {
        mockAuthContext.user = { _id: "123", email: "user@test.com", role: "user" };
        expect(authValues.isStudent()).toBe(false);
    });
});
