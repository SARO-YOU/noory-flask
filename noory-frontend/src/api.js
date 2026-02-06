import axios from "axios";

export const API_BASE_URL = "https://noory.cloud-ip.cc/api";

export const fetchProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}/products`);
  return response.data;
};
