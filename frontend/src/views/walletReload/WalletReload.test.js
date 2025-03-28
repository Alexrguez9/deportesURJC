import { render } from "@testing-library/react";
import { FacilitiesAndReservationsProvider, useFacilitiesAndReservations } from "../../context/FacilitiesAndReservationsContext";
import { mockFacilitiesAndReservationsContext } from "../../utils/mocks";

jest.mock("../../context/FacilitiesAndReservationsContext", () => ({
    useFacilitiesAndReservations: jest.fn(),
    FacilitiesAndReservationsProvider: ({ children }) => <div>{children}</div>
}));

describe("FacilitiesAndReservationsContext", () => {
    let facilitiesReservationsValues;
    let testDate; 

    beforeEach(() => {
        jest.clearAllMocks();
        facilitiesReservationsValues = null;
        useFacilitiesAndReservations.mockReturnValue(mockFacilitiesAndReservationsContext);
        testDate = new Date("2025-02-22T10:51:18.200Z");

        render(
            <FacilitiesAndReservationsProvider>
                <TestComponent callback={(values) => (facilitiesReservationsValues = values)} />
            </FacilitiesAndReservationsProvider>
        );
    });

    it("should get an facility", async () => {
        const facility = await facilitiesReservationsValues.getFacility('1');
        expect(facility).toEqual({ _id: '1', name: 'Gimnasio' });
        expect(mockFacilitiesAndReservationsContext.getFacility).toHaveBeenCalledWith('1');
    });

    it("should get all facilities", async () => {
        const facilities = await facilitiesReservationsValues.getAllFacilities();
        expect(facilities).toEqual([{ _id: '1', name: 'Gimnasio' }]);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalled();
    });

    it("should get all reservations", async () => {
        const reservations = await facilitiesReservationsValues.getAllReservations();
        expect(reservations).toEqual([{ _id: '1', facilityId: '1' }]);
        expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalled();
    });

    it("should add a new reservation", async () => {
        const response = await facilitiesReservationsValues.addReservation({ facilityId: '1', initDate: testDate });
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalled();
    });

    it("should add a new facility", async () => {
        const response = await facilitiesReservationsValues.addFacility({ name: 'Pista de Tenis' });
        expect(response.name).toBe('Pista de Tenis');
        expect(mockFacilitiesAndReservationsContext.addFacility).toHaveBeenCalledWith({ name: 'Pista de Tenis' });
    });

    it("should update a reservation", async () => {
        const response = await facilitiesReservationsValues.updateReservation('1', { facilityId: '2', initDate: testDate });
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.updateReservation).toHaveBeenCalledWith('1', { facilityId: '2', initDate: testDate });
    });

    it("should update a facility", async () => {
        const response = await facilitiesReservationsValues.updateFacility('1', { name: 'Gimnasio Cubierto' });
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.updateFacility).toHaveBeenCalledWith('1', { name: 'Gimnasio Cubierto' });
    });

    it("should delete a reservation", async () => {
        const response = await facilitiesReservationsValues.deleteReservation('1');
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.deleteReservation).toHaveBeenCalledWith('1');
    });

    it("should delete a facility", async () => {
        const response = await facilitiesReservationsValues.deleteFacility('1');
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.deleteFacility).toHaveBeenCalledWith('1');
    });

    it("should count reservations by time slot", async () => {
        const initDate = testDate;
        const count = await facilitiesReservationsValues.countReservationsByTimeSlot('1', initDate);
        expect(count).toBe(2);
        expect(mockFacilitiesAndReservationsContext.countReservationsByTimeSlot).toHaveBeenCalledWith('1', initDate);
    });
});

const TestComponent = ({ callback }) => {
    const values = useFacilitiesAndReservations();
    callback(values);
    return null;
};