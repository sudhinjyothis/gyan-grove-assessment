import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  getDocs,
  where,
} from "firebase/firestore";
import { InventoryItem } from "@/types/inventory";

/**
 * Adds a new inventory item to the Firebase Firestore collection or updates the quantity if the part number already exists.
 * @param newItem - The inventory item to be added, excluding id and lastUpdated.
 * @returns A promise that resolves with the document reference of the added or updated item.
 */
export async function addOrUpdateInventoryItemInFirebase(
  newItem: Omit<InventoryItem, "id" | "lastUpdated">
) {
  try {
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, where("partNumber", "==", newItem.partNumber));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnapshot = querySnapshot.docs[0];
      const existingItem = docSnapshot.data() as InventoryItem;
      const itemRef = doc(db, "inventory", docSnapshot.id);
      const updatedItem = {
        quantity: existingItem.quantity + newItem.quantity,
        lastUpdated: new Date().toISOString(),
      };
      await updateDoc(itemRef, updatedItem);
      return docSnapshot.id;
    } else {
      const itemWithTimestamp = {
        ...newItem,
        lastUpdated: new Date().toISOString(),
      };
      const docRef = await addDoc(inventoryCollection, itemWithTimestamp);
      return docRef.id;
    }
  } catch (error) {
    console.error("Error adding or updating document: ", error);
    throw error;
  }
}

/**
 * Updates an existing inventory item in the Firebase Firestore collection.
 * @param id - The ID of the inventory item to be updated.
 * @param updatedFields - The fields of the inventory item to be updated, excluding id and lastUpdated.
 * @returns A promise that resolves when the update is complete.
 */
export async function updateInventoryItemInFirebase(
  id: string,
  updatedFields: Partial<Omit<InventoryItem, "id" | "lastUpdated">>
) {
  try {
    const itemRef = doc(db, "inventory", id);
    const updatedItem = {
      ...updatedFields,
      lastUpdated: new Date().toISOString(),
    };
    await updateDoc(itemRef, updatedItem);
    return updatedItem;
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
}

/**
 * Deletes an inventory item from the Firebase Firestore collection by its ID.
 * @param id - The ID of the inventory item to be deleted.
 * @returns A promise that resolves when the deletion is complete.
 */
export async function deleteInventoryItemFromFirebase(id: string) {
  try {
    const itemRef = doc(db, "inventory", id);
    await deleteDoc(itemRef);
  } catch (error) {
    console.error("Error deleting document: ", error);
    throw error;
  }
}

/**
 * Retrieves inventory data from the Firebase Firestore collection, sorted by lastUpdated in descending order by default.
 * @returns A promise that resolves to an array of InventoryItem objects sorted by lastUpdated.
 */
export async function getInventoryDataSortedByLastUpdated(): Promise<
  InventoryItem[]
> {
  try {
    const inventoryCollection = collection(db, "inventory");
    const q = query(inventoryCollection, orderBy("lastUpdated", "desc"));
    const querySnapshot = await getDocs(q);
    const inventoryItems: InventoryItem[] = [];
    querySnapshot.forEach((doc) => {
      inventoryItems.push({ id: doc.id, ...doc.data() } as InventoryItem);
    });
    return inventoryItems;
  } catch (error) {
    console.error("Error retrieving inventory data: ", error);
    throw error;
  }
}

/**
 * Retrieves inventory data from Firebase and performs analysis to generate insights such as items with low stock, the total value of inventory, and the distribution of items across categories.
 * @returns A promise that resolves to an object containing details about low stock items, the total value of the inventory, the complete list of inventory items, and the distribution of items by category.
 */
export async function fetchAndAnalyzeInventory() {
  try {
    const inventoryItems = await getInventoryDataSortedByLastUpdated();

    const lowStockItems = inventoryItems.filter((item) => item.quantity < 10);

    const totalInventoryValue = inventoryItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const categoryData = inventoryItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.quantity;
      return acc;
    }, {} as Record<string, number>);

    const categoryDataArray = Object.entries(categoryData).map(
      ([name, value]) => ({
        name,
        value,
      })
    );

    return {
      lowStockItems,
      totalInventoryValue,
      inventoryItems,
      categoryDataArray,
    };
  } catch (error) {
    console.error("Error fetching and analyzing inventory data: ", error);
    throw error;
  }
}
