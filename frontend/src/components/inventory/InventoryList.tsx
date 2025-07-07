import Table from "@/components/ui/Table";
import { InventoryItem } from '@/types';

export default function InventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <Table
      headers={["Name", "Quantity", "Price", "Expiry Date", "Vendor"]}
    >
      {items.length === 0 ? (
        <tr>
          <td colSpan={5} className="text-center py-8 text-emerald-400">
            No inventory items found.
          </td>
        </tr>
      ) : (
        items.map((item) => (
          <tr key={item.id}>
            <td className="font-semibold">{item.name}</td>
            <td>{item.quantity}</td>
            <td>${item.price}</td>
            <td>{item.expiry_date}</td>
            <td>{item.vendor}</td>
          </tr>
        ))
      )}
    </Table>
  );
} 