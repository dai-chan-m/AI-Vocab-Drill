// src/utils/supabaseClient.ts
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";

export const supabaseBrowser = () => createPagesBrowserClient();
