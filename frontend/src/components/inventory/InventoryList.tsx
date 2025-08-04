import { InventoryItem } from '@/types/api';

export default function InventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Quantity</th>
          <th>Price</th>
          <th>Supplier</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td className="font-semibold">{item.name}</td>
            <td>{item.current_quantity}</td>
            <td>${item.unit_price}</td>
            <td>{item.supplier}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 