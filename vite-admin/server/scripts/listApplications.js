// Lists current applications (id, email, name summary) for quick verification
import supabase from '../config/db.js';

async function run() {
  const { data, error } = await supabase
    .from('faculty_applications')
    .select('id, email, first_name, last_name')
    .order('id', { ascending: true });
  if (error) {
    console.error('Error listing applications:', error.message);
    process.exit(1);
  }
  console.log('Current applications:');
  (data || []).forEach(r => {
    console.log(`#${r.id}  ${r.email || ''}  ${r.first_name || ''} ${r.last_name || ''}`.trim());
  });
  console.log(`Total: ${(data || []).length}`);
}

run();
