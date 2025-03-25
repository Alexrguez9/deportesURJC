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

  describe("getAllUsers", () => {
    it("debería obtener todos los usuarios correctamente", async () => {
      const mockUsers = [{ _id: "1", email: "user1@test.com" }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const users = await authValues.getAllUsers();
      expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users", expect.anything());
      expect(users).toEqual(mockUsers);
    });

    it("debería devolver null si la respuesta no es ok", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await authValues.getAllUsers();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("debería manejar errores de red", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(authValues.getAllUsers()).rejects.toThrow("Network error");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("debería autenticar al usuario correctamente tras un login exitoso", async () => {
      const mockUser = { _id: "123", email: "test@admin.com", role: "admin" };
      const response = {
        ok: true,
        message: "Perfil actualizado correctamente",
        user: mockUser,
      };
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          message: "Perfil actualizado correctamente",
          user: mockUser,
        }),
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
        expect(authValues.user).toEqual(response);
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
    it("should update the current user's password and name correctly", async () => {
      const mockUpdatedUser = {
        _id: "123",
        email: "test@example.com",
        name: "Nuevo Nombre",
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          ok: true,
          message: "Perfil actualizado correctamente",
          user: mockUpdatedUser,
        }),
      });

      let updatedUser;

      await act(async () => {
        updatedUser = await authValues.updatePasswordAndName(
          "123",
          "currentPassword",
          "newPassword",
          "Nuevo Nombre"
        );
      });

      expect(updatedUser).toEqual(mockUpdatedUser);

      await waitFor(() => {
        expect(authValues.user).toEqual(mockUpdatedUser);
      });
    });

    it("should handle incorrect current password", async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: "Contraseña actual incorrecta" }),
      });

      await expect(
        authValues.updatePasswordAndName(
          "123",
          "wrongPassword",
          "newPassword",
          "Nuevo Nombre"
        )
      ).rejects.toThrow("Contraseña actual incorrecta");
    });

    it("should handle network errors", async () => {
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
    it("should delete a user who is not the current user", async () => {
      fetch.mockResolvedValueOnce({ ok: true });

      const response = await authValues.deleteUser("999");
      expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users/999", expect.anything());
      expect(response.ok).toBe(true);
    });

    it("should delete the current user", async () => {
      act(() => {
        authValues.setUser({ _id: "123", email: "user@test.com" });
      });
    
      fetch.mockResolvedValueOnce({ ok: true });
    
      await act(async () => {
        await authValues.deleteUser("123");
      });
    
      await waitFor(() => {
        expect(authValues.user).toBe(null);
        expect(authValues.isAuthenticated).toBe(false);
      });
    });

    it("should handle non-OK response", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({ ok: false, statusText: "Not found" });

      const response = await authValues.deleteUser("456");

      expect(consoleSpy).toHaveBeenCalledWith("Error deleting user:", "Not found");
      expect(response.ok).toBe(false);
      consoleSpy.mockRestore();
    });

    it("should handle network error", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(authValues.deleteUser("789")).rejects.toThrow("Network error");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });


  describe("isAdmin", () => {
    it("debería devolver true si el usuario es admin", () => {
      act(() => {
        authValues.setUser({ role: "admin" });
      });
      expect(authValues.isAdmin()).toBe(true);
    });

    it("debería devolver false si el usuario no es admin", () => {
      authValues.user = { role: "user" };
      expect(authValues.isAdmin()).toBe(false);
    });

    it("debería devolver false si no hay usuario", () => {
      authValues.user = null;
      expect(authValues.isAdmin()).toBe(false);
    });
  });

  describe("isStudent", () => {
    it("debería devolver true si el correo es de estudiante", () => {
      act(() => {
        authValues.setUser({ email: "alumno@alumnos.urjc.es" });
      });
      expect(authValues.isStudent()).toBe(true);
    });

    it("debería devolver false si el correo no es de estudiante", () => {
      authValues.user = { email: "profesor@urjc.es" };
      expect(authValues.isStudent()).toBe(false);
    });

    it("debería devolver false si no hay usuario", () => {
      authValues.user = null;
      expect(authValues.isStudent()).toBe(false);
    });
  });

  describe("handleAdmin", () => {
    it("should handle admin user", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAdmin: true }),
      });

      const result = await authValues.handleAdmin({ email: "admin@test.com" });
      expect(result.role).toBe("admin");
    });

    it("should assign role 'user' if the backend indicates it", async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isAdmin: false }),
      });

      const result = await authValues.handleAdmin({ email: "user@test.com" });
      expect(result.role).toBe("user");
    });

    it("should handle non-OK response", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await authValues.handleAdmin({ email: "user@test.com" });
      expect(result.role).toBe("user");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle network error", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await authValues.handleAdmin({ email: "user@test.com" });
      expect(result.role).toBe("user");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
