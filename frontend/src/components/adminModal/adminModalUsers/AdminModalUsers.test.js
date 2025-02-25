import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminModalUsers from "./AdminModalUsers";
import { useAuth } from "../../../context/AuthContext";
import { mockAuthContext } from "../../../utils/mocks";

jest.mock('../../../context/AuthContext', () => ({
    useAuth: jest.fn()
}));

const mockCloseModal = jest.fn();

describe("AdminModalUsers Component", () => {
    beforeEach(() => {
        useAuth.mockReturnValue(mockAuthContext);
        jest.clearAllMocks();
    });

    describe("Rendering and Initial Display", () => {
        it("renders the component in Add User mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            expect(screen.getByRole('heading', { name: /Añadir usuario/i })).toBeInTheDocument();
        });

        it("renders the component in Edit User mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{ name: 'Test User', email: 'test@example.com' }} />);
            expect(screen.getByRole('heading', { name: /Editar usuario/i })).toBeInTheDocument();
        });

        it("renders all form fields", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            expect(screen.getByLabelText(/Nombre:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Contraseña:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Rol:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Saldo:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Gimnasio:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Atletismo:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
        });

        it("renders password field in Add User mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            expect(screen.getByLabelText(/Contraseña:/i)).toBeInTheDocument();
        });
        
        it("does not render password field in Edit User mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{}} />);
            expect(screen.queryByLabelText(/Contraseña:/i)).not.toBeInTheDocument();
        });

        it("fills in initial values when in Edit User mode", () => {
            const popupData = { name: 'Existing User', email: 'existing@example.com', role: 'admin', saldo: 100, alta: { gimnasio: { estado: true }, atletismo: { estado: false } } };
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={popupData} />);
            expect(screen.getByLabelText(/Nombre:/i)).toHaveValue(popupData.name);
            expect(screen.getByLabelText(/Email:/i)).toHaveValue(popupData.email);
            expect(screen.getByLabelText(/Rol:/i)).toHaveValue(popupData.role);
            expect(screen.getByLabelText(/Saldo:/i)).toHaveValue(popupData.saldo);
            expect(screen.getByLabelText(/Gimnasio:/i)).toBeChecked();
            expect(screen.getByLabelText(/Atletismo:/i)).not.toBeChecked();
        });
    });

    describe("Input Validation and Error Messages", () => {
        it("shows error message for empty name field", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el nombre/i)).toBeInTheDocument();
            });
        });

        it("shows error message for invalid email field", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: '' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el email/i)).toBeInTheDocument();
            });
        });

        it("shows error message for short password in Add User mode", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'short' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative saldo", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '-10' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/El saldo no puede ser negativo/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addUser and handleAdmin for new user creation on valid submit", async () => {
            mockAuthContext.addUser.mockResolvedValue({ ok: true, status: 200 });
            mockAuthContext.handleAdmin.mockReturnValue({ name: 'Test Name', email: 'test@example.com', password: 'password123', role: 'user', saldo: 100, alta: { gimnasio: { estado: false }, atletismo: { estado: false } } });

            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Test Name' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password123' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '100' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockAuthContext.addUser).toHaveBeenCalledTimes(1);
                expect(mockAuthContext.handleAdmin).toHaveBeenCalledTimes(1);
                expect(screen.getByText(/Usuario añadido correctamente/i)).toBeInTheDocument();
            });
        });

        it("calls updateUser for existing user update on valid submit", async () => {
            mockAuthContext.updateUser.mockResolvedValue({ status: 200 });
            render(
                <AdminModalUsers 
                    closeModal={mockCloseModal}
                    isNewUser={false}
                    popupData={{
                        _id: 'someUserId',
                        name: 'testName1',
                        email: 'test@email.com',
                        password:'123',
                        alta: {gimnasio: { estado: false}, atletismo: { estado: false }},
                        role: 'admin',
                        saldo: 100,
                    }}
                />
            );
            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Updated Name' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
                expect(mockAuthContext.updateUser).toHaveBeenCalledWith('someUserId', expect.anything());
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
        });

        it("shows error message if addUser returns 409 (email conflict)", async () => {
            mockAuthContext.addUser.mockResolvedValue({ status: 409 });
            mockAuthContext.handleAdmin.mockReturnValue({ 
                name: 'Test Name',
                email: 'test@example.com',
                password: 'password123',
                role: 'user',
                saldo: 100,
                alta: { gimnasio: { estado: false }, atletismo: { estado: false }}
            });

            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Test Name' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@example.com' } });
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password123' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '100' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/El correo ya está registrado. Por favor, usa uno diferente./i)).toBeInTheDocument();
            });
        });
    });

    describe("Modal Close Functionality", () => {
        it("calls closeModal function when close button is clicked", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.click(document.querySelector('#close-menu'));
            expect(mockCloseModal).toHaveBeenCalledTimes(1);
        });
    });
});