import React from 'react';
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import MisAbonos from "./MisAbonos";
import { useAuth } from '../../../context/AuthContext';
import { mockAuthContext } from "../../../utils/mocks";

jest.mock("../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("MisAbonos Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        mockAuthContext.user = {
            _id: '123',
            name: 'Test User',
            email: 'test@example.com',
            alta: {
                gimnasio: { estado: true, fechaInicio: '2024-01-01', fechaFin: '2024-01-31' },
                atletismo: { estado: false, fechaInicio: null, fechaFin: null }
            }
        };
        mockAuthContext.updateUser.mockResolvedValue({ status: 200, data: { message: 'User updated' } });
    });

    it("renders component with user data and abono information when user is logged in", () => {
        render(<MisAbonos />);
        expect(screen.getByRole("heading", { name: /mis abonos/i })).toBeInTheDocument();
        const userElements = screen.getAllByText(/Usuario: Test User/i);
        expect(userElements.length).toBe(2);
        expect(userElements[0]).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /GIMNASIO MENSUAL/i })).toBeInTheDocument();
        expect(screen.getByText(/abono activo/i)).toBeInTheDocument();
        expect(screen.getByText(/fecha inicio: 2024-01-01/i)).toBeInTheDocument();
        expect(screen.getByText(/fecha caducidad: 2024-01-31/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:first-child button' })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /ATLETISMO MENSUAL/i })).toBeInTheDocument();
        expect(screen.getByText(/abono inactivo/i)).toBeInTheDocument();
    });

    it("renders 'Debes iniciar sesión para acceder a tus abonos' message when user is not logged in", () => {
        mockAuthContext.user = null;
        useAuth.mockReturnValue(mockAuthContext);
        render(<MisAbonos />);
        expect(screen.getByText(/debes iniciar sesión para acceder a tus abonos/i)).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /mis abonos/i })).toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /GIMNASIO MENSUAL/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("heading", { name: /ATLETISMO MENSUAL/i })).not.toBeInTheDocument();
    });

    it("displays 'Abono activo' and abono details when gimnasio abono is activo", () => {
        render(<MisAbonos />);
        const gimnasioCardHeading = screen.getByRole('heading', { name: /gimnasio mensual/i });
        const gimnasioCard = gimnasioCardHeading.closest('.card');
    
        expect(gimnasioCard).toBeInTheDocument();
        expect(within(gimnasioCard).getByText(/abono activo/i)).toBeInTheDocument();
        expect(within(gimnasioCard).getByText(/fecha inicio: 2024-01-01/i)).toBeInTheDocument();
        expect(within(gimnasioCard).getByText(/fecha caducidad: 2024-01-31/i)).toBeInTheDocument();
    });

    it("displays 'Abono inactivo' when atletismo abono is inactivo", () => {
        render(<MisAbonos />);
        const atletismoCardHeading = screen.getByRole('heading', { name: /atletismo mensual/i });
        const atletismoCard = atletismoCardHeading.closest('.card');
        expect(atletismoCard).toBeInTheDocument();
        expect(within(atletismoCard).getByText(/abono inactivo/i)).toBeInTheDocument();
    });

    describe("Handle Baja Gimnasio", () => {
        it("calls updateUser with correct gimnasio alta data when 'Darme de baja' button for gimnasio is clicked", async () => {
            render(<MisAbonos />);
            const bajaGimnasioButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:first-child button' });
            fireEvent.click(bajaGimnasioButton);

            await waitFor(() => {
                expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', {
                    _id: '123',
                    name: 'Test User',
                    email: 'test@example.com',
                    alta: {
                        gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                        atletismo: { estado: false, fechaInicio: null, fechaFin: null }
                    }
                });
            });
        });

        it("shows success message when gimnasio baja is successful", async () => {
            render(<MisAbonos />);
            const bajaGimnasioButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:first-child button' });
            fireEvent.click(bajaGimnasioButton);

            await waitFor(() => {
                expect(screen.getByText(/baja completada con éxito!/i, { selector: 'div.card:first-child .success-message' })).toBeInTheDocument();
            });
        });

        it("shows error message when gimnasio baja fails", async () => {
            mockAuthContext.updateUser.mockRejectedValue(new Error("Update error"));
            render(<MisAbonos />);
            const bajaGimnasioButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:first-child button' });
            fireEvent.click(bajaGimnasioButton);

            await waitFor(() => {
                expect(screen.getByText(/se ha producido un error al dar de baja./i, { selector: 'div.card:first-child .error-message' })).toBeInTheDocument();
            });
        });
    });

    describe("Handle Baja Atletismo", () => {
        it("calls updateUser with correct atletismo alta data when 'Darme de baja' button for atletismo is clicked", async () => {
            mockAuthContext.user = {
                _id: '123',
                name: 'Test User',
                email: 'test@example.com',
                alta: {
                    gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                    atletismo: { estado: true, fechaInicio: '2024-01-01', fechaFin: '2024-01-31' },
                }
            };
            mockAuthContext.updateUser.mockResolvedValue({ status: 200, data: { message: 'User updated' } });
            render(<MisAbonos />);
            const bajaAtletismoButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:nth-child(2) button' });
            fireEvent.click(bajaAtletismoButton);

            await waitFor(() => {
                expect(mockAuthContext.updateUser).toHaveBeenCalledWith('123', {
                    _id: '123',
                    name: 'Test User',
                    email: 'test@example.com',
                    alta: {
                        gimnasio: { estado: false, fechaInicio: null, fechaFin: null },
                        atletismo: { estado: false, fechaInicio: null, fechaFin: null }
                    }
                });
            });
        });

        it("shows success message when atletismo baja is successful", async () => {
            render(<MisAbonos />);
            const bajaAtletismoButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:nth-child(2) button' });
            fireEvent.click(bajaAtletismoButton);

            await waitFor(() => {
                expect(screen.getByText(/baja completada con éxito!/i, { selector: 'div.card:nth-child(2) .success-message' })).toBeInTheDocument();
            });
        });

        it("shows error message when atletismo baja fails", async () => {
            mockAuthContext.updateUser.mockRejectedValue(new Error("Update error"));
            render(<MisAbonos />);
            const bajaAtletismoButton = screen.getByRole("button", { name: /darme de baja/i, selector: 'div.card:nth-child(2) button' });
            fireEvent.click(bajaAtletismoButton);

            await waitFor(() => {
                expect(screen.getByText(/se ha producido un error al dar de baja./i, { selector: 'div.card:nth-child(2) .error-message' })).toBeInTheDocument();
            });
        });
    });
});