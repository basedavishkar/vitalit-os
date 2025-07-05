"use client";

import { useEffect, useState } from "react";
import { getInventoryItems, deleteInventoryItem } from "@/api/inventory";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiry_date: string;
  vendor: string;
}

export default function InventoryList() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const loadItems = async () => {
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteInventoryItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Could not delete item.");
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">Inventory Items</h2>
      <table className="min-w-full bg-white border rounded shadow text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Quantity</th>
            <th className="px-4 py-2 border">Price</th>
            <th className="px-4 py-2 border">Expiry Date</th>
            <th className="px-4 py-2 border">Vendor</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-4">
                No items available.
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 border">{item.name}</td>
                <td className="px-4 py-2 border">{item.quantity}</td>
                <td className="px-4 py-2 border">₹{item.price.toFixed(2)}</td>
                <td className="px-4 py-2 border">
                  {new Date(item.expiry_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 border">{item.vendor}</td>
                <td className="px-4 py-2 border">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-500 hover:underline"
                  >
                    Delete
                  </button>
                  {/* Add Edit button here if needed */}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
