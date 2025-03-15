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

    it("should get an instalacion", async () => {
        const instalacion = await facilitiesReservationsValues.getInstalacion('1');
        expect(instalacion).toEqual({ _id: '1', name: 'Gimnasio' });
        expect(mockFacilitiesAndReservationsContext.getInstalacion).toHaveBeenCalledWith('1');
    });

    it("should get all facilities", async () => {
        const instalaciones = await facilitiesReservationsValues.getAllFacilities();
        expect(instalaciones).toEqual([{ _id: '1', name: 'Gimnasio' }]);
        expect(mockFacilitiesAndReservationsContext.getAllFacilities).toHaveBeenCalled();
    });

    it("should get all reservations", async () => {
        const reservations = await facilitiesReservationsValues.getAllReservations();
        expect(reservations).toEqual([{ _id: '1', instalacionId: '1' }]);
        expect(mockFacilitiesAndReservationsContext.getAllReservations).toHaveBeenCalled();
    });

    it("should add a new reservation", async () => {
        const response = await facilitiesReservationsValues.addReservation({ instalacionId: '1', fechaInicio: testDate });
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.addReservation).toHaveBeenCalled();
    });

    it("should add a new facility", async () => {
        const response = await facilitiesReservationsValues.addFacility({ name: 'Pista de Tenis' });
        expect(response.name).toBe('Pista de Tenis');
        expect(mockFacilitiesAndReservationsContext.addFacility).toHaveBeenCalledWith({ name: 'Pista de Tenis' });
    });

    it("should update a reservation", async () => {
        const response = await facilitiesReservationsValues.updateReservation('1', { instalacionId: '2', fechaInicio: testDate });
        expect(response.ok).toBe(true);
        expect(mockFacilitiesAndReservationsContext.updateReservation).toHaveBeenCalledWith('1', { instalacionId: '2', fechaInicio: testDate });
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
        const fechaInicio = testDate;
        const count = await facilitiesReservationsValues.contarReservasPorFranjaHoraria('1', fechaInicio);
        expect(count).toBe(2);
        expect(mockFacilitiesAndReservationsContext.contarReservasPorFranjaHoraria).toHaveBeenCalledWith('1', fechaInicio);
    });
});

const TestComponent = ({ callback }) => {
    const values = useFacilitiesAndReservations();
    callback(values);
    return null;
};