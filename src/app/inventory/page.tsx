"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { InventoryItem } from "@/types/inventory";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";
import {
  addOrUpdateInventoryItemInFirebase,
  deleteInventoryItemFromFirebase,
  getInventoryDataSortedByLastUpdated,
  updateInventoryItemInFirebase,
} from "@/lib/helperFunctions/inventory";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/ui/loader";

export default function InventoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [flag, setFlag] = useState(false);

  const handleAddItem = (
    newItem: Omit<InventoryItem, "id" | "lastUpdated">
  ) => {
    setActionLoading(true);
    const item: Omit<InventoryItem, "id"> = {
      ...newItem,
      lastUpdated: new Date().toISOString(),
    };
    addOrUpdateInventoryItemInFirebase(item).then((inventoryId) => {
      toast({
        description: "Item added successfully",
      });
      setFlag((prev) => !prev);
      setIsFormOpen(false);
      setSelectedItem(null);
      setActionLoading(false);
    });
  };

  const handleEditItem = (
    updatedItem: Omit<InventoryItem, "id" | "lastUpdated">
  ) => {
    if (!selectedItem) return;
    setActionLoading(true);
    updateInventoryItemInFirebase(selectedItem.id, updatedItem)
      .then((updatedItemRes) => {
        toast({
          description: "Item updated successfully",
        });
        const updatedItems = items.map((item) =>
          item.id === selectedItem.id ? { ...item, ...updatedItemRes } : item
        );
        setItems(updatedItems);
        setIsFormOpen(false);
        setSelectedItem(null);
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setActionLoading(true);
      deleteInventoryItemFromFirebase(itemToDelete)
        .then(() => {
          setItems(items.filter((item) => item.id !== itemToDelete));
          toast({
            description: "Item deleted successfully",
          });
          setIsDeleteDialogOpen(false);
          setItemToDelete(null);
        })
        .finally(() => {
          setActionLoading(false);
        });
    }
  };

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const fetchedItems = await getInventoryDataSortedByLastUpdated();
        setItems(fetchedItems);
      } catch (error) {
        toast({
          description: "Failed to fetch inventory items",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInventoryItems();
  }, [flag]);

  return initialLoading ? (
    <div className="flex items-center justify-center w-full h-screen">
      <Loader icon="loader2" />
    </div>
  ) : (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8">
        <div className="flex gap-4 items-center">
          <div
            className="p-2 bg-slate-400/20 rounded-full cursor-pointer"
            onClick={() => {
              router.back();
            }}
          >
            <ArrowLeft />
          </div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
        </div>

        <Button
          className="mt-4 lg:mt-0"
          onClick={() => {
            setSelectedItem(null);
            setIsFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Item
        </Button>
      </div>

      <InventoryTable
        items={items}
        onEdit={(item) => {
          setSelectedItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
      />

      <InventoryForm
        actionLoading={actionLoading}
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedItem(null);
        }}
        onSubmit={selectedItem ? handleEditItem : handleAddItem}
        initialValues={selectedItem || undefined}
      />

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              item from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {actionLoading ? <Loader icon="loader" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
