import { fetchProducts } from "./api.js";

const testAPI = async () => {
  try {
    const products = await fetchProducts();
    console.log("Products from API:", products);
  } catch (error) {
    console.error("API fetch error:", error);
  }
};

testAPI();
