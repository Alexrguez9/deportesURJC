import { render, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { mockAuthContext } from "../utils/mocks";

jest.mock('../config/env', () => ({
  __esModule: true,
  default: 'http://localhost:4000'
}));

// Global fetch mock to prevent making real requests on API
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

  test("should render default values", () => {
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
    it("should get all users correctly", async () => {
      const mockUsers = [{ _id: "1", email: "user1@test.com" }];
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      });

      const users = await authValues.getAllUsers();
      expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users", expect.anything());
      expect(users).toEqual(mockUsers);
    });

    it("should return null if the answer is not ok", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      const result = await authValues.getAllUsers();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it("should handle network errors", async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
      fetch.mockRejectedValueOnce(new Error("Network error"));

      await expect(authValues.getAllUsers()).rejects.toThrow("Network error");
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe("login", () => {
    it("should authenticate the user correctly after a successful login", async () => {
      const mockUser = { _id: "123", email: "test@admin.com", role: "admin" };
    
      // First response: login
      fetch.mockResolvedValueOnce({ ok: true }); 
    
      // Second response: session
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
        expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users/login", expect.anything());
        expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users/session", { credentials: 'include' });
        expect(authValues.user).toEqual(mockUser);
        expect(authValues.isAuthenticated).toBe(true);
      });
    });

    it("should handle login errors", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 401 });

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
    }, 10000);


    it("should handle network errors in the login", async () => {
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
    it("should log the user out correctly", async () => {
      fetch.mockResolvedValueOnce({ ok: true });
      authValues.isAuthenticated = true;
      authValues.user = { _id: "123", email: "test@admin.com", role: "admin" };

      await act(async () => {
        await authValues.logout();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users/logout", expect.anything());
      });
    });
    it("you should run and assert the logout mock directly", async () => {
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

    it("should handle logout errors", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });
      authValues.isAuthenticated = true;
      authValues.user = { _id: "123", email: "test@admin.com", role: "admin" };

      await act(async () => {
        await authValues.logout();
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith("http://localhost:4000/users/logout", expect.anything());
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
    it("you should register a new user correctly", async () => {
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
        expect(fetch).toHaveBeenCalledWith(
          "http://localhost:4000/users/register",
          expect.anything()
        );
      });
    });

    it("should handle the duplicate user case (409)", async () => {
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

    it("should handle server response errors (status other than 409)", async () => {
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

    it("should handle network errors", async () => {
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

    it("should call navigate when registration is successful and there is no logged in user", async () => {
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
    it("should handle errors in updateUser", async () => {
      fetch.mockResolvedValueOnce({ ok: false, status: 500 });

      await act(async () => {
        await expect(
          authValues.updateUser("123", { email: "updated@test.com" })
        ).rejects.toThrow();
      });
    });

    it("should handle network errors in updateUser", async () => {
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

    it("should update another user correctly without modifying the current user.", async () => {
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

    it("should call fetch with the correct parameters", async () => {
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
          credentials: 'include',
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
    it("should return true if the user is admin", () => {
      act(() => {
        authValues.setUser({ role: "admin" });
      });
      expect(authValues.isAdmin()).toBe(true);
    });

    it("should return false if the user is not admin", () => {
      authValues.user = { role: "user" };
      expect(authValues.isAdmin()).toBe(false);
    });

    it("should return false if there is no user", () => {
      authValues.user = null;
      expect(authValues.isAdmin()).toBe(false);
    });
  });

  describe("isStudent", () => {
    it("should return true if the mail is from a student", () => {
      act(() => {
        authValues.setUser({ email: "alumno@alumnos.urjc.es" });
      });
      expect(authValues.isStudent()).toBe(true);
    });

    it("should return false if the mail is not student mail", () => {
      authValues.user = { email: "profesor@urjc.es" };
      expect(authValues.isStudent()).toBe(false);
    });

    it("should return false if there is no user", () => {
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
