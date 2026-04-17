export const apiBaseUrl =
  typeof __API_BASE_URL__ !== "undefined" && __API_BASE_URL__ ? __API_BASE_URL__ : "/api";

export const supabaseUrl =
  typeof __SUPABASE_URL__ !== "undefined" && __SUPABASE_URL__ ? __SUPABASE_URL__ : "";

export const supabaseKey =
  typeof __SUPABASE_KEY__ !== "undefined" && __SUPABASE_KEY__ ? __SUPABASE_KEY__ : "";

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
