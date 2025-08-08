'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import InventoryForm from '@/components/inventory/InventoryForm';
import InventoryList from '@/components/inventory/InventoryList';
import { inventoryAPI } from '@/lib/api';
import { InventoryItem } from '@/types/api';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [open, setOpen] = useState(false);

  const loadItems = async () => {
    try {
      const res = await inventoryAPI.getAll();
      // Support both paginated and array responses
      setItems((res as any).items ?? (res as any));
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] leading-tight font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Manage medical supplies and equipment</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Add Item</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <InventoryForm onItemAdded={() => { setOpen(false); loadItems(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="overflow-auto">
            <table className="table min-w-[700px]">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Unit Price</th>
                  <th>Supplier</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>{item.unit}</td>
                    <td>${item.price?.toFixed ? item.price.toFixed(2) : item.price}</td>
                    <td>{item.supplier}</td>
                    <td>{item.status}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-sm text-muted-foreground py-8">No items yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}