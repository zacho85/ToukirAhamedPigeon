import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { TranslationMap, FetchTranslationsPayload } from "@/types";

interface TranslationState {
  currentLang: string;
  translations: TranslationMap;
  loading: boolean;
  error: string | null;
}

const DEFAULT_LANG = "en";

// =========================
// Load JSON files from frontend
// =========================
async function loadLocalTranslationFile(lang: string): Promise<TranslationMap> {
  try {
    const data = await import(`@/lang/${lang}.json`);
    return data.default;
  } catch (error) {
    console.error("Translation file not found:", lang);
    throw new Error(`Translation file '${lang}.json' not found`);
  }
}

// =========================
// Async Thunk
// =========================
export const fetchTranslations = createAsyncThunk<
  TranslationMap,
  FetchTranslationsPayload,
  { rejectValue: string }
>(
  "language/fetchTranslations",
  async ({ lang }, { rejectWithValue }) => {
    try {
      // Always load JSON — or only force reload based on your logic
      const translations = await loadLocalTranslationFile(lang);

      if (!translations) return rejectWithValue("No translations found");
      return translations;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to load translation file");
    }
  }
);

// =========================
// Slice
// =========================
const initialState: TranslationState = {
  currentLang: localStorage.getItem("lang") || DEFAULT_LANG,
  translations: {},
  loading: false,
  error: null,
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage(state, action: PayloadAction<string>) {
      state.currentLang = action.payload;
      localStorage.setItem("lang", action.payload);
    },
    clearTranslations(state) {
      state.translations = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTranslations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTranslations.fulfilled, (state, action) => {
        state.loading = false;
        state.translations = action.payload;
        state.error = null;
      })
      .addCase(fetchTranslations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Unknown error";
      });
  },
});

export const { setLanguage, clearTranslations } = languageSlice.actions;
export default languageSlice.reducer;
