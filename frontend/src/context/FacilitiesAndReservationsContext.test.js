// FacilitiesAndReservationsContext.test.js
import { render, waitFor, act } from "@testing-library/react";
import { FacilitiesAndReservationsProvider, useFacilitiesAndReservations } from "../context/FacilitiesAndReservationsContext";

// Mock de fetch global para simular las llamadas a la API
global.fetch = jest.fn();

const TestComponent = ({ callback }) => {
    const context = useFacilitiesAndReservations();
    callback(context);
    return null;
};

describe("FacilitiesAndReservationsProvider", () => {
    let contextValues;

    beforeEach(() => {
        jest.clearAllMocks();
        contextValues = null;

        render(
            <FacilitiesAndReservationsProvider>
                <TestComponent callback={(values) => (contextValues = values)} />
            </FacilitiesAndReservationsProvider>
        );
    });

    afterEach(() => {
        fetch.mockReset();
    });

    test("debería proporcionar valores iniciales por defecto", () => {
        expect(contextValues.instalaciones).toEqual([]);
        expect(contextValues.reservas).toEqual([]);
        expect(typeof contextValues.getAllFacilities).toBe("function");
        expect(typeof contextValues.getAllReservations).toBe("function");
        expect(typeof contextValues.addReservation).toBe("function");
        expect(typeof contextValues.addFacility).toBe("function");
        expect(typeof contextValues.updateReservation).toBe("function");
        expect(typeof contextValues.updateFacility).toBe("function");
        expect(typeof contextValues.deleteReservation).toBe("function");
        expect(typeof contextValues.deleteFacility).toBe("function");
        expect(typeof contextValues.getInstalacion).toBe("function");
        expect(typeof contextValues.contarReservasPorFranjaHoraria).toBe("function");
    });

    describe("getAllFacilities", () => {
        it("debería obtener la lista de instalaciones correctamente", async () => {
            const mockFacilities = [{ _id: "1", name: "Facility 1" }, { _id: "2", name: "Facility 2" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockFacilities,
            });

            let facilities;
            await act(async () => {
                facilities = await contextValues.getAllFacilities();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/instalaciones"
                );
                expect(contextValues.instalaciones).toEqual(mockFacilities);
                expect(facilities).toEqual(mockFacilities);
            });
        });

        it("debería manejar errores al obtener la lista de instalaciones", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            console.error = jest.fn(); // Mock console.error to avoid noise in test output

            await act(async () => {
                await contextValues.getAllFacilities();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.instalaciones).toEqual([]); // Instalaciones should remain empty
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al obtener instalaciones", async () => {
            jest.clearAllMocks();
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn(); // Mock console.error

            await act(async () => {
                await contextValues.getAllFacilities();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
                expect(contextValues.instalaciones).toEqual([]);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería ejecutar el bloque 'else' si la API devuelve un estado incorrecto", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
            });
    
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
            await act(async () => {
                await contextValues.getAllFacilities();
            });
    
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "Error al obtener la lista de instalaciones:", 403
                );
                expect(contextValues.instalaciones).toEqual([]);
            });
    
            consoleErrorSpy.mockRestore();
        });
    });

    describe("getAllReservations", () => {
        it("debería obtener la lista de reservas correctamente", async () => {
            const mockReservations = [{ _id: "1", facilityId: "1", date: "2024-01-01" }, { _id: "2", facilityId: "2", date: "2024-01-02" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockReservations,
            });

            let reservations;
            await act(async () => {
                reservations = await contextValues.getAllReservations();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservas"
                );
                expect(contextValues.reservas).toEqual(mockReservations);
                expect(reservations).toEqual(mockReservations);
            });
        });

        it("debería manejar errores al obtener la lista de reservas", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            await act(async () => {
                await contextValues.getAllReservations();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservas).toEqual([]); // Reservas should remain empty
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al obtener reservas", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.getAllReservations();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservas).toEqual([]);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería ejecutar el bloque 'else' si la API devuelve un estado incorrecto", async () => {
            jest.clearAllMocks();
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
    
            const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
            await act(async () => {
                await contextValues.getAllReservations();
            });
    
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
                expect(consoleErrorSpy).toHaveBeenCalledWith(
                    "Error al obtener la lista de reservas:", 404
                );
                expect(contextValues.reservas).toEqual([]);
            });
    
            consoleErrorSpy.mockRestore();
        });
    });

    describe("addReservation", () => {
        it("debería agregar una reserva correctamente", async () => {
            const mockReservation = { _id: "3", facilityId: "1", date: "2024-01-03" };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockReservation,
            });

            const newReservation = { facilityId: "1", date: "2024-01-03" };
            await act(async () => {
                await contextValues.addReservation(newReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservas",
                    expect.anything()
                );
                expect(contextValues.reservas).toContainEqual(mockReservation);
            });
        });

        it("debería manejar errores al agregar una reserva", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            const newReservation = { facilityId: "1", date: "2024-01-03" };
            await act(async () => {
                await contextValues.addReservation(newReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservas).toEqual([]); //Reservas should not be updated in case of error. It is re-fetched on mount.
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al agregar una reserva", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const newReservation = { facilityId: "1", date: "2024-01-03" };
            await act(async () => {
                await contextValues.addReservation(newReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservas).toEqual([]); //Reservas should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("addFacility", () => {
        it("debería agregar una instalación correctamente", async () => {
            const mockFacility = { _id: "3", name: "New Facility" };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockFacility,
            });

            const newFacility = { name: "New Facility" };
            await act(async () => {
                await contextValues.addFacility(newFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/instalaciones",
                    expect.anything()
                );
                expect(contextValues.instalaciones).toContainEqual(mockFacility);
            });
        });

        it("debería manejar errores al agregar una instalación", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            const newFacility = { name: "New Facility" };
            await act(async () => {
                await contextValues.addFacility(newFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.instalaciones).toEqual([]); // Instalaciones should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al agregar una instalación", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const newFacility = { name: "New Facility" };
            await act(async () => {
                await contextValues.addFacility(newFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.instalaciones).toEqual([]); // Instalaciones should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("updateReservation", () => {
        it("debería actualizar una reserva correctamente", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            const updatedReservation = { date: "2024-01-04" };
            await act(async () => {
                await contextValues.updateReservation("1", updatedReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservas/1",
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al actualizar una reserva", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            const updatedReservation = { date: "2024-01-04" };
            await act(async () => {
                await contextValues.updateReservation("1", updatedReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al actualizar una reserva", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const updatedReservation = { date: "2024-01-04" };
            await act(async () => {
                await contextValues.updateReservation("1", updatedReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("updateFacility", () => {
        it("debería actualizar una instalación correctamente", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            const updatedFacility = { name: "Updated Facility" };
            await act(async () => {
                await contextValues.updateFacility("1", updatedFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/instalaciones/1",
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al actualizar una instalación", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            const updatedFacility = { name: "Updated Facility" };
            await act(async () => {
                await contextValues.updateFacility("1", updatedFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al actualizar una instalación", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const updatedFacility = { name: "Updated Facility" };
            await act(async () => {
                await contextValues.updateFacility("1", updatedFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("deleteReservation", () => {
        it("debería eliminar una reserva correctamente", async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) }); //Simulating refetch returns empty array

            await act(async () => {
                await contextValues.deleteReservation("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservas/1",
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al eliminar una reserva", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            await act(async () => {
                await contextValues.deleteReservation("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al eliminar una reserva", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.deleteReservation("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("deleteFacility", () => {
        it("debería eliminar una instalación correctamente", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteFacility("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/instalaciones/1",
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al eliminar una instalación", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });
            console.error = jest.fn();

            await act(async () => {
                await contextValues.deleteFacility("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al eliminar una instalación", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.deleteFacility("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("getInstalacion", () => {
        it("debería retornar undefined si la instalación no se encuentra en el estado local", async () => {
            contextValues.instalaciones = [{ _id: "1", name: "Facility 1" }];

            const facility = await contextValues.getInstalacion("2");

            expect(facility).toBeUndefined();
        });

        it("debería retornar la instalación correcta si existe en el estado local", async () => {
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => [
                    { _id: "1", name: "Facility 1" },
                    { _id: "2", name: "Facility 2" },
                ],
            });
    
            await act(async () => {
                await contextValues.getAllFacilities();
            });
    
            await waitFor(() => {
                expect(contextValues.instalaciones).toEqual([
                    { _id: "1", name: "Facility 1" },
                    { _id: "2", name: "Facility 2" },
                ]);
            });
    
            await act(async () => {
                const facility = await contextValues.getInstalacion("2");
                expect(facility).toEqual({ _id: "2", name: "Facility 2" });
            });
        });
    
        it("debería retornar undefined si la instalación no se encuentra en el estado local", async () => {
            jest.spyOn(contextValues, "getAllFacilities").mockImplementation(async () => {
                contextValues.instalaciones = [{ _id: "1", name: "Facility 1" }];
            });
    
            await act(async () => {
                await contextValues.getAllFacilities();
            });
    
            const facility = await contextValues.getInstalacion("2");
            expect(facility).toBeUndefined();
        });
    });

    describe("contarReservasPorFranjaHoraria", () => {
        it("debería retornar 0 si no hay reservas para la franja horaria especificada", async () => {
            const initDate = new Date(2024, 0, 1, 10, 0);
            contextValues.reservas = [];

            const count = await contextValues.contarReservasPorFranjaHoraria("1", initDate);

            expect(count).toBe(0);
        });
    });
});
