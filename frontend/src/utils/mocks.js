export const mockAuthContext = {
    user: null,
    isAuthenticated: false,
    login: jest.fn().mockImplementation(async (credentials, callback) => {
        mockAuthContext.user = { _id: "123", email: credentials.email, role: "admin" };
        mockAuthContext.isAuthenticated = true;
        if (callback) callback();
    }),
    logout: jest.fn().mockImplementation(async () => {
        mockAuthContext.user = null;
        mockAuthContext.isAuthenticated = false;
    }),
    getAllUsers: jest.fn().mockResolvedValue([
        { _id: "1", email: "user1@test.com" },
        { _id: "2", email: "user2@admin.com", role: "admin" }
    ]),
    addUser: jest.fn().mockResolvedValue({ _id: "3", email: "newuser@test.com", role: "user" }),
    updateUser: jest.fn().mockResolvedValue({ _id: "123", email: "updated@test.com" }),
    updatePasswordAndName: jest.fn((userId, newPassword, newName) => {
        return Promise.resolve({ success: true, userId, newPassword, newName });
    }),
    deleteUser: jest.fn().mockResolvedValue(true),
    isAdmin: jest.fn(() => mockAuthContext.user?.role === "admin"),
    isStudent: jest.fn(() => mockAuthContext.user?.role === "student"),
    handleAdmin: jest.fn().mockResolvedValue(true),
    setUser: jest.fn(),
};

export const mockFacilitiesAndReservationsContext = {
    instalaciones: [{ _id: '1', name: 'Gimnasio' }],
    reservas: [{ _id: '1', instalacionId: '1', fechaInicio: new Date('2024-08-05T10:00') }],
    getInstalacion: jest.fn().mockResolvedValue({ _id: '1', name: 'Gimnasio' }),
    getAllFacilities: jest.fn().mockResolvedValue([{ _id: '1', name: 'Gimnasio' }]),
    getAllReservations: jest.fn().mockResolvedValue([{ _id: '1', instalacionId: '1' }]),
    addReservation: jest.fn().mockResolvedValue({ ok: true }),
    addFacility: jest.fn().mockImplementation(async (facility) => ({ ok: true, name: facility.name })),
    updateReservation: jest.fn().mockResolvedValue({ ok: true }),
    updateFacility: jest.fn().mockResolvedValue({ ok: true }),
    deleteReservation: jest.fn().mockResolvedValue({ ok: true }),
    deleteFacility: jest.fn().mockResolvedValue({ ok: true }),
    contarReservasPorFranjaHoraria: jest.fn().mockResolvedValue(2),
    getMinTime: jest.fn().mockResolvedValue(new Date()),
    getMaxTime: jest.fn().mockResolvedValue(new Date())
};

export const mockTeamsAndResultsContext = {
    teams: [{ _id: '1', name: 'Equipo A', sport: 'Fútbol-7' }],
    results: [{ _id: '1', jornada: 1, goles_local: 2, goles_visitante: 1, sport: 'Fútbol-7' }],
    fetchTeams: jest.fn().mockResolvedValue([{ _id: '1', name: 'Equipo A' }]),
    fetchResults: jest.fn().mockResolvedValue([{ _id: '1', jornada: 1 }]),
    addTeam: jest.fn().mockResolvedValue({ ok: true }),
    addResult: jest.fn().mockResolvedValue({ ok: true }),
    updateTeam: jest.fn().mockResolvedValue({ ok: true }),
    updateResult: jest.fn().mockResolvedValue({ ok: true }),
    deleteTeam: jest.fn().mockResolvedValue(true),
    deleteResult: jest.fn().mockResolvedValue(true),
    updateResultsWithNewTeamName: jest.fn().mockResolvedValue({ ok: true }),
};
