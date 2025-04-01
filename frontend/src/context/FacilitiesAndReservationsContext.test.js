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

    test("should provide default initial values", () => {
        expect(contextValues.facilities).toEqual([]);
        expect(contextValues.reservations).toEqual([]);
        expect(typeof contextValues.getAllFacilities).toBe("function");
        expect(typeof contextValues.getAllReservations).toBe("function");
        expect(typeof contextValues.addReservation).toBe("function");
        expect(typeof contextValues.addFacility).toBe("function");
        expect(typeof contextValues.updateReservation).toBe("function");
        expect(typeof contextValues.updateFacility).toBe("function");
        expect(typeof contextValues.deleteReservation).toBe("function");
        expect(typeof contextValues.deleteFacility).toBe("function");
        expect(typeof contextValues.getFacility).toBe("function");
        expect(typeof contextValues.countReservationsByTimeSlot).toBe("function");
    });

    describe("getAllFacilities", () => {
        it("should fetch facilities list successfully", async () => {
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
                    "http://localhost:4000/facilities"
                );
                expect(contextValues.facilities).toEqual(mockFacilities);
                expect(facilities).toEqual(mockFacilities);
            });
        });

        it("should handle API error when fetching facilities", async () => {
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
                expect(contextValues.facilities).toEqual([]); // Facilities should remain empty
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network error when fetching facilities", async () => {
            jest.clearAllMocks();
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn(); // Mock console.error

            await act(async () => {
                await contextValues.getAllFacilities();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(1);
                expect(contextValues.facilities).toEqual([]);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle non-ok response from API when fetching facilities", async () => {
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
                expect(contextValues.facilities).toEqual([]);
            });
    
            consoleErrorSpy.mockRestore();
        });
    });

    describe("getAllReservations", () => {
        it("should fetch reservations list successfully", async () => {
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
                    "http://localhost:4000/reservations"
                );
                expect(contextValues.reservations).toEqual(mockReservations);
                expect(reservations).toEqual(mockReservations);
            });
        });

        it("should handle API error when fetching reservations", async () => {
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
                expect(contextValues.reservations).toEqual([]); // Reservations should remain empty
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network error when fetching reservations", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.getAllReservations();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservations).toEqual([]);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle non-ok response from API when fetching reservations", async () => {
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
                expect(contextValues.reservations).toEqual([]);
            });
    
            consoleErrorSpy.mockRestore();
        });
    });

    describe("addReservation", () => {
        it("should add a reservation successfully", async () => {
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
                    "http://localhost:4000/reservations",
                    expect.anything()
                );
                expect(contextValues.reservations).toContainEqual(mockReservation);
            });
        });

        it("should handle API error when adding a reservation", async () => {
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
                expect(contextValues.reservations).toEqual([]); //Reservations should not be updated in case of error. It is re-fetched on mount.
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network error when adding a reservation", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const newReservation = { facilityId: "1", date: "2024-01-03" };
            await act(async () => {
                await contextValues.addReservation(newReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.reservations).toEqual([]); //Reservations should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("addFacility", () => {
        it("should add a facility successfully", async () => {
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
                    "http://localhost:4000/facilities",
                    expect.anything()
                );
                expect(contextValues.facilities).toContainEqual(mockFacility);
            });
        });

        it("should handle API error when adding a facility", async () => {
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
                expect(contextValues.facilities).toEqual([]); // Facilities should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network error when adding a facility", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            const newFacility = { name: "New Facility" };
            await act(async () => {
                await contextValues.addFacility(newFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(contextValues.facilities).toEqual([]); // Facilities should not be updated
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("updateReservation", () => {
        it("should update a reservation successfully", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            const updatedReservation = { date: "2024-01-04" };
            await act(async () => {
                await contextValues.updateReservation("1", updatedReservation);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservations/1",
                    expect.anything()
                );
            });
        });

        it("should handle API error when updating a reservation", async () => {
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

        it("should handle network error when updating a reservation", async () => {
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
        it("should update a facility successfully", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            const updatedFacility = { name: "Updated Facility" };
            await act(async () => {
                await contextValues.updateFacility("1", updatedFacility);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/facilities/1",
                    expect.anything()
                );
            });
        });

        it("should handle API error when updating a facility", async () => {
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

        it("should handle network error when updating a facility", async () => {
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
        it("should delete a reservation successfully", async () => {
            fetch.mockResolvedValueOnce({ ok: true, json: async () => ([]) }); //Simulating refetch returns empty array

            await act(async () => {
                await contextValues.deleteReservation("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/reservations/1",
                    expect.anything()
                );
            });
        });

        it("should handle API error when deleting a reservation", async () => {
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

        it("should handle network error when deleting a reservation", async () => {
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
        it("should delete a facility successfully", async () => {
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteFacility("1");
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(4);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/facilities/1",
                    expect.anything()
                );
            });
        });

        it("should handle API error when deleting a facility", async () => {
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

        it("should handle network error when deleting a facility", async () => {
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

    describe("getFacility", () => {
        it("should return undefined if facility is not found in local state", async () => {
            contextValues.facilities = [{ _id: "1", name: "Facility 1" }];
            const facility = await contextValues.getFacility("2");
            expect(facility).toBeUndefined();
        });

        it("should return the correct facility if it exists in local state", async () => {
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
                expect(contextValues.facilities).toEqual([
                    { _id: "1", name: "Facility 1" },
                    { _id: "2", name: "Facility 2" },
                ]);
            });
    
            await act(async () => {
                const facility = await contextValues.getFacility("2");
                expect(facility).toEqual({ _id: "2", name: "Facility 2" });
            });
        });
    
        it("should return undefined if facility is still not found after fetching", async () => {
            jest.spyOn(contextValues, "getAllFacilities").mockImplementation(async () => {
                contextValues.facilities = [{ _id: "1", name: "Facility 1" }];
            });
    
            await act(async () => {
                await contextValues.getAllFacilities();
            });
    
            const facility = await contextValues.getFacility("2");
            expect(facility).toBeUndefined();
        });
    });

    describe("countReservationsByTimeSlot", () => {
        it("should return 0 if there are no reservations for the given time slot", async () => {
            const initDate = new Date(2024, 0, 1, 10, 0);
            contextValues.reservations = [];

            const count = await contextValues.countReservationsByTimeSlot("1", initDate);

            expect(count).toBe(0);
        });
    });
});
