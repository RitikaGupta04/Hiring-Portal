import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// ⚠️ Hardcoded Supabase credentials – move to environment variables for production!
const supabaseUrl = 'https://dgefgxcxyyflxklptyln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZWZneGN4eXlmbHhrbHB0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwMDg4MjgsImV4cCI6MjA3MzU4NDgyOH0.IbnN_ow5AFxWbIzS9jq2JArPUlFlt46qUru_4Mmm_Pk'
// Create Supabase client with server-side cookie context
export const supabaseServer = () => {
  const cookieStore = cookies();

  return createServerComponentClient(
    { cookies: () => cookieStore },
    {
      supabaseUrl,
      supabaseKey,
      options: {
        global: {
          headers: { 'x-application-name': 'Faculty Recruitment App' },
        },
      },
    }
  );
};

// ✅ Gender distribution
export async function getGenderDistribution() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('faculty_applications')
    .select('gender, count(*)')
    .group('gender');

  if (error) throw error;

  return data.map(item => ({
    name: item.gender === 'Male' ? 'Male' : 'Female',
    value: item.count,
    color: item.gender === 'Male' ? '#3B82F6' : '#EC4899',
  }));
}

// ✅ Department-wise application counts
export async function getDepartmentApplications() {
  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from('faculty_applications')
    .select('department, count(*)')
    .group('department');

  if (error) throw error;

  return data.map(item => ({
    name: item.department,
    applications: item.count,
  }));
}
