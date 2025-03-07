import { render, waitFor, act } from "@testing-library/react";
import { TeamsAndResultsProvider, useTeamsAndResults } from "../context/TeamsAndResultsContext";

// Mock de fetch global para simular las llamadas a la API
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

    test("debería proporcionar valores iniciales por defecto", () => {
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
        it("debería obtener la lista de equipos correctamente", async () => {
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
                expect(fetch).toHaveBeenCalledWith("http://localhost:4000/equipos");
                expect(contextValues.teams).toEqual(mockTeams);
                expect(fetchedTeams).toEqual(mockTeams);
            });
        });

        it("debería manejar errores al obtener equipos", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
            });

            console.error = jest.fn(); // Mock console.error para evitar logs en la consola durante la prueba

            await act(async () => {
                await contextValues.fetchTeams();
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(console.error).toHaveBeenCalled();
            });
        });

        it("debería manejar errores de red al obtener equipos", async () => {
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
        it("debería obtener la lista de resultados correctamente", async () => {
            const mockResults = [{ _id: "1", jornada: 1 }, { _id: "2", jornada: 2 }];
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
                expect(fetch).toHaveBeenCalledWith("http://localhost:4000/resultados");
                expect(contextValues.results).toEqual(mockResults);
                expect(fetchedResults).toEqual(mockResults);
            });
        });

        it("debería manejar errores al obtener resultados", async () => {
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

        it("debería manejar errores de red al obtener resultados", async () => {
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
        it("debería añadir un equipo correctamente", async () => {
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
                    "http://localhost:4000/equipos",
                    expect.anything()
                );
                expect(contextValues.teams).toContainEqual(mockResponseTeam);
            });
        });

        it("debería manejar errores al añadir un equipo", async () => {
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

        it("debería manejar errores de red al añadir un equipo", async () => {
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
        it("debería añadir un resultado correctamente", async () => {
            const newResult = { jornada: "1", equipo_local: "Local", equipo_visitante: "Visitor", goles_local: "1", goles_visitante: "0", fecha: "2024-01-01" };
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
                    "http://localhost:4000/resultados",
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al añadir un resultado", async () => {
            fetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
            });
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.addResult({ jornada: "a", equipo_local: "Local", equipo_visitante: "Visitor" }); // Jornada no numérica
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

        it("debería manejar errores de red al añadir un resultado", async () => {
            fetch.mockRejectedValueOnce(new Error("Fallo de red"));
            console.error = jest.fn();
            let errorThrown;

            await act(async () => {
                try {
                    await contextValues.addResult({ jornada: "1", equipo_local: "Local", equipo_visitante: "Visitor" });
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
        it("debería actualizar un equipo correctamente", async () => {
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
                    `http://localhost:4000/equipos/${teamId}`,
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al actualizar un equipo", async () => {
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

        it("debería manejar errores de red al actualizar un equipo", async () => {
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
        it("debería actualizar un resultado correctamente", async () => {
            const resultId = "1";
            const updateData = { goles_local: "2", goles_visitante: "1", fecha: "2024-01-01" };
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
                    `http://localhost:4000/resultados/${resultId}`,
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al actualizar un resultado", async () => {
            const resultId = "1";
            const updateData = { goles_local: "2", goles_visitante: "1" };
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

        it("debería manejar errores de red al actualizar un resultado", async () => {
            const resultId = "1";
            const updateData = { goles_local: "2", goles_visitante: "1" };
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
        it("debería eliminar un equipo correctamente", async () => {
            const teamId = "1";
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteTeam(teamId);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/equipos/${teamId}`,
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al eliminar un equipo", async () => {
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

        it("debería manejar errores de red al eliminar un equipo", async () => {
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
        it("debería eliminar un resultado correctamente", async () => {
            const resultId = "1";
            fetch.mockResolvedValueOnce({ ok: true });

            await act(async () => {
                await contextValues.deleteResult(resultId);
            });

            await waitFor(() => {
                expect(fetch).toHaveBeenCalledTimes(3);
                expect(fetch).toHaveBeenCalledWith(
                    `http://localhost:4000/resultados/${resultId}`,
                    expect.anything()
                );
            });
        });

        it("debería manejar errores al eliminar un resultado", async () => {
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

        it("debería manejar errores de red al eliminar un resultado", async () => {
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
});