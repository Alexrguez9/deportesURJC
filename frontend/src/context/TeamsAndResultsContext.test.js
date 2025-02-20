import React from "react";
import { render } from "@testing-library/react";
import { TeamsAndResultsProvider, useTeamsAndResults } from "../context/TeamsAndResultsContext";
import { mockTeamsAndResultsContext } from "../utils/mocks";

jest.mock("../context/TeamsAndResultsContext", () => ({
    useTeamsAndResults: jest.fn(),
    TeamsAndResultsProvider: ({ children }) => <div>{children}</div>
}));

describe("TeamsAndResultsContext", () => {
    let teamsResultsValues;

    beforeEach(() => {
        jest.clearAllMocks();
        teamsResultsValues = null;
        useTeamsAndResults.mockReturnValue(mockTeamsAndResultsContext);

        render(
            <TeamsAndResultsProvider>
                <TestComponent callback={(values) => (teamsResultsValues = values)} />
            </TeamsAndResultsProvider>
        );
    });

    it("should fetch teams", async () => {
        const teams = await teamsResultsValues.fetchTeams();
        expect(teams).toEqual([{ _id: "1", name: "Equipo A" }]);
        expect(mockTeamsAndResultsContext.fetchTeams).toHaveBeenCalled();
    });

    it("should fetch results", async () => {
        const results = await teamsResultsValues.fetchResults();
        expect(results).toEqual([{ _id: "1", jornada: 1 }]);
        expect(mockTeamsAndResultsContext.fetchResults).toHaveBeenCalled();
    });

    it("should add a new team", async () => {
        const response = await teamsResultsValues.addTeam({ name: "Equipo B" });
        expect(response.ok).toBe(true);
        expect(mockTeamsAndResultsContext.addTeam).toHaveBeenCalledWith({ name: "Equipo B" });
    });

    it("should add a new result", async () => {
        const newResult = { jornada: 2, goles_local: 3, goles_visitante: 2, fecha: "2025-02-20" };
        const response = await teamsResultsValues.addResult(newResult);
        expect(response.ok).toBe(true);
        expect(mockTeamsAndResultsContext.addResult).toHaveBeenCalledWith(newResult);
    });

    it("should update a team", async () => {
        const response = await teamsResultsValues.updateTeam("1", { name: "Equipo Modificado" });
        expect(response.ok).toBe(true);
        expect(mockTeamsAndResultsContext.updateTeam).toHaveBeenCalledWith("1", { name: "Equipo Modificado" });
    });

    it("should update a result", async () => {
        const updateData = { jornada: 1, goles_local: 2, goles_visitante: 2, fecha: "2025-02-21" };
        const response = await teamsResultsValues.updateResult("1", updateData);
        expect(response.ok).toBe(true);
        expect(mockTeamsAndResultsContext.updateResult).toHaveBeenCalledWith("1", updateData);
    });

    it("should delete a team", async () => {
        await teamsResultsValues.deleteTeam("1");
        expect(mockTeamsAndResultsContext.deleteTeam).toHaveBeenCalledWith("1");
    });

    it("should delete a result", async () => {
        await teamsResultsValues.deleteResult("1");
        expect(mockTeamsAndResultsContext.deleteResult).toHaveBeenCalledWith("1");
    });
});

const TestComponent = ({ callback }) => {
    const values = useTeamsAndResults();
    callback(values);
    return null;
};
