export const getHoursAndMinutes = (date) => {
    if (!date) return
    const dateObject = new Date(date).toISOString();
    const hours = dateObject.split('T')[1].split(':')[0];
    const minutes = dateObject.split('T')[1].split(':')[1];
    return `${hours}:${minutes}`;
};

export const getDateWithoutTime = (date) => {
    if (!date) return
    let dateObject = new Date(date);
    dateObject =  dateObject.toISOString().split('T')[0];
    return dateObject;
}

export const getPrettyDate = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}

export const getMonthlyDateRange = (user) => {
    if (user) {
        const initDate = new Date();
        const endDate = new Date(initDate);
        endDate.setMonth(endDate.getMonth() + 1); // One month from now
        return {
            startDate: initDate.toISOString(),
            endDate: endDate.toISOString()
        };
    }
    return {startDate: null, endDate: null};
};

export const validateHours = (date, minTime, maxTime) => {
    const hours = date.getHours();
    if (hours < minTime.getHours() || hours > maxTime.getHours()) {
        return false;
    } else if (hours === minTime.getHours() && date.getMinutes() < minTime.getMinutes()) {
        return false;
    } else if (hours === maxTime.getHours() && date.getMinutes() > maxTime.getMinutes()) {
        return false;
    }
    return true;
};

export const infinityDate = new Date(8640000000000000).toISOString();
