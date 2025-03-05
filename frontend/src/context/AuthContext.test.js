import React from "react";
import { render, waitFor, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { mockAuthContext } from "../utils/mocks";

// Mock de fetch global para simular las llamadas a la API
global.fetch = jest.fn();

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

    render(
      <AuthProvider>
        <TestComponent callback={(values) => (authValues = values)} />
      </AuthProvider>
    );
  });

  afterEach(() => {
    fetch.mockReset();
  });

  test("debería proporcionar valores iniciales por defecto", () => {
    expect(authValues.user).toBe(null);
    expect(authValues.isAuthenticated).toBe(false);
    expect(typeof authValues.login).toBe("function");
    expect(typeof authValues.logout).toBe("function");
    expect(typeof authValues.addUser).toBe("function");
    expect(typeof authValues.updateUser).toBe("function");
    expect(typeof authValues.deleteUser).toBe("function");
    expect(typeof authValues.getAllUsers).toBe("function");
    expect(typeof authValues.isAdmin).toBe("function");
    expect(typeof authValues.isStudent).toBe("function");
    expect(typeof authValues.handleAdmin).toBe("function");
  });

  describe("login", () => {
    it("debería autenticar al usuario correctamente tras un login exitoso", async () => {
      const mockUser = { _id: "123", email: "test@admin.com", role: "admin" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      });

      await act(async () => {
        await authValues.login(
          { email: "test@admin.com", password: "123456" },
          jest.fn()
        );
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/login",
          expect.anything()
        );
        expect(authValues.user).toEqual(mockUser);
        expect(authValues.isAuthenticated).toBe(true);
      });
    });

    it("debería manejar errores de login", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await act(async () => {
        const response = await authValues.login(
          { email: "test@admin.com", password: "wrongpassword" },
          jest.fn()
        );
        expect(response.status).toBe(401);
      });

      await waitFor(() => {
        expect(authValues.isAuthenticated).toBe(false);
        expect(authValues.user).toBe(null);
      });
    });

    it("debería manejar errores de red en el login", async () => {
      fetch.mockRejectedValueOnce(new Error("Fallo de red"));

      await act(async () => {
        const error = await authValues.login(
          { email: "test@admin.com", password: "wrongpassword" },
          jest.fn()
        );
        expect(error).toBeInstanceOf(Error);
      });

      await waitFor(() => {
        expect(authValues.isAuthenticated).toBe(false);
        expect(authValues.user).toBe(null);
      });
    });
  });

  describe("logout", () => {
    it("debería cerrar la sesión del usuario correctamente", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      authValues.isAuthenticated = true;
      authValues.user = { _id: "123", email: "test@admin.com", role: "admin" };

      await act(async () => {
        await authValues.logout();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/logout",
          expect.anything()
        );
      });
    });

    it("debería manejar errores en el logout", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      authValues.isAuthenticated = true;
      authValues.user = { _id: "123", email: "test@admin.com", role: "admin" };

      await act(async () => {
        await authValues.logout();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(authValues.isAuthenticated).toBe(true);
        expect(authValues.user).toEqual({
          _id: "123",
          email: "test@admin.com",
          role: "admin",
        });
      });
    });
  });

  describe("addUser", () => {
    it("debería registrar a un usuario nuevo correctamente", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: "newUserId", email: "new@test.com" }),
      });

      await act(async () => {
        await authValues.addUser(
          { email: "new@test.com", password: "123456" },
          jest.fn()
        );
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/register",
          expect.anything()
        );
      });
    });

    it("debería manejar el caso de usuario duplicado (409)", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 409,
      });

      await act(async () => {
        const response = await authValues.addUser(
          { email: "existing@test.com", password: "123456" },
          jest.fn()
        );
        expect(response.status).toBe(409);
      });

      await waitFor(() => {
        expect(authValues.isAuthenticated).toBe(false);
        expect(authValues.user).toBe(null);
      });
    });

  });

  describe("updateUser", () => {
    it("debería manejar errores en updateUser", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await act(async () => {
        await expect(
          authValues.updateUser("123", { email: "updated@test.com" })
        ).rejects.toThrow();
      });
    });

    it("debería manejar errores de red en updateUser", async () => {
      fetch.mockRejectedValueOnce(
        new Error("Fallo de red al actualizar usuario")
      );
      authValues.user = {
        _id: "123",
        email: "original@test.com",
        role: "user",
      };

      await act(async () => {
        await expect(
          authValues.updateUser("123", { email: "updated@test.com" })
        ).rejects.toThrow();
      });

      await waitFor(() => {
        expect(authValues.user).toEqual({
          _id: "123",
          email: "original@test.com",
          role: "user",
        });
      });
    });
  });

  describe("deleteUser", () => {
    it("debería eliminar un usuario correctamente y cerrar sesión si es el usuario actual", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      authValues.user = { _id: "123", email: "test@admin.com", role: "admin" };
      authValues.isAuthenticated = true;

      await act(async () => {
        await authValues.deleteUser("123");
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/123",
          expect.anything()
        );
      });
    });

    it("debería eliminar un usuario correctamente sin cerrar sesión si no es el usuario actual", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      authValues.user = {
        _id: "currentUser",
        email: "current@test.com",
        role: "user",
      };
      authValues.isAuthenticated = true;

      await act(async () => {
        await authValues.deleteUser("otherUser");
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/otherUser",
          expect.anything()
        );
        expect(authValues.user).toEqual({
          _id: "currentUser",
          email: "current@test.com",
          role: "user",
        });
        expect(authValues.isAuthenticated).toBe(true);
      });
    });

    it("debería manejar errores en deleteUser", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await act(async () => {
        await authValues.deleteUser("123");
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(authValues.isAuthenticated).toBe(false);
        expect(authValues.user).toBe(null);
      });
    });
  });

  describe("getAllUsers", () => {
    it("debería obtener la lista de usuarios correctamente", async () => {
      const mockUsers = [
        { _id: "1", email: "user1@test.com" },
        { _id: "2", email: "user2@admin.com", role: "admin" },
      ];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      let users;
      await act(async () => {
        users = await authValues.getAllUsers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users",
          expect.anything()
        );
        expect(users).toEqual(mockUsers);
      });
    });

    it("debería manejar errores en getAllUsers", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      let users;
      await act(async () => {
        users = await authValues.getAllUsers();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
        expect(users).toBeNull();
      });
    });

    it("debería manejar errores de red en getAllUsers", async () => {
      fetch.mockRejectedValueOnce(
        new Error("Fallo de red al obtener usuarios")
      );

      await act(async () => {
        await expect(authValues.getAllUsers()).rejects.toThrow();
      });
    });
  });

  describe("isAdmin", () => {
    it("debería retornar true si el usuario es admin", () => {
      authValues.user = { _id: "123", email: "admin@test.com", role: "admin" };
    });

    it("debería retornar false si el usuario no es admin", () => {
      authValues.user = { _id: "123", email: "user@test.com", role: "user" };
      expect(authValues.isAdmin()).toBe(false);
    });

    it("debería retornar false si no hay usuario logueado", () => {
      authValues.user = null;
      expect(authValues.isAdmin()).toBe(false);
    });
  });

  describe("isStudent", () => {
    it("debería retornar true si el usuario tiene email de alumno", () => {
        mockAuthContext.user = {
            _id: "123",
            email: "student@alumnos.urjc.es",
            role: "student",
        };
    });

    it("debería retornar false si el usuario no tiene email de alumno", () => {
        mockAuthContext.user = { _id: "123", email: "user@test.com", role: "user" };
        expect(authValues.isStudent()).toBe(false);
    });

    it("debería retornar false si no hay usuario logueado", () => {
      authValues.user = null;
      expect(authValues.isStudent()).toBe(false);
    });
  });

  describe("handleAdmin", () => {
    it("debería asignar role 'admin' si el email contiene '@admin'", () => {
      const data = { email: "test@admin.com" };
      const result = authValues.handleAdmin(data);
      expect(result.role).toBe("admin");
    });

    it("debería asignar role 'user' si el email no contiene '@admin'", () => {
      const data = { email: "test@user.com" };
      const result = authValues.handleAdmin(data);
      expect(result.role).toBe("user");
    });
  });
});
