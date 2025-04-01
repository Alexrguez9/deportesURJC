
/**
 * Check if the user has an active subscription
 * @param {Object} subscription - User subscription
 * @returns {Boolean} - True if the subscription is expired, false otherwise
 */
export const isSubscriptionExpired = (subscription) => {
    if (!subscription?.isActive || !subscription.endDate) return true;
  
    const now = new Date();
    const endDate = new Date(subscription.endDate);
  
    return now > endDate;
};
