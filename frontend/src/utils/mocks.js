export const mockAuthContext = {
    user: null,
    isAuthenticated: false,
    setUser: jest.fn((newUser) => {
        mockAuthContext.user = newUser;
    }),
    updateUserAndCookie: jest.fn((updatedUser) => {
        mockAuthContext.user = updatedUser;
    }),
    login: jest.fn().mockImplementation(async (credentials, callback) => {
        const mockUser = { _id: "123", email: credentials.email, role: "admin" };
        mockAuthContext.user = mockUser;
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
    updateUser: jest.fn().mockImplementation(async (id, data) => {
        if (mockAuthContext.user?._id === id) {
            const updated = { ...mockAuthContext.user, ...data };
            mockAuthContext.updateUserAndCookie(updated);
            return updated;
        }
        return { _id: id, ...data };
    }),
    updatePasswordAndName: jest.fn().mockImplementation(async (id, currentPassword, newPassword, name) => {
        const updated = { ...mockAuthContext.user, name };
        mockAuthContext.updateUserAndCookie(updated);
        return updated;
    }),
    deleteUser: jest.fn().mockResolvedValue(true),
    isAdmin: jest.fn(() => mockAuthContext.user?.role === "admin"),
    isStudent: jest.fn(() => mockAuthContext.user?.email.includes("@alumnos.urjc.es")),
    handleAdmin: jest.fn().mockResolvedValue(true),
};


export const mockFacilitiesAndReservationsContext = {
    facilities: [{ _id: '1', name: 'Gimnasio' }],
    reservations: [{ _id: '1', facilityId: '1', initDate: new Date('2024-08-05T10:00') }],
    getFacility: jest.fn().mockResolvedValue({ _id: '1', name: 'Gimnasio' }),
    getAllFacilities: jest.fn().mockResolvedValue([{ _id: '1', name: 'Gimnasio' }]),
    getAllReservations: jest.fn().mockResolvedValue([{ _id: '1', facilityId: '1' }]),
    addReservation: jest.fn().mockResolvedValue({ ok: true }),
    addFacility: jest.fn().mockImplementation(async (facility) => ({ ok: true, name: facility.name })),
    updateReservation: jest.fn().mockResolvedValue({ ok: true }),
    updateFacility: jest.fn().mockResolvedValue({ ok: true }),
    deleteReservation: jest.fn().mockResolvedValue({ ok: true }),
    deleteFacility: jest.fn().mockResolvedValue({ ok: true }),
    countReservationsByTimeSlot: jest.fn().mockResolvedValue(2),
    getMinTime: jest.fn().mockResolvedValue(new Date()),
    getMaxTime: jest.fn().mockResolvedValue(new Date())
};

export const mockTeamsAndResultsContext = {
    teams: [{ _id: '1', name: 'Equipo A', sport: 'Fútbol-7' }],
    results: [{ _id: '1', round: 1, localGoals: 2, visitorGoals: 1, sport: 'Fútbol-7' }],
    fetchTeams: jest.fn().mockResolvedValue([{ _id: '1', name: 'Equipo A' }]),
    fetchResults: jest.fn().mockResolvedValue([{ _id: '1', round: 1 }]),
    addTeam: jest.fn().mockResolvedValue({ ok: true }),
    addResult: jest.fn().mockResolvedValue({ ok: true }),
    updateTeam: jest.fn().mockResolvedValue({ ok: true }),
    updateResult: jest.fn().mockResolvedValue({ ok: true }),
    deleteTeam: jest.fn().mockResolvedValue(true),
    deleteResult: jest.fn().mockResolvedValue(true),
    updateResultsWithNewTeamName: jest.fn().mockResolvedValue({ ok: true }),
};
