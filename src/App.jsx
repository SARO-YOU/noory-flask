import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./api";

export default function App() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((p) => (
          <li key={p.id}>
            {p.name} - KES {p.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
