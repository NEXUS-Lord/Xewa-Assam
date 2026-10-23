import { createClient } from "@supabase/supabase-js";

// Read from environment variables or custom localStorage override
export function getSupabaseCredentials() {
  const localConfigStr = localStorage.getItem("xewa_supabase_config");
  if (localConfigStr) {
    try {
      const parsed = JSON.parse(localConfigStr);
      if (parsed.url && parsed.anonKey && parsed.url.startsWith("https://")) {
        return { url: parsed.url, anonKey: parsed.anonKey, source: "localStorage" };
      }
    } catch (e) {
      // ignore
    }
  }

  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.startsWith("https://") && !envUrl.includes("your-project-id")) {
    return { url: envUrl, anonKey: envKey, source: "env" };
  }

  return { url: null, anonKey: null, source: "demo" };
}

let clientInstance = null;
let lastUrl = null;

export function getSupabaseClient() {
  const creds = getSupabaseCredentials();
  if (!creds.url || !creds.anonKey) {
    return null;
  }

  if (!clientInstance || lastUrl !== creds.url) {
    lastUrl = creds.url;
    clientInstance = createClient(creds.url, creds.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
  }

  return clientInstance;
}

export function isSupabaseConfigured() {
  const creds = getSupabaseCredentials();
  return Boolean(creds.url && creds.anonKey);
}

export function saveCustomSupabaseConfig(url, anonKey) {
  if (!url || !anonKey) {
    localStorage.removeItem("xewa_supabase_config");
  } else {
    localStorage.setItem("xewa_supabase_config", JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  }
  clientInstance = null;
}
