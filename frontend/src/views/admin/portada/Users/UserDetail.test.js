import React from 'react';
import { render, screen, waitFor } from "@testing-library/react";
import UserDetail from "./UserDetail";
import { useAuth } from "../../../../context/AuthContext";
import { useParams, BrowserRouter } from "react-router-dom";
import { mockAuthContext } from "../../../../utils/mocks";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useParams: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

describe("UserDetail Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
    });

    it("renders loading spinner initially", async () => {
        useParams.mockReturnValue({ id: '1' });
        mockAuthContext.getAllUsers.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 50)));
        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );
        await waitFor(() => {
            expect(screen.getByRole('progressbar')).toBeInTheDocument(); // Use getByRole('progressbar')
        });
    });

    it("fetches users and displays user details correctly when user is found", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test User", email: "test@user.com", role: "user", alta: { gimnasio: { estado: true, fechaInicio: '2024-01-01', fechaFin: '2024-12-31' }, atletismo: { estado: false } }, saldo: 50 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Detalles del Usuario")).toBeInTheDocument();
            expect(screen.getByText(`ID:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser._id)).toBeInTheDocument();
            expect(screen.getByText(`Nombre:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser.name)).toBeInTheDocument();
            expect(screen.getByText(`Email:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser.email)).toBeInTheDocument();
            expect(screen.getByText(`Rol:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser.role)).toBeInTheDocument();
            expect(screen.getByText(`Alta GYM:`)).toBeInTheDocument();
            expect(screen.getByText("Sí")).toBeInTheDocument();
            expect(screen.getByText(`Inicio GYM:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser.alta.gimnasio.fechaInicio)).toBeInTheDocument();
            expect(screen.getByText(`Fin GYM:`)).toBeInTheDocument();
            expect(screen.getByText(mockUser.alta.gimnasio.fechaFin)).toBeInTheDocument();
            expect(screen.getByText(`Alta Atletismo:`)).toBeInTheDocument();
            expect(screen.getByText("No")).toBeInTheDocument();
            expect(screen.getByText(`Saldo:`)).toBeInTheDocument();
            expect(screen.getByText(`${mockUser.saldo} €`)).toBeInTheDocument();
        });
    });

    it("displays 'Usuario no encontrado.' message when user is not found", async () => {
        useParams.mockReturnValue({ id: 'non-existent-id' });
        mockAuthContext.getAllUsers.mockResolvedValue([
            { _id: "1", name: "User 1", email: "user1@test.com", role: "user", alta: {}, saldo: 10 }
        ]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Usuario no encontrado.")).toBeInTheDocument();
        });
    });

    it("displays 'Usuario no encontrado.' message when getAllUsers returns empty array", async () => {
        useParams.mockReturnValue({ id: '1' });
        mockAuthContext.getAllUsers.mockResolvedValue([]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Usuario no encontrado.")).toBeInTheDocument();
        });
    });

    it("displays 'No' when alta.gimnasio.estado is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test User", email: "test@user.com", role: "user", alta: { gimnasio: { estado: false } }, saldo: 50 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            const altaGymLabel = screen.getByText(`Alta GYM:`);
            expect(altaGymLabel.nextElementSibling).toHaveTextContent("No"); // Using nextElementSibling to get specific 'No'
        });
    });

    it("displays 'No' when alta.atletismo.estado is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test User", email: "test@user.com", role: "user", alta: { atletismo: { estado: false } }, saldo: 50 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            const altaAtletismoLabel = screen.getByText(`Alta Atletismo:`);
            expect(altaAtletismoLabel.nextElementSibling).toHaveTextContent("No"); // Using nextElementSibling to get specific 'No'
        });
    });

    it("does not display GYM start and end dates if alta.gimnasio.estado is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test User", email: "test@user.com", role: "user", alta: { gimnasio: { estado: false } }, saldo: 50 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(`Inicio GYM:`)).not.toBeInTheDocument();
            expect(screen.queryByText(`Fin GYM:`)).not.toBeInTheDocument();
        });
    });

    it("does not display Atletismo start and end dates if alta.atletismo.estado is false", async () => {
        useParams.mockReturnValue({ id: '1' });
        const mockUser = { _id: "1", name: "Test User", email: "test@user.com", role: "user", alta: { atletismo: { estado: false } }, saldo: 50 };
        mockAuthContext.getAllUsers.mockResolvedValue([mockUser]);

        render(
            <BrowserRouter>
                <UserDetail />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.queryByText(`Inicio Atletismo:`)).not.toBeInTheDocument();
            expect(screen.queryByText(`Fin Atletismo:`)).not.toBeInTheDocument();
        });
    });
});