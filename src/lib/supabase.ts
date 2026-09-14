import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://zazcuwgygivwemnrkzzk.supabase.co'
const supabaseKey = 'sb_publishable_n50AIHrpOHoVVcgOeTioeg_P2oIaSTH'

export const supabase = createClient(supabaseUrl, supabaseKey)