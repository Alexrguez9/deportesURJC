export const getHours = (date) => {
    const dateObject = new Date(date);
    let hours = dateObject.getHours();
    let minutes = dateObject.getMinutes();

    // Añadimos 0 para que queden con el formato 0X:X0
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

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
        return [fechaInicio.toISOString(), fechaFin.toISOString()];
    }
    return [null, null];
};