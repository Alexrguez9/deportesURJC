// utils/facilities.js
export const getMinTime = (facility) => {
    if (!facility?.schedule?.initialHour) return new Date();

    const startTime = new Date(facility.schedule.initialHour);
    if (isNaN(startTime.getTime())) return new Date();

    startTime.setHours(startTime.getUTCHours(), startTime.getUTCMinutes());
    return startTime;
};

export const getMaxTime = (facility) => {
    if (!facility?.schedule?.endHour) return new Date();

    const endTime = new Date(facility.schedule.endHour);
    let hours = endTime.getUTCHours();
    let minutes = endTime.getUTCMinutes();

    if (minutes === 30) {
        minutes = 0;
    } else {
        minutes = 30;
        hours -= 1;
    }

    endTime.setHours(hours, minutes, 0);
    return endTime;
};

export const generateTimeSlots = async (facility, day, countReservationsByTimeSlot) => {
    if (!facility?.schedule?.initialHour || !facility?.schedule?.endHour) return [];

    const start = new Date(day);
    const end = new Date(day);

    const initialHour = new Date(facility.schedule.initialHour);
    const endHour = new Date(facility.schedule.endHour);

    start.setHours(initialHour.getUTCHours(), initialHour.getUTCMinutes(), 0, 0);
    end.setHours(endHour.getUTCHours(), endHour.getUTCMinutes(), 0, 0);

    const temp = [];
    const current = new Date(start);

    while (current < end) {
        const count = await countReservationsByTimeSlot(facility._id, new Date(current));
        const isAvailable = count < facility.capacity;

        temp.push({
            time: current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
            date: new Date(current),
            available: isAvailable,
            remaining: facility.capacity - count
        });

        current.setMinutes(current.getMinutes() + 30);
    }

    return temp;
};

export const checkSubscriptionForFacility = (facilityName, user) => {
    if (facilityName === 'Gimnasio' && !user?.subscription?.gym?.isActive) {
        return { ok: false, message: 'No tienes una suscripción activa en Gimnasio.' };
    }

    if (facilityName === 'Atletismo' && !user?.subscription?.athletics?.isActive) {
        return { ok: false, message: 'No tienes una suscripción activa en Atletismo.' };
    }

    return { ok: true };
};
