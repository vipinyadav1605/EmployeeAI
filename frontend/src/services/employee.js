import API from "../api_url/api";

const getEmployees = async () => {
  try {
    const response = await fetch(`${API}/employees/`);
    if (!response.ok) {
      throw new Error("Failed to fetch employees");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw error;
  }
};
export default getEmployees;
