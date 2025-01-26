"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, DollarSign, AlertCircle, ClipboardList } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { InventoryItem } from "@/types/inventory";
import { fetchAndAnalyzeInventory } from "@/lib/helperFunctions/inventory";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/ui/loader";
import { formatToIndianCurrency } from "@/lib/manageNumbers";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Home() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [inventoryAnalytics, setInventoryAnalytics] = useState<{
    lowStockItems: InventoryItem[];
    totalInventoryValue: number;
    inventoryItems: InventoryItem[];
    categoryDataArray: { name: string; value: number }[];
  }>({
    lowStockItems: [],
    totalInventoryValue: 0,
    inventoryItems: [],
    categoryDataArray: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const fetchInventoryItems = async () => {
      try {
        const analyticsData = await fetchAndAnalyzeInventory();

        setInventoryAnalytics(analyticsData);
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
  }, []);
  return initialLoading ? (
    <div className="flex items-center justify-center h-screen w-full">
      <Loader icon="loader2" />
    </div>
  ) : (
    <div className="container mx-auto py-8">
      <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/inventory">
          <Button className="mt-4 lg:mt-0">
            <ClipboardList className="mr-2 h-4 w-4" />
            Manage Inventory
          </Button>
        </Link>
      </div>

      {/* Analytics Dashboard */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                Low Stock Items
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryAnalytics.lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Items with quantity below 10
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Total Inventory Value
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatToIndianCurrency(inventoryAnalytics.totalInventoryValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined value of all items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                Total Items
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {inventoryAnalytics.inventoryItems.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of unique items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={inventoryAnalytics.lowStockItems.slice(0, 10)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Items by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryAnalytics.categoryDataArray}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {inventoryAnalytics.categoryDataArray.map(
                      (entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Latest Updates */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventoryAnalytics.inventoryItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b pb-2"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.category}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{item.quantity} in stock</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(item.lastUpdated).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
