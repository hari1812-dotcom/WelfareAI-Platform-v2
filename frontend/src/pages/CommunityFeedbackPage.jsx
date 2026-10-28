import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { getPublicFeedbackApi } from '@/services/api';

const categoryLabels = {
  general: 'General Feedback',
  scheme: 'Scheme Information',
  application: 'Application Process',
  assistant: 'AI Assistant',
  bug: 'Bug Report',
  suggestion: 'Suggestion',
};

function getInitials(name = '') {
  return String(name).trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'W';
}

function relativeTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  const units = [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]];
  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  for (const [unit, seconds] of units) {
    if (elapsedSeconds >= seconds) return formatter.format(-Math.floor(elapsedSeconds / seconds), unit);
  }
  return 'just now';
}

function ReviewCard({ review, index, expanded, onToggle }) {
  const palette = ['bg-blue-100 text-blue-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-800', 'bg-emerald-100 text-emerald-800'];
  const messageIsLong = review.message.length > 180;
  return (
    <Card className="flex min-h-[230px] flex-col p-4">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${palette[index % palette.length]}`} aria-hidden="true">
          {getInitials(review.displayName)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-navy-900">{review.displayName}</p>
          <p className="text-xs text-gray-500">{relativeTime(review.createdAt)}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }).map((_, starIndex) => (
          <Star key={starIndex} className={`h-4 w-4 ${starIndex < review.rating ? 'fill-orange-400 text-orange-500' : 'text-gray-300'}`} />
        ))}
      </div>
      <p className="mt-2 text-[11px] font-medium text-gray-500">{categoryLabels[review.category] || 'General Feedback'}</p>
      <p className={`mt-2 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700 ${messageIsLong && !expanded ? 'line-clamp-4' : ''}`}>
        {review.message}
      </p>
      {messageIsLong && (
        <button type="button" onClick={onToggle} className="mt-2 w-fit text-xs font-semibold text-primary-700 hover:underline">
          {expanded ? 'See less' : 'See more'}
        </button>
      )}
    </Card>
  );
}

export function CommunityFeedbackPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState(() => new Set());

  useEffect(() => {
    let active = true;
    const refreshReviews = async () => {
      try {
        const result = await getPublicFeedbackApi();
        if (active) {
          setReviews(Array.isArray(result?.feedback) ? result.feedback : []);
          setError('');
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'Could not load community reviews.');
      } finally {
        if (active) setLoading(false);
      }
    };
    refreshReviews();
    const intervalId = window.setInterval(refreshReviews, 5000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1)
    : null;
  return (
    <DashboardLayout title="Community feedback" subtitle="See what WelfareAI users have shared.">
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Reviews and feedback</h2>
            <p className="mt-1 text-sm text-gray-500">New submissions appear automatically.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {averageRating && (
              <div className="text-sm text-gray-600">
                <span className="font-bold text-navy-900">{averageRating}</span> rating of {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                <div className="mt-1 flex gap-0.5" aria-label={`${averageRating} average rating`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-3.5 w-3.5 ${index < Math.round(Number(averageRating)) ? 'fill-orange-400 text-orange-500' : 'text-gray-300'}`} />
                  ))}
                </div>
              </div>
            )}
            <Link to="/feedback" className="rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">Write feedback</Link>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
        {loading ? (
          <Card className="p-5 text-sm text-gray-500">Loading community feedback…</Card>
        ) : reviews.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="font-semibold text-navy-900">No feedback has been shared yet.</p>
            <p className="mt-1 text-sm text-gray-500">Be the first to share your experience with WelfareAI.</p>
          </Card>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <ReviewCard
                key={review.id}
                review={review}
                index={index}
                expanded={expandedIds.has(review.id)}
                onToggle={() => setExpandedIds((current) => {
                  const next = new Set(current);
                  if (next.has(review.id)) next.delete(review.id);
                  else next.add(review.id);
                  return next;
                })}
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
