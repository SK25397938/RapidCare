import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured, supabaseKey, supabaseUrl } from "./runtimeConfig";

export const supabase = supabaseConfigured ? createClient(supabaseUrl, supabaseKey) : null;
