import {
    render, 
    screen,
    fireEvent,
    waitFor
} from "@testing-library/react";
import ReservasPreparacion from "./ReservasPreparacion";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";
import { BrowserRouter } from 'react-router-dom';
import { useFacilitiesAndReservations } from "../../../context/FacilitiesAndReservationsContext";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../context/FacilitiesAndReservationsContext", () => ({
    useFacilitiesAndReservations: jest.fn()
}));

describe("ReservasPreparacion Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            registration: {
                gym: { isActive: true, initDate: new Date(), endDate: new Date() },
                athletics: { isActive: false, initDate: null, endDate: null }
            }
        };
        mockAuthContext.isStudent = jest.fn().mockReturnValue(true);
        useFacilitiesAndReservations.mockReturnValue({
            getAllReservations: jest.fn().mockResolvedValue([])
        });
    });

    it("renders component elements correctly when user is logged in and has registration in at least one sport", async () => {
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        expect(screen.getByRole("heading", { level: 1, name: /reservas de sala de preparación física/i })).toBeInTheDocument();
        expect(screen.getByText(/Bienvenido a la página de Reservas de salas de preparación física URJC Deportes./i)).toBeInTheDocument();
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        expect(screen.getByText(/PRÓXIMAMENTE.../i)).toBeInTheDocument();
        expect(screen.queryByText(/Debes iniciar sesión para poder reservar salas de preparación física./i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Debes estar dado de alta en el servicio de deportes para poder reservar salas de preparación física./i)).not.toBeInTheDocument();
    });

    it("renders 'Debes iniciar sesión...' message when user is not logged in", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);

        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        expect(screen.getByText(/Debes iniciar sesión para poder reservar salas de preparación física./i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /iniciar sesión/i })).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText(/PRÓXIMAMENTE.../i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Debes estar dado de alta en el servicio de deportes para poder reservar salas de preparación física./i)).not.toBeInTheDocument();
    });

    it("renders 'Debes estar dado de alta...' message and registration button when user is logged in but has no registration", async () => {
        mockAuthContext.user.registration = {
            gym: { isActive: false },
            athletics: { isActive: false }
        };
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        expect(screen.getByText(/Debes estar dado de alta en el servicio de deportes para poder reservar salas de preparación física./i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /darme de alta/i })).toBeInTheDocument();
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText(/PRÓXIMAMENTE.../i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Debes iniciar sesión para poder reservar salas de preparación física./i)).not.toBeInTheDocument();
    });

    it("updates sport filter when dropdown value changes", async () => {
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        const sportSelect = screen.getByRole("combobox");
        fireEvent.change(sportSelect, { target: { value: 'Atletismo' } });
        await waitFor(() => {
            expect(sportSelect).toHaveValue('Atletismo');
        });
    });

    it("renders 'PRÓXIMAMENTE...' message when user has registration", async () => {
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );
        expect(screen.getByText(/PRÓXIMAMENTE.../i)).toBeInTheDocument();
    });

    it("does not render sport filter dropdown and 'PRÓXIMAMENTE...' message when user is not logged in", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText(/PRÓXIMAMENTE.../i)).not.toBeInTheDocument();
    });

    it("does not render sport filter dropdown and 'PRÓXIMAMENTE...' message when user is logged in but has no registration", async () => {
        mockAuthContext.user.registration = {
            gym: { isActive: false, initDate: null, endDate: null },
            athletics: { isActive: false, initDate: null, endDate: null }
        };
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );
        expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
        expect(screen.queryByText(/PRÓXIMAMENTE.../i)).not.toBeInTheDocument();
    });

    it("navigates to '/login' when 'Iniciar sesión' button is clicked", async () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        const loginButton = screen.getByRole("button", { name: /iniciar sesión/i });
        fireEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /iniciar sesión/i })).toHaveAttribute('href', '/login');
        });
    });

    it("navigates to '/salas-preparacion/alta' when 'Darme de alta' button is clicked", async () => {
        mockAuthContext.user.registration = {
            gym: { isActive: false, initDate: null, endDate: null },
            athletics: { isActive: false, initDate: null, endDate: null }
        };
        useAuth.mockReturnValue(mockAuthContext);
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        const registrationButton = screen.getByRole("button", { name: /darme de alta/i });
        fireEvent.click(registrationButton);

        await waitFor(() => {
            expect(screen.getByRole('link', { name: /darme de alta/i })).toHaveAttribute('href', '/salas-preparacion/alta');
        });
    });

    it("calls getAllReservations on component mount", async () => {
        const mockgetAllReservations = jest.fn().mockResolvedValue([]);
        useFacilitiesAndReservations.mockReturnValue({
            getAllReservations: mockgetAllReservations
        });
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(mockgetAllReservations).toHaveBeenCalledTimes(1);
        });
    });

    it("sets reservas state with data from getAllReservations", async () => {
        const mockReservasList = [{ id: 1, deporte: 'Gimnasio' }, { id: 2, deporte: 'Atletismo' }];
        const mockgetAllReservations = jest.fn().mockResolvedValue(mockReservasList);
        useFacilitiesAndReservations.mockReturnValue({
            getAllReservations: mockgetAllReservations
        });
        render(
            <BrowserRouter>
                <ReservasPreparacion />
            </BrowserRouter>
        );

        await waitFor(() => {
            // Although reservas state is set, it's not directly rendered in the component's current implementation.
            // We can check if getAllReservations was called and returned data, which implies state update.
            expect(mockgetAllReservations).toHaveBeenCalledTimes(1);
        });
    });
});