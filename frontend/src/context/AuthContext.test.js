import { render, waitFor, act } from "@testing-library/react";
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
    expect(typeof authValues.updatePasswordAndName).toBe("function");
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
    it("debería ejecutar y asertar el mock de logout directamente", async () => {
      mockAuthContext.user = {
        _id: "123",
        email: "test@admin.com",
        role: "admin",
      };
      mockAuthContext.isAuthenticated = true;

      await act(async () => {
        await mockAuthContext.logout();
      });

      expect(mockAuthContext.user).toBe(null);
      expect(mockAuthContext.isAuthenticated).toBe(false);
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

    it("debería manejar errores de respuesta del servidor (status diferente de 409)", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

      const response = await authValues.addUser(
        { email: "new@test.com", password: "123456" },
        jest.fn()
      );

      expect(response.status).toBe(500);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error en el fetch al back de registrarse:",
        500
      );
      consoleErrorSpy.mockRestore();
    });

    it("debería manejar errores de red", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await authValues.addUser(
        { email: "new@test.com", password: "123456" },
        jest.fn()
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error2 al registrarse:",
        new Error("Network error")
      );
      consoleErrorSpy.mockRestore();
    });

    it("debería llamar a navigate cuando el registro es exitoso y no hay usuario logueado", async () => {
      const navigateMock = jest.fn();
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: "newUserId", email: "new@test.com" }),
      });

      await authValues.addUser(
        { email: "new@test.com", password: "123456" },
        navigateMock
      );

      expect(navigateMock).toHaveBeenCalledWith("/");
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

    it("debería actualizar otro usuario correctamente sin modificar el usuario actual", async () => {
      const mockUpdatedUser = {
        _id: "456",
        email: "updated@test.com",
        role: "admin",
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedUser,
      });
      authValues.user = {
        _id: "123",
        email: "original@test.com",
        role: "user",
      };

      await act(async () => {
        await authValues.updateUser("456", { email: "updated@test.com", role: "admin" });
      });

      await waitFor(() => {
        expect(authValues.user).toEqual({
          _id: "123",
          email: "original@test.com",
          role: "user",
        });
      });
    });

    it("debería llamar a fetch con los parámetros correctos", async () => {
      const updateData = { email: "updated@test.com", role: "admin" };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: "123", ...updateData }),
      });

      await act(async () => {
        await authValues.updateUser("123", updateData);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/123",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );
    });
  });

  describe("updatePasswordAndName", () => {
    it("debería actualizar la contraseña y el nombre del usuario correctamente", async () => {
      const mockUpdatedUser = {
        _id: "123",
        email: "test@example.com",
        name: "Nuevo Nombre",
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUpdatedUser,
      });

      const updatedUser = await authValues.updatePasswordAndName(
        "123",
        "currentPassword",
        "newPassword",
        "Nuevo Nombre"
      );

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/123/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentPassword: "currentPassword",
            newPassword: "newPassword",
            name: "Nuevo Nombre",
          }),
          credentials: "include",
        }
      );
      expect(updatedUser).toEqual(mockUpdatedUser);
    });

    it("debería manejar errores de respuesta del servidor", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
      });

      await expect(
        authValues.updatePasswordAndName(
          "123",
          "currentPassword",
          "newPassword",
          "Nuevo Nombre"
        )
      ).rejects.toThrow("Error 400: No se pudo actualizar el perfil");
    });

    it("debería manejar errores de red", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(
        authValues.updatePasswordAndName(
          "123",
          "currentPassword",
          "newPassword",
          "Nuevo Nombre"
        )
      ).rejects.toThrow("Network error");
    });
  });

  describe("deleteUser", () => {
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

    it("debería manejar errores de respuesta del servidor y mostrar mensaje en consola", async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({ ok: false, statusText: "Not Found", status: 404 });

      await act(async () => {
        await authValues.deleteUser("123");
      });

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error deleting user:",
          "Not Found"
        );
        consoleErrorSpy.mockRestore();
      });
    });

    it("debería manejar errores de red", async () => {
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(authValues.deleteUser("123")).rejects.toThrow("Network error");
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
    it("debería retornar true si el usuario es admin", async () => {
      await act(async () => {
        authValues.setUser({ _id: "123", email: "admin@test.com", role: "admin" });
      });
      expect(authValues.isAdmin()).toBe(true);
    });

    it("debería retornar false si el usuario no es admin", async () => {
      await act(async () => {
        authValues.setUser({ _id: "123", email: "user@test.com", role: "user" });
      });
      expect(authValues.isAdmin()).toBe(false);
    });

    it("debería retornar false si no hay usuario logueado", async () => {
      await act(async () => {
        authValues.setUser(null);
      });
      expect(authValues.isAdmin()).toBe(false);
    });
  });

  describe("isStudent", () => {
    it("debería retornar true si el usuario tiene email de alumno", async () => {
      await act(async () => {
        authValues.setUser({
          _id: "123",
          email: "student@alumnos.urjc.es",
          role: "student",
        });
      });
      expect(authValues.isStudent()).toBe(true);
    });

    it("debería retornar false si el usuario no tiene email de alumno", async () => {
      await act(async () => {
        authValues.setUser({ _id: "123", email: "user@test.com", role: "user" });
      });
      expect(authValues.isStudent()).toBe(false);
    });

    it("debería retornar false si no hay usuario logueado", async () => {
      await act(async () => {
        authValues.setUser(null);
      });
      expect(authValues.isStudent()).toBe(false);
    });
  });

  describe("handleAdmin", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("debería asignar role 'admin' si la API devuelve isAdmin: true", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAdmin: true }),
      });

      const data = { email: "test@admin.com" };
      let result;

      await act(async () => {
        result = await authValues.handleAdmin(data);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/check-admin",
        expect.anything()
      );
      expect(result.role).toBe("admin");
    });

    it("debería asignar role 'user' si la API devuelve isAdmin: false", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAdmin: false }),
      });

      const data = { email: "test@user.com" };
      let result;

      await act(async () => {
        result = await authValues.handleAdmin(data);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/check-admin",
        expect.anything()
      );
      expect(result.role).toBe("user");
    });

    it("debería manejar errores de respuesta del servidor asignando role 'user'", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      const data = { email: "test@admin.com" };
      let result;

      await act(async () => {
        result = await authValues.handleAdmin(data);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/check-admin",
        expect.anything()
      );
      expect(result.role).toBe("user");
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });

    it("debería manejar errores de red asignando role 'user'", async () => {
      fetch.mockRejectedValueOnce(new Error("Network Error"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      const data = { email: "test@user.com" };
      let result;

      await act(async () => {
        result = await authValues.handleAdmin(data);
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:4000/users/check-admin",
        expect.anything()
      );
      expect(result.role).toBe("user");
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en handleAdmin:", expect.anything());
      consoleErrorSpy.mockRestore();
    });
  });
});
