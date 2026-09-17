// Database layer placeholder
// Configure SUPABASE_URL and SUPABASE_KEY in environment variables.
const { createClient } = require('@supabase/supabase-js');

let client = null;

function getDb(){
  if(!client){
    if(!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY){
      throw new Error('Missing Supabase configuration');
    }
    client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  }
  return client;
}

module.exports = { getDb };
