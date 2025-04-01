import { isSubscriptionExpired } from "../utils/user";

export const mockIsSubscriptionExpired = (isGymExpired, isAthleticsExpired) => {
  isSubscriptionExpired.mockReset?.(); 
  isSubscriptionExpired
    .mockImplementationOnce(() => isGymExpired)
    .mockImplementationOnce(() => isAthleticsExpired);
};
