export const appConfig = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '',
};
