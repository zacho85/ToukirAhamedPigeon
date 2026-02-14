import { store } from "@/redux/store";
import type { Toast } from "@/redux/slices/toastSlice";
import { showToast } from "@/redux/slices/toastSlice";
import { showLoader, hideLoader } from "@/redux/slices/loaderSlice";
import type { ShowLoaderPayload } from "@/redux/slices/loaderSlice";
import {
  refreshAccessToken,
  setUser,
} from "@/redux/slices/authSlice";
import { setTableColumnSettings } from '@/redux/slices/tableColumnSettingsSlice'
import type { ColumnsPayload } from '@/redux/slices/tableColumnSettingsSlice'
import { getCurrentUser } from "@/modules/auth/api";



export const dispatchShowToast = (toast: Toast) => store.dispatch(showToast(toast))
;
export const dispatchShowLoader = (payload?: ShowLoaderPayload) => store.dispatch(showLoader(payload));
export const dispatchHideLoader = () => store.dispatch(hideLoader());

//Auth
export const dispatchFetchCsrfToken = () => store.dispatch(refreshAccessToken());
export const dispatchSetTableColumnSettings=(payload:ColumnsPayload)=>store.dispatch(setTableColumnSettings(payload));

export const dispatchSetUser = (user: any) => store.dispatch(setUser(user));

export async function syncCurrentUser(delay = 2000) {
  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  const currentUser = await getCurrentUser();

  if (currentUser) {
    dispatchSetUser({
      walletBalance: currentUser.walletBalance,
      rewards_points: currentUser.rewards_points,
    });
  }
}
