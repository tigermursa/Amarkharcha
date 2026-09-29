// app/categories/page.tsx
"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  useGetCategoriesQuery,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/lib/services/api";
import { CATEGORY_ICONS } from "@/lib/default-categories";
import * as FaIcons from "react-icons/fa";
import type { IconType } from "react-icons";
import type { ICategory } from "@/types";
import { toast } from "sonner";
import { useConfirm } from "../components/ConfirmDialog";

export default function CategoriesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const { data: categories, isLoading } = useGetCategoriesQuery();
  const [addCategory, { isLoading: adding }] = useAddCategoryMutation();
  const [updateCategory, { isLoading: updating }] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ICategory | null>(null);
  const [form, setForm] = useState({ name: "", icon: "FaEllipsisH" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  if (isPending) return null;
  if (!session) return null;

  const renderIcon = (name: string, className = "text-xl") => {
    const Icon = (FaIcons as any)[name] as IconType | undefined;
    return Icon ? <Icon className={className} /> : null;
  };
  const confirmDialog = useConfirm();
  const resetForm = () => {
    setForm({ name: "", icon: "FaEllipsisH" });
    setEditing(null);
    setShowForm(false);
    setError("");
  };

  const handleEdit = (cat: ICategory) => {
    if (cat.isDefault) return;
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon });
    setShowForm(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      if (editing) {
        await updateCategory({
          id: editing._id as string,
          name: form.name.trim(),
          icon: form.icon,
        }).unwrap();
        toast.success("Category updated");
      } else {
        await addCategory({ name: form.name.trim(), icon: form.icon }).unwrap();
        toast.success("Category created");
      }
      resetForm();
    } catch (err: any) {
      const msg = err?.data?.error || "Something went wrong";
      setError(msg);
      toast.error(msg);
    }
  };
  const handleDelete = async (cat: ICategory) => {
    if (cat.isDefault) return;
    const ok = await confirmDialog({
      title: "Delete category?",
      message: `Delete "${cat.name}"? This cannot be undone.`,
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) return;

    try {
      await deleteCategory(cat._id as string).unwrap();
      toast.success(`Category "${cat.name}" deleted`);
    } catch (err: any) {
      toast.error(err?.data?.error || "Failed to delete");
    }
  };

  const defaults = categories?.filter((c) => c.isDefault) || [];
  const customs = categories?.filter((c) => !c.isDefault) || [];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Categories
            </h1>
            <p className="text-muted-foreground text-sm">
              Manage your expense categories
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition"
          >
            + New Category
          </button>
        </div>

        {/* Create / Edit Form */}
        {showForm && (
          <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
            <h2 className="text-lg font-semibold text-foreground">
              {editing ? "Edit Category" : "New Category"}
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Category name"
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div>
              <p className="text-sm font-medium mb-2 text-foreground">Icon</p>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-52 overflow-y-auto p-2 border border-border rounded-lg">
                {CATEGORY_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setForm({ ...form, icon: iconName })}
                    className={`aspect-square p-2 rounded-lg flex items-center justify-center transition ${
                      form.icon === iconName
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-muted"
                    }`}
                  >
                    {renderIcon(iconName, "text-lg")}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={adding || updating}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
              >
                {adding || updating
                  ? "Saving..."
                  : editing
                    ? "Update"
                    : "Create"}
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:opacity-90 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {isLoading && (
          <p className="text-muted-foreground text-center py-8">Loading...</p>
        )}

        {/* Custom Categories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            My Categories ({customs.length})
          </h2>
          {customs.length === 0 ? (
            <div className="p-6 rounded-2xl bg-card border border-dashed border-border text-center">
              <p className="text-muted-foreground text-sm">
                You haven't created any custom category yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {customs.map((cat) => (
                <CategoryCard
                  key={cat._id as string}
                  category={cat}
                  onEdit={() => handleEdit(cat)}
                  onDelete={() => handleDelete(cat)}
                  renderIcon={renderIcon}
                />
              ))}
            </div>
          )}
        </div>

        {/* Default Categories */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">
            Default Categories ({defaults.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {defaults.map((cat) => (
              <CategoryCard
                key={cat._id as string}
                category={cat}
                renderIcon={renderIcon}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({
  category,
  onEdit,
  onDelete,
  renderIcon,
}: {
  category: ICategory;
  onEdit?: () => void;
  onDelete?: () => void;
  renderIcon: (name: string, className?: string) => React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center">
          {renderIcon(category.icon, "text-lg")}
        </div>
        <p className="font-medium text-foreground truncate">{category.name}</p>
      </div>

      {!category.isDefault && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            title="Edit"
            className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-muted transition"
          >
            <FaIcons.FaEdit className="text-sm" />
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted transition"
          >
            <FaIcons.FaTrash className="text-sm" />
          </button>
        </div>
      )}
    </div>
  );
}
