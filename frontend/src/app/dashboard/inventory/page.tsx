"use client";
import Card from "@/components/ui/Card";
import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryList from '@/components/inventory/InventoryList';
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/api/inventory';
import { InventoryItem } from '@/types';

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
    <Card>
      <h1 className="text-2xl font-bold mb-6">Inventory</h1>
      <InventoryForm onItemAdded={loadItems} />
      <div className="mt-6">
        <InventoryList items={items} />
      </div>
    </Card>
  );
}