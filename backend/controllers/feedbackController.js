import { Feedback } from '../models/Feedback.js';

const categories = new Set(['general', 'scheme', 'application', 'assistant', 'bug', 'suggestion']);

export async function submitFeedback(req, res) {
  try {
    const rating = Number(req.body?.rating);
    const category = String(req.body?.category || '');
    const message = String(req.body?.message || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Choose a rating from 1 to 5 stars.' });
    }
    if (!categories.has(category)) {
      return res.status(400).json({ message: 'Choose a valid feedback category.' });
    }
    if (message.length < 5 || message.length > 3000) {
      return res.status(400).json({ message: 'Feedback must be between 5 and 3000 characters.' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      rating,
      category,
      message,
    });
    return res.status(201).json({
      message: 'Thank you. Your feedback has been submitted.',
      feedback: {
        id: feedback._id,
        displayName: toPublicName(req.user.fullName),
        rating: feedback.rating,
        category: feedback.category,
        message: feedback.message,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({ message: 'Could not submit feedback right now. Please try again.' });
  }
}

export async function getPublicFeedback(_req, res) {
  try {
    const records = await Feedback.find()
      .sort({ createdAt: -1, _id: -1 })
      .populate('userId', 'fullName')
      .lean();
    res.set('Cache-Control', 'no-store');
    return res.json({
      feedback: records.map((record) => ({
        id: String(record._id),
        displayName: toPublicName(record.userId?.fullName),
        rating: record.rating,
        category: record.category,
        message: record.message,
        createdAt: record.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error loading public feedback:', error);
    return res.status(500).json({ message: 'Could not load community feedback right now.' });
  }
}

function toPublicName(fullName = '') {
  const parts = String(fullName).trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'WelfareAI user';
  return parts.join(' ');
}
