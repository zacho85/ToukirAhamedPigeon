import api from "@/lib/axios";

export const getSystemSettings = async () => {
  const res = await api.get('/system-settings');
  console.log("res.data", res.data);
  return res.data;
};

export const saveSystemSettings = async (data: any) => {
  const res = await api.post("/system-settings", data);
  return res.data;
};
