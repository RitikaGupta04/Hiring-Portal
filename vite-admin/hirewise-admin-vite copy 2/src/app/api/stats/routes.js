import { supabaseServer } from '@/lib/supabase-server'

export async function GET() {
  const supabase = supabaseServer()

  try {
    // Count total applications
    const { count: total } = await supabase
      .from('faculty_applications')
      .select('*', { count: 'exact' })

    // Count by status
    const { count: inReview } = await supabase
      .from('faculty_applications')
      .select('*', { count: 'exact' })
      .eq('status', 'in_review')

    const { count: shortlisted } = await supabase
      .from('faculty_applications')
      .select('*', { count: 'exact' })
      .eq('status', 'shortlisted')

    const { count: rejected } = await supabase
      .from('faculty_applications')
      .select('*', { count: 'exact' })
      .eq('status', 'rejected')

    return Response.json({
      stats: {
        total,
        inReview,
        shortlisted,
        rejected
      }
    })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}