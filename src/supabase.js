import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://azzxgsubwuyimelrdrrb.supabase.co'
const supabaseKey = 'sb_publishable_-ubRykhFz8bGZEky7gja2g_GiHvRNbV'

export const supabase = createClient(supabaseUrl, supabaseKey)
