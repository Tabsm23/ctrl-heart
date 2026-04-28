import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yvxooxyktmuifahrnamw.supabase.co'
const supabaseKey = 'sb_publishable_FUOkhP8kRtRDpTk4liYlDg_zBS8Gq1g'

export const supabase = createClient(supabaseUrl, supabaseKey)