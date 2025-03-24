
/**
 * Check if the user has an active subscription
 * @param {Object} subscription - User subscription
 * @returns {Boolean} - True if the subscription is expired, false otherwise
 */
export const isSubscriptionExpired = (subscription) => {
    if (!subscription?.estado || !subscription.fechaFin) return true;
  
    const now = new Date();
    const fechaFin = new Date(subscription.fechaFin);
  
    return now > fechaFin;
};
