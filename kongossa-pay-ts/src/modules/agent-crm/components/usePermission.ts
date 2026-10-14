import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";

/** Same check as <Can anyOf={[permission]}>, for disabling rather than hiding. */
export function usePermission(permission: string): boolean {
  const permissions: string[] = useSelector(
    (state: RootState) => (state.auth as { user?: { permissions?: string[] } }).user?.permissions || [],
  );
  return permissions.includes(permission);
}

export const apiErrorMessage = (err: unknown, fallback: string) =>
  (err as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;
