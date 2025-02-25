import React from 'react';
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminFacilities from "./AdminFacilities";
import { useAuth } from "../../../../context/AuthContext";
import { useFacilitiesAndReservations } from "../../../../context/FacilitiesAndReservationsContext";
import { mockAuthContext, mockFacilitiesAndReservationsContext } from "../../../../utils/mocks";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual("react-router-dom"),
    useNavigate: jest.fn(),
}));

jest.mock("../../../../context/AuthContext", () => ({
    useAuth: jest.fn()
}));

jest.mock("../../../../context/FacilitiesAndReservationsContext", () => ({
    useFacilitiesAndReservations: jest.fn()
}));

describe("AdminFacilities Component", () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        useAuth.mockReturnValue(mockAuthContext);
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        require("react-router-dom").useNavigate.mockReturnValue(mockNavigate);

        mockAuthContext.isAdmin.mockReturnValue(true);
        mockAuthContext.user = { name: "Admin" };
        mockFacilitiesAndReservationsContext.getAllFacilities.mockClear();
        mockFacilitiesAndReservationsContext.deleteFacility.mockClear();

        const mockFacilitiesData = [
            {
                _id: "facility001",
                nombre: "Facility 1",
                descripcion: "Description 1",
                capacidad: 10,
                precioPorMediaHora: 25,
            },
            {
                _id: "facility002",
                nombre: "Facility 2",
                descripcion: "Description 2",
                capacidad: 20,
                precioPorMediaHora: 50,
            },
        ];
        mockFacilitiesAndReservationsContext.getAllFacilities.mockResolvedValue(mockFacilitiesData);
    });

    it("renders correctly and fetches facilities on admin login", async () => {
        render(<AdminFacilities />);

        expect(screen.getByText("Instalaciones")).toBeInTheDocument();
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalled();
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        expect(screen.getByText("Description 1")).toBeInTheDocument();
    });

    it("shows loading spinner while fetching facilities", async () => {
        mockFacilitiesAndReservationsContext.getAllFacilities.mockImplementationOnce(() => {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockFacilitiesAndReservationsContext.facilities);
                }, 50);
            });
        });

        render(<AdminFacilities />);
        expect(document.querySelector(".spinner")).toBeInTheDocument();
        await waitFor(() => expect(document.querySelector(".spinner")).not.toBeInTheDocument(), { timeout: 100 });
        expect(screen.getByText("Instalaciones")).toBeInTheDocument();
    });

    it("opens modal to add a new facility", () => {
        render(<AdminFacilities />);
        const addButton = document.querySelector(".iconPlus");
        fireEvent.click(addButton);

        expect(screen.getByText("Nueva instalación")).toBeInTheDocument();
    });

    it("opens modal to edit a facility", async () => {
        render(<AdminFacilities />);

        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        const editButton = document.querySelector(".editPencil");
        fireEvent.click(editButton);
        expect(screen.getByText("Editar instalación")).toBeInTheDocument();
    });

    it("closes modal and refetches facilities", async () => {
        render(<AdminFacilities />);
        fireEvent.click(document.querySelector(".iconPlus"));

        expect(screen.getByText("Nueva instalación")).toBeInTheDocument();

        const closeButton = document.querySelector("#close-menu"); // Assuming AdminModalFacilities has the same close button ID
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText("Nueva instalación")).not.toBeInTheDocument();
            expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(2);
        });
    });

    it("deletes a facility and refetches facilities", async () => {
        render(<AdminFacilities />);
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());
        const deleteButtons = document.querySelectorAll(".deleteTrash");
        const deleteButton = deleteButtons[0];
        fireEvent.click(deleteButton);

        expect(mockFacilitiesAndReservationsContext.deleteFacility).toHaveBeenCalledWith("facility001");
        await waitFor(() => expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(2)); // Initial fetch + fetch on delete
    });


    it("shows AccessDenied if user is not an admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);

        render(<AdminFacilities />);
        const heading = screen.getByRole("heading", { level: 1, name: "Acceso denegado" });

        expect(heading).toBeInTheDocument();
        expect(screen.queryByText("Instalaciones")).not.toBeInTheDocument(); // Ensure facilities table is not rendered
    });

    it("renders BackButton component", () => {
        render(<AdminFacilities />);
        expect(screen.getByRole('button', { name: /Volver/i })).toBeInTheDocument();
    });

    it("displays facility data in table rows", async () => {
        render(<AdminFacilities />);
        await waitFor(() => expect(screen.getByText("Facility 1")).toBeInTheDocument());

        expect(screen.getByText("Facility 1")).toBeInTheDocument();
        expect(screen.getByText("Description 1")).toBeInTheDocument();
        expect(screen.getByText("10")).toBeInTheDocument();
        expect(screen.getByText("25 €")).toBeInTheDocument();

        expect(screen.getByText("Facility 2")).toBeInTheDocument();
        expect(screen.getByText("Description 2")).toBeInTheDocument();
        expect(screen.getByText("20")).toBeInTheDocument();
        expect(screen.getByText("50 €")).toBeInTheDocument();
    });

    it("calls fetchFacilities only once on initial render for admin users", () => {
        render(<AdminFacilities />);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalledTimes(1);
    });

    it("does not fetch facilities if user is not admin", () => {
        mockAuthContext.isAdmin.mockReturnValue(false);
        useAuth.mockReturnValue(mockAuthContext);
        render(<AdminFacilities />);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).not.toHaveBeenCalled();
    });
});