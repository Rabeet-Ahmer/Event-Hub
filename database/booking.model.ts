import mongoose, { Schema, Model, Document, Types } from 'mongoose';
import Event from './event.model';

/**
 * Interface defining the structure of a Booking document
 */
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Booking model methods
 */
interface IBookingModel extends Model<IBooking> {
  // Add static methods here if needed in the future
}

/**
 * Email validation regex pattern
 * Validates standard email format
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Booking schema definition
 */
const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          return emailRegex.test(v);
        },
        message: 'Please provide a valid email address',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create index on eventId for faster queries when filtering by event
bookingSchema.index({ eventId: 1 });

/**
 * Pre-save hook: Validates that the referenced event exists
 * Throws an error if the event does not exist in the database
 */
bookingSchema.pre('save', async function (next) {
  try {
    // Check if the event exists in the database
    const event = await Event.findById(this.eventId);
    if (!event) {
      const error = new Error(`Event with ID ${this.eventId} does not exist`);
      return next(error);
    }
    next();
  } catch (error) {
    // Ensure error is an instance of Error to satisfy CallbackError type requirement
    if (error instanceof Error) {
      next(error);
    } else {
      // Wrap non-Error values in a generic Error
      next(new Error('Unknown error in booking pre-save hook'));
    }
  }
});

/**
 * Booking model
 * Uses mongoose.models to prevent re-compilation during hot reloading in development
 */
const Booking: IBookingModel =
  (mongoose.models.Booking as IBookingModel) ||
  mongoose.model<IBooking, IBookingModel>('Booking', bookingSchema);

export default Booking;
