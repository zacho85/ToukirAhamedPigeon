import api from "../lib/axios"; // authenticated instance


// Fetch logged-in user (authenticated)
export const getDashboardData = async () => {
  const res = await api.get("/dashboard");
  return res.data;
};