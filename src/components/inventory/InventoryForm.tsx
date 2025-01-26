"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { InventoryItem } from "@/types/inventory";
import Loader from "@/components/ui/loader";
import { useEffect } from "react";

interface InventoryFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: Omit<InventoryItem, "id" | "lastUpdated">) => void;
  initialValues?: InventoryItem;
  actionLoading: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  category: Yup.string().required("Category is required"),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(0, "Quantity must be positive"),
  price: Yup.number()
    .required("Price is required")
    .min(1, "Price must be more than 0"),
  description: Yup.string().required("Description is required"),
  partNumber: Yup.string().required("Part Number is required"),
});

export function InventoryForm({
  open,
  onClose,
  onSubmit,
  initialValues,
  actionLoading,
}: InventoryFormProps) {
  const formik = useFormik({
    initialValues: initialValues || {
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      description: "",
      partNumber: "",
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
      formik.resetForm();
    },
  });

  useEffect(() => {
    if (initialValues) {
      formik.setValues(initialValues);
    } else {
      formik.resetForm();
    }
  }, [initialValues]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] h-[100vh] lg:h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {initialValues ? "Edit Item" : "Add New Item"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partNumber">Part Number</Label>
            <Input id="partNumber" {...formik.getFieldProps("partNumber")} />
            {formik.touched.partNumber && formik.errors.partNumber && (
              <div className="text-red-500 text-sm">
                {formik.errors.partNumber}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...formik.getFieldProps("name")} />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-500 text-sm">{formik.errors.name}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" {...formik.getFieldProps("category")} />
            {formik.touched.category && formik.errors.category && (
              <div className="text-red-500 text-sm">
                {formik.errors.category}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              {...formik.getFieldProps("quantity")}
            />
            {formik.touched.quantity && formik.errors.quantity && (
              <div className="text-red-500 text-sm">
                {formik.errors.quantity}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...formik.getFieldProps("price")}
            />
            {formik.touched.price && formik.errors.price && (
              <div className="text-red-500 text-sm">{formik.errors.price}</div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...formik.getFieldProps("description")}
            />
            {formik.touched.description && formik.errors.description && (
              <div className="text-red-500 text-sm">
                {formik.errors.description}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? (
                <Loader />
              ) : initialValues ? (
                "Update Item"
              ) : (
                "Add Item"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
