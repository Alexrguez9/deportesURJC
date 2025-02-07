// export  const fetchResultados = async () => {
//     try {
//         const response = await fetch('http://localhost:4000/resultados');
//         if (!response.ok) {
//             throw new Error('Error en el fetch de resultados');
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error("Error al cargar los datos:", error);
//     }
// };