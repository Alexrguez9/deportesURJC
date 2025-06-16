import { render, waitFor, act } from "@testing-library/react";
import { TeamsAndResultsProvider, useTeamsAndResults } from "../context/TeamsAndResultsContext";

jest.mock('../config/env', () => ({
  __esModule: true,
  default: 'http://localhost:4000'
}));

// Global fetch mock to simulate API calls
global.fetch = jest.fn();

const TestComponent = ({ callback }) => {
    const context = useTeamsAndResults();
    callback(context);
    return null;
};

describe("TeamsAndResultsProvider", () => {
    let contextValues;

    beforeEach(() => {
        jest.clearAllMocks();
        contextValues = null;

        render(
            <TeamsAndResultsProvider>
                <TestComponent callback={(values) => (contextValues = values)} />
            </TeamsAndResultsProvider>
        );
    });

    afterEach(() => {
        fetch.mockReset();
    });

    test("should provide default initial values", () => {
        expect(contextValues.teams).toEqual([]);
        expect(contextValues.results).toEqual([]);
        expect(typeof contextValues.fetchTeams).toBe("function");
        expect(typeof contextValues.fetchResults).toBe("function");
        expect(typeof contextValues.addTeam).toBe("function");
        expect(typeof contextValues.addResult).toBe("function");
        expect(typeof contextValues.updateTeam).toBe("function");
        expect(typeof contextValues.updateResult).toBe("function");
        expect(typeof contextValues.deleteTeam).toBe("function");
        expect(typeof contextValues.deleteResult).toBe("function");
    });

    describe("fetchTeams", () => {
        it("should fetch the list of teams successfully", async () => {
            const mockTeams = [{ _id: "1", name: "Team 1" }, { _id: "2", name: "Team 2" }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTeams,
            });

            let fetchedTeams;
            await act(async () => {
                fetchedTeams = await contextValues.fetchTeams();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith("http://localhost:4000/teams");
                expect(contextValues.teams).toEqual(mockTeams);
                expect(fetchedTeams).toEqual(mockTeams);
            });
        });

        it("should handle errors when fetching teams", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            console.error = jest.fn();

            await act(async () => {
                await contextValues.fetchTeams();
            });

            await waitFor(() => {
            expect(fetch).toHaveBeenCalled();
            expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network errors when fetching teams", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.fetchTeams();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("fetchResults", () => {
        it("should fetch the list of results successfully", async () => {
            const mockResults = [{ _id: "1", round: 1 }, { _id: "2", round: 2 }];
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResults,
            });

            let fetchedResults;
            await act(async () => {
                fetchedResults = await contextValues.fetchResults();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith("http://localhost:4000/results");
                expect(contextValues.results).toEqual(mockResults);
                expect(fetchedResults).toEqual(mockResults);
            });
        });

        it("should handle errors when fetching results", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            console.error = jest.fn();

            await act(async () => {
                await contextValues.fetchResults();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("should handle network errors when fetching results", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();

            await act(async () => {
                await contextValues.fetchResults();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });
    });

    describe("addTeam", () => {
        it("should add a team successfully", async () => {
            const newTeam = { name: "New Team" };
            const mockResponseTeam = { _id: "3", ...newTeam };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResponseTeam,
            });

            await act(async () => {
                await contextValues.addTeam(newTeam);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/teams",
                    expect.anything()
                );
                expect(contextValues.teams).toContainEqual(mockResponseTeam);
            });
        });

        it("should handle errors when adding a team", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
            });
            console.error = jest.fn();
            let errorResponse;

            await act(async () => {
                errorResponse = await contextValues.addTeam({ name: "Invalid Team" });
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorResponse).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when adding a team", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorResponse;

            await act(async () => {
                errorResponse = await contextValues.addTeam({ name: "Team Fail" });
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorResponse).toBeInstanceOf(Error);
            });
        });
    });

    describe("addResult", () => {
        it("should add a result successfully", async () => {
            const newResult = { round: "1", localTeam: "Local", visitorTeam: "Visitor", localGoals: "1", visitorGoals: "0", date: "2024-01-01" };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ ...newResult, _id: 'newResultId' }), // Simulando respuesta del backend
            });

            await act(async () => {
                await contextValues.addResult(newResult);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    "http://localhost:4000/results",
                    expect.anything()
                );
            });
        });

        it("should handle errors when adding a result", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.addResult({ round: "a", localTeam: "Local", visitorTeam: "Visitor" }); // round no numérica
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when adding a result", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.addResult({ round: "1", localTeam: "Local", visitorTeam: "Visitor" });
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });
    });

    describe("updateTeam", () => {
        it("should update a team successfully", async () => {
            const teamId = "1";
            const updateData = { name: "Updated Team Name" };
            const mockUpdatedTeam = { _id: teamId, ...updateData };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUpdatedTeam,
            });

            await act(async () => {
                await contextValues.updateTeam(teamId, updateData);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/teams/${teamId}`,
                    expect.anything()
                );
            });
        });

        it("should handle errors when updating a team", async () => {
            const teamId = "1";
            const updateData = { name: "Updated Team Name" };
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.updateTeam(teamId, updateData);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when updating a team", async () => {
            const teamId = "1";
            const updateData = { name: "Updated Team Name" };
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.updateTeam(teamId, updateData);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });
    });

    describe("updateResult", () => {
        it("should update a result successfully", async () => {
            const resultId = "1";
            const updateData = { localGoals: "2", visitorGoals: "1", date: "2024-01-01" };
            const mockUpdatedTeam = { _id: resultId, ...updateData };
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockUpdatedTeam,
            });

            await act(async () => {
                await contextValues.updateResult(resultId, updateData);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/results/${resultId}`,
                    expect.anything()
                );
            });
        });

        it("should handle errors when updating a result", async () => {
            const resultId = "1";
            const updateData = { localGoals: "2", visitorGoals: "1" };
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.updateResult(resultId, updateData);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when updating a result", async () => {
            const resultId = "1";
            const updateData = { localGoals: "2", visitorGoals: "1" };
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.updateResult(resultId, updateData);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(2);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });
    });

    describe("deleteTeam", () => {
        it("should delete a team successfully", async () => {
            const teamId = "1";
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteTeam(teamId);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/teams/${teamId}`,
                    expect.anything()
                );
            });
        });

        it("should handle errors when deleting a team", async () => {
            const teamId = "1";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.deleteTeam(teamId);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when deleting a team", async () => {
            const teamId = "1";
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.deleteTeam(teamId);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });
    });

    describe("deleteResult", () => {
        it("should delete a result successfully", async () => {
            const resultId = "1";
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteResult(resultId);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/results/${resultId}`,
                    expect.anything()
                );
            });
        });

        it("should handle errors when deleting a result", async () => {
            const resultId = "1";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.deleteResult(resultId);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });

        it("should handle network errors when deleting a result", async () => {
            const resultId = "1";
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.deleteResult(resultId);
                } catch (error) {
                    errorThrown = error;
                }
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
                expect(errorThrown).toBeInstanceOf(Error);
            });
        });
    });

    describe("updateResultsWithNewTeamName", () => {
        it("should update team name in related results", async () => {
            const teamId = "1";
            const newTeamName = "Nuevo Nombre Equipo";
    
            const mockResults = [
                {
                    _id: "res1",
                    localTeamId: "1",
                    localTeam: "Viejo Nombre",
                    visitorTeam: "Otro Equipo",
                    localGoals: 2,
                    visitorGoals: 1,
                    round: 1,
                    date: "2024-01-01T00:00:00.000Z",
                },
                {
                    _id: "res2",
                    visitorTeamId: "1",
                    localTeam: "Otro",
                    visitorTeam: "Viejo Nombre",
                    localGoals: 1,
                    visitorGoals: 3,
                    round: 2,
                    date: "2024-01-02T00:00:00.000Z",
                }
            ];
    
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResults,
            });
    
            fetch.mockResolvedValueOnce({ ok: true }); // PUT res1
            fetch.mockResolvedValueOnce({ ok: true }); // PUT res2
    
            fetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockResults,
            });
    
            await act(async () => {
                await contextValues.updateResultsWithNewTeamName(teamId, newTeamName);
            });
    
            await waitFor(() => {
                expect(fetch).toHaveBeenCalledWith(`http://localhost:4000/results/byTeam/${teamId}`);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/results/res1`,
                    expect.objectContaining({
                        method: "PUT",
                        body: expect.stringContaining(newTeamName),
                    })
                );
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/results/res2`,
                    expect.objectContaining({
                        method: "PUT",
                        body: expect.stringContaining(newTeamName),
                    })
                );
            });
        });
    
        it("should handle errors when updating names in results", async () => {
            const teamId = "1";
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });
            console.error = jest.fn();
    
            await act(async () => {
                await contextValues.updateResultsWithNewTeamName(teamId, "Nuevo");
            });
    
            await waitFor(() => {
                expect(console.error).toHaveBeenCalled();
            });
        });
    });
    
});