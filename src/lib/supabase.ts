
import { createClient } from "@supabase/supabase-js";

// Conexão com o projeto Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente utilizado pelo sistema MasterMec
export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);
