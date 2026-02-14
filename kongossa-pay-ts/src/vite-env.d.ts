interface ImportMetaEnv {
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_DOMAIN: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  // readonly VITE_API_BASE_URL: string
  // readonly VITE_APP_NAME: string
  // readonly VITE_APP_LOGO_URL?: string
  // readonly VITE_AUTH_TYPE: string
  // add more env vars here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
