import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Citizen',
    required: true,
    index: true,
  },
  rating: { type: Number, required: true, min: 1, max: 5 },
  category: {
    type: String,
    required: true,
    enum: ['general', 'scheme', 'application', 'assistant', 'bug', 'suggestion'],
  },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
