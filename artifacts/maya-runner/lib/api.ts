import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { supabase } from "./supabase";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/**
 * Call once at app startup to configure the API client.
 * Sets the backend base URL and attaches the Supabase JWT to every request.
 */
export function configureApiClient() {
  setBaseUrl(API_URL);

  setAuthTokenGetter(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  });
}
