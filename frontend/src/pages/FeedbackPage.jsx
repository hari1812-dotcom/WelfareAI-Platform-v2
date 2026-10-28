import { useState } from 'react';
import { Star, MessageSquare, ThumbsUp } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useTranslation } from 'react-i18next';
import { submitFeedbackApi } from '@/services/api';

export function FeedbackPage() {
  const { t } = useTranslation();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState('general');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    { id: 'general', label: t('genFb') },
    { id: 'scheme', label: t('schemeInfo') },
    { id: 'application', label: t('appProcess') },
    { id: 'assistant', label: t('aiAssistTab') },
    { id: 'bug', label: t('reportBug') },
    { id: 'suggestion', label: t('suggestion') },
  ];

  const resetForm = () => {
    setSubmitted(false);
    setRating(0);
    setHover(0);
    setCategory('general');
    setMessage('');
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!rating) {
      setError('Please choose a star rating before submitting.');
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedbackApi({ rating, category, message });
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError.message || 'Could not submit your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title={t('feedbackTitle')} subtitle={t('feedbackSub')}>
      <div className="feedback-page">
        {submitted ? (
          <Card className="mx-auto max-w-2xl p-8 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ThumbsUp className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-bold text-navy-900">Feedback submitted successfully!</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-gray-600">
              Thank you for helping improve WelfareAI. Your review is now part of the community feedback page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button to="/feedback/reviews" size="md">See other feedback</Button>
              <Button onClick={resetForm} variant="outline" size="md">Submit another response</Button>
            </div>
          </Card>
        ) : (
          <div className="mx-auto max-w-2xl">
            <Card className="feedback-form-card p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="feedback-rating-panel rounded-2xl border border-sky-100 p-5">
                  <label className="label-base text-sky-900">{t('howRate')}</label>
                  <div className="flex items-center gap-2" role="group" aria-label={t('howRate')}>
                    {Array.from({ length: 5 }).map((_, index) => {
                      const value = index + 1;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHover(value)}
                          onMouseLeave={() => setHover(0)}
                          aria-label={`Rate ${value} out of 5`}
                          aria-pressed={rating === value}
                          className="p-1"
                        >
                          <Star className={`h-7 w-7 transition-colors ${(hover || rating) >= value ? 'fill-sky-400 text-sky-500' : 'text-gray-300'}`} />
                        </button>
                      );
                    })}
                    {rating > 0 && <span className="ml-2 text-sm font-semibold text-navy-700">{rating}/5</span>}
                  </div>
                </div>

                <div>
                  <label className="label-base">{t('categoryTab')}</label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {categories.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setCategory(item.id)}
                        aria-pressed={category === item.id}
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-all ${category === item.id ? 'border-sky-400 bg-sky-50 text-sky-800 shadow-sm ring-2 ring-sky-100' : 'border-gray-200 bg-white text-navy-600 hover:border-sky-300 hover:bg-sky-50/60'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="label-base">
                    <MessageSquare className="mr-1 inline h-4 w-4" /> {t('yourFb')}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={t('tellUs')}
                    className="input-base resize-none"
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    maxLength={3000}
                    minLength={5}
                    required
                  />
                  <p className="mt-1 text-right text-xs text-gray-500">{message.length}/3000</p>
                  <p className="mt-1 text-xs text-gray-500">Feedback is visible to other WelfareAI users. Don’t include passwords, ID numbers, or other private details.</p>
                </div>

                {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <div className="flex justify-end">
                  <Button type="submit" size="md" disabled={submitting}>{submitting ? 'Submitting…' : t('subFbBtn')}</Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
