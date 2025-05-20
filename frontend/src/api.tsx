import axios, { AxiosInstance } from "axios";

// Create an instance of axios with the base URL
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8000",
  //withCredentials: true, // Optional: If your API requires authentication cookies or headers
});

// src/api.tsx
export async function submitURL(url: string) {
  const response = await fetch("http://localhost:8000/submit-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error("Failed to get prediction");
  }

  return response.json();
}


// Export the Axios instance
export default api;
