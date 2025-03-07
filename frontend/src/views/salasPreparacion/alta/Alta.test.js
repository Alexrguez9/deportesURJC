import {
    render,
    screen,
    fireEvent,
    waitFor
} from "@testing-library/react";
import Alta from "./Alta";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from 'react-router-dom';

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("Alta Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            alta: {
                gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                atletismo: { estado: false, fechaInicio: null, fechaFin: null }
            }
        };
        mockAuthContext.updateUser = jest.fn().mockResolvedValue({ status: 200, data: {} }); // Mock successful update
    });

    it("renders component elements correctly when user is logged in", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        expect(screen.getByRole("heading", { level: 1, name: /alta de sala de preparación física/i })).toBeInTheDocument();
        expect(screen.getByText(/Bienvenido a la página de Alta de salas de preparación física URJC Deportes./i)).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toHaveValue('Gimnasio');
        expect(screen.getByRole("button", { name: /darme de alta/i })).toBeInTheDocument();
        expect(screen.queryByText(/Debes iniciar sesión para poder darte de alta/i)).not.toBeInTheDocument();
    });

    it("renders 'Debes iniciar sesión...' message when user is not logged in and it should not appear alta button", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        expect(screen.getByText(/Debes iniciar sesión para poder darte de alta/i)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /darme de alta/i })).not.toBeInTheDocument();
    });

    it("updates sport filter when dropdown value changes", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        await waitFor(() => {
            expect(sportSelect).toHaveValue('Atletismo');
        });
    });

    it("calls updateUser with correct parameters when 'Darme de alta' button is clicked for Gimnasio", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            const expectedUserData = {
                ...mockAuthContext.user,
                alta: {
                    gimnasio: { estado: true, fechaInicio: expect.any(Date), fechaFin: expect.any(Number) }, // Dates are checked with expect.any(Date) and Number
                    atletismo: { estado: false, fechaInicio: null, fechaFin: null }
                }
            };
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', expect.objectContaining({ // Using expect.objectContaining to ignore date comparisons
                alta: expect.objectContaining({
                    gimnasio: expect.objectContaining({ estado: true }),
                    atletismo: expect.objectContaining({ estado: false })
                })
            }));
        });
    });

    it("calls updateUser with correct parameters when 'Darme de alta' button is clicked for Atletismo", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );
        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            const expectedUserData = {
                ...mockAuthContext.user,
                alta: {
                    gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                    atletismo: { estado: true, fechaInicio: expect.any(Date), fechaFin: expect.any(Number) } // Dates are checked with expect.any(Date) and Number
                }
            };
            expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', expect.objectContaining({ // Using expect.objectContaining to ignore date comparisons
                alta: expect.objectContaining({
                    atletismo: expect.objectContaining({ estado: true }),
                    gimnasio: expect.objectContaining({ estado: false })
                })
            }));
        });
    });

    it("renders success message after successful alta", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(screen.getByText(/alta completada con éxito!/i)).toBeInTheDocument();
            expect(screen.queryByText(/error al dar de alta/i)).not.toBeInTheDocument();
        });
    });

    it("renders error message when updateUser fails", async () => {
        mockAuthContext.updateUser = jest.fn().mockRejectedValue(new Error("Update error")); // Mock failed update

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(screen.getByText(/error al dar de alta2/i)).toBeInTheDocument();
            expect(screen.queryByText(/alta completada con éxito!/i)).not.toBeInTheDocument();
        });
    });

    it("renders error message if user is already registered in both facilities", async () => {
        mockAuthContext.user = { // Simulate user already registered in both
            _id: '123',
            name: 'Test User',
            alta: {
                gimnasio: { estado: true, fechaInicio: new Date(), fechaFin: new Date() },
                atletismo: { estado: true, fechaInicio: new Date(), fechaFin: new Date() }
            }
        };
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton);

        await waitFor(() => {
            expect(screen.getByText(/Ya estás dado de alta en las dos instalaciones./i)).toBeInTheDocument();
            expect(mockAuthContext.updateUser).not.toHaveBeenCalled(); // Ensure updateUser is not called
            expect(screen.queryByText(/alta completada con éxito!/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/error al dar de alta/i)).not.toBeInTheDocument();
        });
    });

    it("clears success and error messages when sport filter changes", async () => {
        render(
            <BrowserRouter>
                <Alta />
            </BrowserRouter>
        );

        const altaButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(altaButton); // Trigger success message

        await waitFor(() => {
            expect(screen.getByText(/alta completada con éxito!/i)).toBeInTheDocument();
        });

        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } }); // Change sport filter

        await waitFor(() => {
            expect(screen.queryByText(/alta completada con éxito!/i)).not.toBeInTheDocument(); // Success message cleared
            expect(screen.queryByText(/error al dar de alta/i)).not.toBeInTheDocument(); // Error message cleared (if it was somehow set before)
        });
    });
});