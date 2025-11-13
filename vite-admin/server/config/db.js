// db/config.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dgefgxcxyyflxklptyln.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZWZneGN4eXlmbHhrbHB0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODAwODgyOCwiZXhwIjoyMDczNTg0ODI4fQ.OKtOfq6Lsvhhsm7TWbB5-TV-YXuTMK745JK9KJXIAWk';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default supabase;
