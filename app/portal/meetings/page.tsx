'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { MeetingCard } from '@/components/portal/MeetingCard';
import { Calendar } from 'lucide-react';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming');

  useEffect(() => {
    loadMeetings();
  }, []);

  async function loadMeetings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: projectsData } = await supabase
      .from('projects')
      .select('id')
      .eq('client_id', user.id);

    if (!projectsData || projectsData.length === 0) {
      setMeetings([]);
      return;
    }

    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('*, projects(title)')
      .in('project_id', projectsData.map(p => p.id))
      .order('scheduled_at', { ascending: filter === 'upcoming' });

    setMeetings(meetingsData || []);
  }

  useEffect(() => {
    loadMeetings();
  }, [filter]);

  const now = new Date().toISOString();
  const filteredMeetings = filter === 'upcoming'
    ? meetings.filter(m => m.scheduled_at >= now)
    : meetings.filter(m => m.scheduled_at < now);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Meetings</h1>
        <p className="text-slate-600">View and manage your scheduled meetings</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Past
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredMeetings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">
              {filter === 'upcoming'
                ? 'No upcoming meetings scheduled'
                : 'No past meetings found'
              }
            </p>
          </div>
        ) : (
          filteredMeetings.map(meeting => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))
        )}
      </div>
    </div>
  );
}
