import { Calendar, Clock, ExternalLink } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  meeting_url?: string;
  scheduled_at: string;
  duration_minutes: number;
  projects?: {
    title: string;
  };
}

interface MeetingCardProps {
  meeting: Meeting;
}

export function MeetingCard({ meeting }: MeetingCardProps) {
  const meetingDate = new Date(meeting.scheduled_at);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = meetingDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{meeting.title}</h3>
          {meeting.projects && (
            <p className="text-sm text-purple-600 font-medium">{meeting.projects.title}</p>
          )}
        </div>
        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
          <Calendar className="w-6 h-6 text-purple-600" />
        </div>
      </div>

      {meeting.description && (
        <p className="text-slate-600 mb-4">{meeting.description}</p>
      )}

      <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formattedTime} ({meeting.duration_minutes} min)</span>
        </div>
      </div>

      {meeting.meeting_url && (
        <a
          href={meeting.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          Join Meeting
          <ExternalLink className="w-4 h-4" />
        </a>
      )}
    </div>
  );
}
