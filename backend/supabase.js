const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_KEY;

if (!url || !key) {
  console.warn('[Supabase] SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados — modo sin BD');
}

const supabase = url && key ? createClient(url, key) : null;

module.exports = supabase;
