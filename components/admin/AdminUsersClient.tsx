"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Search, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { apiAuthFetch } from "@/lib/api-client";
import type { AdminUser, AdminUserRole } from "@/lib/admin-types";
import { RoleChangeModal } from "./RoleChangeModal";

interface AdminUsersClientProps {
  currentAdminEmail: string;
}

const ROLE_TABS: { label: string; value: "all" | AdminUserRole }[] = [
  { label: "All Users", value: "all" },
  { label: "Customers", value: "customer" },
  { label: "Technicians", value: "technician" },
  { label: "Admins", value: "admin" },
];

export function AdminUsersClient({ currentAdminEmail }: AdminUsersClientProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<"all" | AdminUserRole>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [pendingRoleChange, setPendingRoleChange] = useState<{
    user: AdminUser;
    nextRole: AdminUserRole;
  } | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      try {
        const res = await apiAuthFetch<{ users: AdminUser[] }>(
          "/api/admin/users"
        );
        if (!active) return;
        setUsers(Array.isArray(res.users) ? res.users : []);
      } catch (err) {
        if (active) {
          toast.error(
            err instanceof Error ? err.message : "Failed to load users."
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }
      if (searchTerm.trim().length > 0) {
        const q = searchTerm.trim().toLowerCase();
        return (
          u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, roleFilter, searchTerm]);

  async function handleConfirmRoleChange(
    userId: string,
    newRole: AdminUserRole
  ) {
    try {
      setIsUpdatingRole(true);
      const res = await apiAuthFetch<{ message: string; user: AdminUser }>(
        `/api/admin/users/${userId}/role`,
        {
          method: "PATCH",
          body: JSON.stringify({ role: newRole }),
        }
      );

      setUsers((prev) =>
        prev.map((item) =>
          item._id === userId ? { ...item, role: res.user.role } : item
        )
      );
      toast.success(res.message || `Role updated to ${newRole}.`);
      setPendingRoleChange(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update user role."
      );
    } finally {
      setIsUpdatingRole(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-14 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
        <div className="h-96 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Manage Platform Users
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          View all registered members, inspect technician Pro memberships, and assign Customer, Technician, or Admin roles.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <div className="flex flex-wrap gap-1.5">
          {ROLE_TABS.map((tab) => {
            const count =
              tab.value === "all"
                ? users.length
                : users.filter((u) => u.role === tab.value).length;
            const active = roleFilter === tab.value;

            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => setRoleFilter(tab.value)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 font-mono text-[10px] ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-white text-slate-600 dark:bg-slate-900 dark:text-slate-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-white"
          />
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
          <Users className="h-8 w-8 text-slate-400" />
          <h3 className="mt-3 font-heading text-base font-bold text-slate-900 dark:text-white">
            No users found
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or role filter.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Change Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => {
                  const isSelf =
                    user.email.toLowerCase() ===
                    currentAdminEmail.toLowerCase();
                  const initials = (user.name || user.email || "U")
                    .slice(0, 2)
                    .toUpperCase();

                  return (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="h-9 w-9 rounded-full border border-slate-200 object-cover dark:border-slate-700"
                            />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {initials}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-900 dark:text-white">
                                {user.name || "Unnamed User"}
                              </p>
                              {isSelf && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-300"
                              : user.role === "technician"
                                ? "bg-teal-100 text-teal-900 dark:bg-teal-950/70 dark:text-teal-300"
                                : "bg-blue-100 text-blue-900 dark:bg-blue-950/70 dark:text-blue-300"
                          }`}
                        >
                          {user.role === "admin" && (
                            <ShieldCheck className="h-3 w-3" />
                          )}
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.role === "technician" ? (
                          user.plan === "pro" ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Pro
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                              Free
                            </span>
                          )
                        ) : (
                          <span className="text-xs text-slate-400">&mdash;</span>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {isSelf ? (
                          <span className="inline-block rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-400">
                            Self-Locked
                          </span>
                        ) : (
                          <select
                            aria-label={`Change role for ${user.name}`}
                            value={user.role}
                            onChange={(e) => {
                              const next = e.target.value as AdminUserRole;
                              if (next !== user.role) {
                                setPendingRoleChange({ user, nextRole: next });
                              }
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                          >
                            <option value="customer">Customer</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <RoleChangeModal
        targetUser={pendingRoleChange?.user ?? null}
        nextRole={pendingRoleChange?.nextRole ?? null}
        isSubmitting={isUpdatingRole}
        onClose={() => !isUpdatingRole && setPendingRoleChange(null)}
        onConfirm={handleConfirmRoleChange}
      />
    </div>
  );
}