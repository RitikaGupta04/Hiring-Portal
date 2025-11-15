import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase-client'

import { Users, Eye, CheckCircle, XCircle } from 'lucide-react'

export default function StatsCardsClient({ selectedView = 'teaching' }) {
  const [stats, setStats] = useState({
    total: 0,
    inReview: 0,
    shortlisted: 0,
    rejected: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Dropdown panel state
  const [activePanel, setActivePanel] = useState(null) // 'total' | 'in_review' | 'shortlisted' | 'rejected' | null
  const [panelLoading, setPanelLoading] = useState(false)
  const [panelItems, setPanelItems] = useState([])
  const [panelError, setPanelError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        // Build base queries with position filter
        const baseQuery = (status = null) => {
          let query = supabase.from('faculty_applications').select('*', { count: 'exact' });
          
          // Filter by teaching/non-teaching
          if (selectedView === 'teaching') {
            query = query.or('position.ilike.%professor%,position.eq.teaching');
          } else {
            query = query.not('position', 'ilike', '%professor%').neq('position', 'teaching');
          }
          
          // Add status filter if provided
          if (status) {
            query = query.eq('status', status);
          }
          
          return query;
        };

        const [
          { count: total },
          { count: inReview },
          { count: shortlisted },
          { count: rejected }
        ] = await Promise.all([
          baseQuery(),
          baseQuery('in_review'),
          baseQuery('shortlisted'),
          baseQuery('rejected')
        ])

        setStats({
          total: total || 0,
          inReview: inReview || 0,
          shortlisted: shortlisted || 0,
          rejected: rejected || 0
        })
      } catch (err) {
        setError(err.message)
        console.error('Error fetching stats:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [selectedView]) // Re-fetch when selectedView changes

  const fetchList = async (kind) => {
    setPanelLoading(true)
    setPanelError(null)
    try {
      let query = supabase
        .from('faculty_applications')
        .select('id, first_name, last_name, email, position, department, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50)

      if (kind === 'in_review' || kind === 'shortlisted' || kind === 'rejected') {
        query = query.eq('status', kind)
      }

      const { data, error: selErr } = await query
      if (selErr) throw selErr
      setPanelItems(Array.isArray(data) ? data : [])
    } catch (e) {
      setPanelError(e.message)
      setPanelItems([])
    } finally {
      setPanelLoading(false)
    }
  }

  const togglePanel = (key) => {
    if (activePanel === key) {
      setActivePanel(null)
      return
    }
    setActivePanel(key)
    fetchList(key)
  }

  if (loading) return <div>Loading stats...</div>
  if (error) return <div>Error: {error}</div>

  const emptyMessage = (k) => {
    switch (k) {
      case 'in_review':
        return 'No applications in review.'
      case 'shortlisted':
        return 'No applications shortlisted.'
      case 'rejected':
        return 'No applications rejected.'
      case 'total':
      default:
        return 'No applications found.'
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Applications */}
        <button
          type="button"
          onClick={() => togglePanel('total')}
          className={`text-left bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-100/50 cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm backdrop-filter bg-opacity-80 ${activePanel === 'total' ? 'ring-2 ring-blue-300' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Applications</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100/70 shadow-inner">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </button>

        {/* In Review */}
        <button
          type="button"
          onClick={() => togglePanel('in_review')}
          className={`text-left bg-[#fff3cd] rounded-xl p-6 border border-amber-100/50 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm backdrop-filter bg-opacity-80 ${activePanel === 'in_review' ? 'ring-2 ring-amber-300' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">In Review</p>
              <p className="text-2xl font-bold text-amber-900 mt-1">{stats.inReview}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#FFE082]/70 shadow-inner">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </button>

        {/* Shortlisted */}
        <button
          type="button"
          onClick={() => togglePanel('shortlisted')}
          className={`text-left bg-[#d4edda] rounded-xl p-6 border border-green-100/50 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm backdrop-filter bg-opacity-80 ${activePanel === 'shortlisted' ? 'ring-2 ring-green-300' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Shortlisted</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{stats.shortlisted}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#81C784]/70 shadow-inner">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </button>

        {/* Rejected */}
        <button
          type="button"
          onClick={() => togglePanel('rejected')}
          className={`text-left bg-[#f8d7da] rounded-xl p-6 border border-red-100/50 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm backdrop-filter bg-opacity-80 ${activePanel === 'rejected' ? 'ring-2 ring-red-300' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{stats.rejected}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#E57373]/70 shadow-inner">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </button>
      </div>

      {/* Slide-down panel */}
      {activePanel && (
        <div className="overflow-hidden transition-all duration-300">
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                {activePanel === 'total' && 'All Applications'}
                {activePanel === 'in_review' && 'Applications • In Review'}
                {activePanel === 'shortlisted' && 'Applications • Shortlisted'}
                {activePanel === 'rejected' && 'Applications • Rejected'}
              </h3>
              <button
                onClick={() => setActivePanel(null)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>

            {panelLoading ? (
              <div className="p-4 text-sm text-gray-500">Loading...</div>
            ) : panelError ? (
              <div className="p-4 text-sm text-red-600">{panelError}</div>
            ) : panelItems.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">{emptyMessage(activePanel)}</div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b">
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Position</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {panelItems.map((a) => (
                      <tr key={a.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{`${a.first_name || ''} ${a.last_name || ''}`.trim() || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{a.position || '—'}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{a.department || '—'}</td>
                        <td className="px-4 py-2 text-xs">
                          <span className={`inline-flex px-2 py-0.5 rounded-full font-medium ${
                            a.status === 'shortlisted' ? 'bg-green-100 text-green-700' :
                            a.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            a.status === 'in_review' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {a.status || 'unknown'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</td>
                      </tr>) )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
