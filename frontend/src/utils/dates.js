export const getHoursAndMinutes = (date) => {
    if (!date) return
    const dateObject = new Date(date).toISOString();
    const hours = dateObject.split('T')[1].split(':')[0];
    const minutes = dateObject.split('T')[1].split(':')[1];
    return `${hours}:${minutes}`;
};

export const getDateWithoutTime = (date) => {
    const dateObject = new Date(date);
    return dateObject.toISOString().split('T')[0];
}

export const getPrettyDate = (date) => {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' });
}

export const getMonthlyDateRange = (user) => {
    if (user) {
        const fechaInicio = new Date();
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMonth(fechaFin.getMonth() + 1); // Un mes de alta
        return {
            startDate: fechaInicio.toISOString(),
            endDate: fechaFin.toISOString()
        };
    }
    return [null, null];
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