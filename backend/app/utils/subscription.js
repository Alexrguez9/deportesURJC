
/**
 * Cleans expired subscriptions from the user object.
 * @param {Object} user - User object
 * @returns {Object} - User object with cleaned subscriptions
 */
const cleanExpiredSubscriptions = (user) => {
    const now = new Date();

    ['gym', 'athletics'].forEach((area) => {
        const subs = user.subscription?.[area];

        if (subs?.isActive && subs?.endDate && new Date(subs.endDate) < now) {
            user.subscription[area] = {
                isActive: false,
                initDate: null,
                endDate: null,
            };
        }
    });

    return user;
};

module.exports = { cleanExpiredSubscriptions };
