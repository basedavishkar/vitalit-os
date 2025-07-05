"use client";

import { useEffect, useState } from "react";
import { getInventoryItems } from "@/api/inventory";
import InventoryForm from "./InventoryForm";

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  expiry_date: string;
  vendor: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);

  const loadItems = async () => {
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch inventory items:", err);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold">Inventory</h1>

      {/* Inventory Form */}
      <InventoryForm onItemAdded={loadItems} />

      {/* Inventory Table */}
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
        <table className="min-w-full border border-gray-300 bg-white rounded shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Quantity</th>
              <th className="px-4 py-2 border">Price</th>
              <th className="px-4 py-2 border">Expiry</th>
              <th className="px-4 py-2 border">Vendor</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No inventory items found.
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
