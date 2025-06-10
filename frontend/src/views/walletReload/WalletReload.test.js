import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import WalletReload from "./WalletReload";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { sendEmail } from "../../utils/mails";

jest.mock('../../config/env', () => ({
  getApiUrl: jest.fn(() => 'http://localhost:4000')
}));

// Mocks
jest.mock("../../context/AuthContext");
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));
jest.mock("../../utils/mails", () => ({
  sendEmail: jest.fn(),
}));
jest.mock("../../components/spinner/Spinner", () => {
  const MockSpinner = () => <div data-testid="spinner">Loading...</div>;
  MockSpinner.displayName = "MockSpinner";
  return MockSpinner;
});

describe("WalletReload", () => {
  const mockUser = {
    _id: "1",
    name: "Test User",
    email: "test@urjc.es",
    balance: 10,
  };

  const updateUserMock = jest.fn();

  const renderWithContext = (user = mockUser) => {
    useAuth.mockReturnValue({
      user,
      updateUser: updateUserMock,
    });

    render(<WalletReload />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders loading spinner when isLoading is true", async () => {
    renderWithContext();

    fireEvent.change(screen.getByPlaceholderText("€"), { target: { value: "5" } });

    updateUserMock.mockResolvedValue({ status: 200 });

    fireEvent.click(screen.getByText("Enviar"));

    expect(await screen.findByTestId("spinner")).toBeInTheDocument();
  });

  test("renders form with user data", () => {
    renderWithContext();

    expect(screen.getByText("Recarga de monedero")).toBeInTheDocument();
    expect(screen.getByText("Introduce el importe a recargar:")).toBeInTheDocument();
    expect(screen.getByText("Nombre:")).toBeInTheDocument();
    expect(screen.getByText("Correo:")).toBeInTheDocument();
    expect(screen.getByText("Saldo actual:")).toBeInTheDocument();
  });

  test("renders error message if user is null", () => {
    renderWithContext(null);
    expect(screen.getByText("No se ha podido cargar el usuario.")).toBeInTheDocument();
  });

  test("shows error toast on invalid input", () => {
    renderWithContext();
    fireEvent.change(screen.getByPlaceholderText("€"), { target: { value: "0" } });
    fireEvent.click(screen.getByText("Enviar"));
    expect(toast.error).toHaveBeenCalledWith("Por favor, introduce un importe válido.");
  });

  test("updates user balance and shows success toast", async () => {
    renderWithContext();

    updateUserMock.mockResolvedValue({ status: 200 });

    fireEvent.change(screen.getByPlaceholderText("€"), { target: { value: "15" } });
    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => {
      expect(updateUserMock).toHaveBeenCalledWith("1", {
        ...mockUser,
        balance: 25,
      });
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("¡Saldo de 15€ añadido!");
      expect(sendEmail).toHaveBeenCalledWith(
        "test@urjc.es",
        "Deportes URJC - Recarga de monedero con éxito",
        expect.stringContaining("Has recargado tu monedero con un importe de €15.")
      );
    });
  });

  test("shows error toast on failed update", async () => {
    renderWithContext();

    updateUserMock.mockResolvedValue({
      status: 500,
      data: { message: "Server error" },
    });

    fireEvent.change(screen.getByPlaceholderText("€"), { target: { value: "10" } });
    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al recargar el monedero. Inténtalo de nuevo más tarde.");
      expect(sendEmail).toHaveBeenCalled();
    });
  });

  test("handles exception in try/catch block", async () => {
    renderWithContext();

    updateUserMock.mockRejectedValue(new Error("Unexpected error"));

    fireEvent.change(screen.getByPlaceholderText("€"), { target: { value: "20" } });
    fireEvent.click(screen.getByText("Enviar"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error al dar de alta. Inténtalo de nuevo.");
    });
  });
});
