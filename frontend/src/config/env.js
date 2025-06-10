let API_URL;

try {
    API_URL = import.meta.env.VITE_API_URL;
} catch {
    API_URL = process.env.VITE_API_URL || "http://localhost:4000";
}

export default API_URL;
