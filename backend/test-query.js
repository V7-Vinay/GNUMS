const supabase = require('./config/supabaseClient');

async function test() {
  const { data, error } = await supabase
    .from("users")
    .select("*, roles(name)")
    .eq("id", "3e0a4f32-86a1-429a-9ca2-c9bb17a5cf02")
    .single();
  console.log('DATA:', data);
  console.log('ERROR:', error);
}

test();
