
/**
 * Cleans expired subscriptions from the user object.
 * @param {Object} user - User object
 * @returns {Object} - User object with cleaned subscriptions
 */
const cleanExpiredSubscriptions = (user) => {
    const now = new Date();

    ['gimnasio', 'atletismo'].forEach((area) => {
        const subs = user.subscription?.[area];

        if (subs?.estado && subs?.fechaFin && new Date(subs.fechaFin) < now) {
            user.subscription[area] = {
                estado: false,
                fechaInicio: null,
                fechaFin: null,
            };
        }
    });

    return user;
};

module.exports = { cleanExpiredSubscriptions };
