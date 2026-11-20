"use client";

import { Loader2, ShieldAlert, X } from "lucide-react";
import type { AdminUser, AdminUserRole } from "@/lib/admin-types";

interface RoleChangeModalProps {
  targetUser: AdminUser | null;
  nextRole: AdminUserRole | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (userId: string, role: AdminUserRole) => Promise<void>;
}

export function RoleChangeModal({
  targetUser,
  nextRole,
  isSubmitting,
  onClose,
  onConfirm,
}: RoleChangeModalProps) {
  if (!targetUser || !nextRole) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="role-change-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3
                id="role-change-title"
                className="font-heading text-lg font-extrabold text-slate-900 dark:text-white"
              >
                Confirm Role Change
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Permissions take effect on the user&apos;s next request.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/70">
          <p className="font-bold text-slate-900 dark:text-white">
            {targetUser.name || "Unnamed User"}
          </p>
          <p className="mt-0.5 text-slate-500 dark:text-slate-400">
            {targetUser.email}
          </p>
          <p className="mt-3 text-slate-700 dark:text-slate-300">
            Change role from{" "}
            <strong className="uppercase text-slate-900 dark:text-white">
              {targetUser.role}
            </strong>{" "}
            to{" "}
            <strong className="uppercase text-blue-600 dark:text-blue-400">
              {nextRole}
            </strong>
            ?
          </p>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => onConfirm(targetUser._id, nextRole)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSubmitting ? "Updating..." : "Confirm Role"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}