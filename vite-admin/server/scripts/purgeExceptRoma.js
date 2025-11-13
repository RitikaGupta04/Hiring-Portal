/*
  Admin script: Purge all application submissions except specific keepers.
  - Keeps applications where email is in PRESERVE_EMAILS
  - Deletes related rows (teaching_experiences, research_experiences, research_info, application_scores, application_documents)
  - Removes associated files from Supabase Storage bucket 'application-reports'
  Usage (from server folder): node scripts/purgeExceptRoma.js
*/

import supabase from '../config/db.js';

const BUCKET = 'application-reports';
const PRESERVE_EMAILS = [
  'roma420@gmail.com', // adjust if your Roma email is different
];

async function removeStorageFiles(paths = []) {
  const toRemove = paths.filter(Boolean);
  if (!toRemove.length) return { removed: 0 };
  try {
    const { error } = await supabase.storage.from(BUCKET).remove(toRemove);
    if (error) {
      console.warn('Storage remove error:', error.message);
      return { removed: 0, error };
    }
    return { removed: toRemove.length };
  } catch (err) {
    console.warn('Storage remove exception:', err.message);
    return { removed: 0, error: err };
  }
}

async function safeDelete(table, filter) {
  try {
    const { error } = await supabase.from(table).delete().match(filter);
    if (error) {
      console.warn(`Delete error on ${table}:`, error.message);
      return { ok: false };
    }
    return { ok: true };
  } catch (err) {
    console.warn(`Delete exception on ${table}:`, err.message);
    return { ok: false };
  }
}

async function run() {
  console.log('Starting purge of applications (excluding preserve list)...');

  // 1) Load apps to delete
  const { data: apps, error: loadErr } = await supabase
    .from('faculty_applications')
    .select('id, email, cover_letter_path, teaching_statement_path, research_statement_path, cv_path, other_publications_path, university')
    ; // fetch all, we'll filter in code to avoid operator quirks

  if (loadErr) {
    console.error('Failed to fetch applications:', loadErr.message);
    process.exit(1);
  }

  const toDelete = (apps || []).filter(a => !PRESERVE_EMAILS.map(e => e.toLowerCase()).includes((a.email || '').toLowerCase()));
  const total = toDelete.length;
  if (!total) {
    console.log('Nothing to delete. Done.');
    return;
  }

  console.log(`Found ${total} application(s) to delete.`);

  let filesRemoved = 0;
  for (const app of toDelete) {
    const appId = app.id;
    console.log(`\nProcessing application ${appId} (${app.email || 'no-email'})`);

    // 2) Delete child tables
    await safeDelete('teaching_experiences', { application_id: appId });
    await safeDelete('research_experiences', { application_id: appId });
    await safeDelete('research_info', { application_id: appId });
    await safeDelete('application_scores', { application_id: appId });
    await safeDelete('application_documents', { application_id: appId }); // if table absent, warning will be logged

    // 3) Remove storage files if present
    const paths = [
      app.cover_letter_path,
      app.teaching_statement_path,
      app.research_statement_path,
      app.cv_path,
      app.other_publications_path,
    ];
    const res = await removeStorageFiles(paths);
    filesRemoved += res.removed || 0;

    // 4) Delete main application row
    const { error: delAppErr } = await supabase
      .from('faculty_applications')
      .delete()
      .eq('id', appId);
    if (delAppErr) {
      console.warn('Failed to delete application', appId, delAppErr.message);
    } else {
      console.log(`Deleted application ${appId}`);
    }
  }

  console.log(`\nPurge complete. Deleted ${total} applications. Removed ${filesRemoved} file(s) from storage.`);
  console.log('Kept applications for emails:', PRESERVE_EMAILS.join(', '));
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
