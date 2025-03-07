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
        it("renders the component in 'Añadir usuario' mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            expect(screen.getByRole('heading', { name: /Añadir usuario/i })).toBeInTheDocument();
        });

        it("renders the component in 'Editar usuario' mode", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{ name: 'Test User', email: 'test@example.com' }} />);
            expect(screen.getByRole('heading', { name: /Editar usuario/i })).toBeInTheDocument();
        });

        it("renders all form fields for new user", () => {
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

        it("renders all form fields for edit user (without password)", () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{}} />);
            expect(screen.getByLabelText(/Nombre:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
            expect(screen.queryByLabelText(/Contraseña:/i)).not.toBeInTheDocument(); // Password field should not be present in edit mode
            expect(screen.getByLabelText(/Rol:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Saldo:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Gimnasio:/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/Atletismo:/i)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeInTheDocument();
        });


        it("fills in initial values when in 'Editar usuario' mode", () => {
            const popupData = {
                name: 'Existing User',
                email: 'existing@example.com',
                role: 'admin',
                saldo: 100,
                alta: {
                    gimnasio: { estado: true },
                    atletismo: { estado: false }
                }
            };
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
        it("shows error message for empty Nombre field", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el nombre/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Email field", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce el email/i)).toBeInTheDocument();
            });
        });

        it("shows error message for empty Password field when isNewUser is true", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/Por favor, introduce una contraseña/i)).toBeInTheDocument();
            });
        });

        it("shows error message for short Password field when isNewUser is true", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: '123' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/La contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument();
            });
        });

        it("shows error message for negative Saldo", async () => {
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '-10' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));
            await waitFor(() => {
                expect(screen.getByText(/El saldo no puede ser negativo/i)).toBeInTheDocument();
            });
        });
    });

    describe("Form Submission and API Calls", () => {
        it("calls addUser on valid submit in 'Añadir usuario' mode and shows success message", async () => {
            mockAuthContext.addUser.mockResolvedValue({ ok: true, status: 200 });
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'New User' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password123' } });
            fireEvent.change(screen.getByLabelText(/Rol:/i), { target: { value: 'admin' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '50' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockAuthContext.addUser).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(screen.getByText(/Usuario añadido correctamente/i)).toBeInTheDocument();
            });
        });

        it("calls updateUser on valid submit in 'Editar usuario' mode and closes modal", async () => {
            mockAuthContext.updateUser.mockResolvedValue({ status: 200 });
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Updated User' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'updateduser@example.com' } });
            fireEvent.change(screen.getByLabelText(/Rol:/i), { target: { value: 'user' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '75' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(mockAuthContext.updateUser).toHaveBeenCalledTimes(1);
            });
            await waitFor(() => {
                expect(mockCloseModal).toHaveBeenCalledTimes(1);
            });
        });

        it("shows error message if addUser fails (general error)", async () => {
            mockAuthContext.addUser.mockResolvedValue({ ok: false, status: 500 });
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'New User' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'newuser@example.com' } });
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password123' } });
            fireEvent.change(screen.getByLabelText(/Rol:/i), { target: { value: 'admin' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '50' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Ocurrió un error al añadir el usuario./i)).toBeInTheDocument();
            });
        });

        it("shows error message if updateUser fails", async () => {
            mockAuthContext.updateUser.mockResolvedValue({ status: 400 });
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={false} popupData={{ _id: '1' }} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'Updated User' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'updateduser@example.com' } });
            fireEvent.change(screen.getByLabelText(/Rol:/i), { target: { value: 'user' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '75' } });
            fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

            await waitFor(() => {
                expect(screen.getByText(/Ocurrió un error al editar el usuario./i)).toBeInTheDocument();
            });
        });

        it("shows error message if addUser returns 409 (email already registered)", async () => {
            mockAuthContext.addUser.mockResolvedValue({ status: 409 });
            render(<AdminModalUsers closeModal={mockCloseModal} isNewUser={true} />);

            fireEvent.change(screen.getByLabelText(/Nombre:/i), { target: { value: 'New User' } });
            fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'existing@example.com' } }); // Use existing email
            fireEvent.change(screen.getByLabelText(/Contraseña:/i), { target: { value: 'password123' } });
            fireEvent.change(screen.getByLabelText(/Rol:/i), { target: { value: 'admin' } });
            fireEvent.change(screen.getByLabelText(/Saldo:/i), { target: { value: '50' } });
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