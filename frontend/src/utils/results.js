export const getHours = (date) => {
    const dateObject = new Date(date);
    const hours = dateObject.getHours();
    const minutes = dateObject.getMinutes();
    return `${hours}:${minutes}`;
};

export const getDateWithoutTime = (date) => {
    const dateObject = new Date(date);
    return dateObject.toISOString().split('T')[0];
}