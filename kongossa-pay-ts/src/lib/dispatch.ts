import { store } from "@/redux/store";
import type { Toast } from "@/redux/slices/toastSlice";
import { showToast } from "@/redux/slices/toastSlice";
import { showLoader, hideLoader } from "@/redux/slices/loaderSlice";
import type { ShowLoaderPayload } from "@/redux/slices/loaderSlice";
import {
  refreshAccessToken,
  setUser,
  updateWalletBalance,
} from "@/redux/slices/authSlice";
import { setTableColumnSettings } from '@/redux/slices/tableColumnSettingsSlice'
import type { ColumnsPayload } from '@/redux/slices/tableColumnSettingsSlice'
import { getCurrentUser } from "@/modules/auth/api";

export const dispatchShowToast = (toast: Toast) => store.dispatch(showToast(toast));
export const dispatchShowLoader = (payload?: ShowLoaderPayload) => store.dispatch(showLoader(payload));
export const dispatchHideLoader = () => store.dispatch(hideLoader());

// Auth
export const dispatchFetchCsrfToken = () => store.dispatch(refreshAccessToken());
export const dispatchSetTableColumnSettings = (payload: ColumnsPayload) => store.dispatch(setTableColumnSettings(payload));

// User related
export const dispatchSetUser = (user: any) => store.dispatch(setUser(user));

// ✅ New: Update only wallet balance
export const dispatchUpdateWalletBalance = (balance: number) => {
  store.dispatch(updateWalletBalance(balance));
};

// ✅ New: Sync only wallet balance (no full user sync)
export async function syncWalletBalance() {
  try {
    const currentUser = await getCurrentUser();
    if (currentUser && currentUser.walletBalance !== undefined) {
      dispatchUpdateWalletBalance(currentUser.walletBalance);
      console.log('Wallet balance synced:', currentUser.walletBalance);
    }
  } catch (error: any) {
    // Silent fail for 403/401
    if (error?.response?.status !== 403 && error?.response?.status !== 401) {
      console.error('Failed to sync wallet balance:', error);
    }
  }
}

// ✅ Updated: Full user sync (use sparingly)
export async function syncCurrentUser(delay = 2000) {
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  try {
    const currentUser = await getCurrentUser();
    
    if (currentUser) {
      dispatchSetUser({
        id: currentUser.id,
        email: currentUser.email,
        fullName: currentUser.fullName,
        phoneNumber: currentUser.phoneNumber,
        profileImage: currentUser.profileImage,
        walletBalance: currentUser.walletBalance,
        currency: currentUser.currency,
        rewards_points: currentUser.rewardsPoints,
      });
      console.log('User synced successfully');
    }
  } catch (error: any) {
    // Silent fail for 403/401 - don't log as error
    if (error?.response?.status !== 403 && error?.response?.status !== 401) {
      console.error('Failed to sync user:', error);
    }
  }
}