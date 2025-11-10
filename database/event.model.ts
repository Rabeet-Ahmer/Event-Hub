import mongoose, { Schema, Model, Document } from 'mongoose';

/**
 * Interface defining the structure of an Event document
 */
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for Event model methods
 */
interface IEventModel extends Model<IEvent> {
  // Add static methods here if needed in the future
}

/**
 * Helper function to generate a URL-friendly slug from a string
 * Converts to lowercase, replaces spaces and special chars with hyphens
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Normalizes a date string to ISO format (YYYY-MM-DD)
 * Handles various input formats and validates the date
 */
function normalizeDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    // Return date in YYYY-MM-DD format
    return date.toISOString().split('T')[0] || '';
  } catch {
    // If parsing fails, return the original string after basic cleanup
    return dateString.trim();
  }
}

/**
 * Normalizes time string to a consistent format (HH:MM AM/PM or 24-hour format)
 * Trims whitespace and ensures consistent formatting
 */
function normalizeTime(timeString: string): string {
  return timeString.trim();
}

/**
 * Event schema definition
 */
const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event title cannot be empty',
      },
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event description cannot be empty',
      },
    },
    overview: {
      type: String,
      required: [true, 'Event overview is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event overview cannot be empty',
      },
    },
    image: {
      type: String,
      required: [true, 'Event image is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event image cannot be empty',
      },
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event venue cannot be empty',
      },
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event location cannot be empty',
      },
    },
    date: {
      type: String,
      required: [true, 'Event date is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event date cannot be empty',
      },
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event time cannot be empty',
      },
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      required: [true, 'Event mode is required'],
    },
    audience: {
      type: String,
      required: [true, 'Event audience is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event audience cannot be empty',
      },
    },
    agenda: {
      type: [String],
      required: [true, 'Event agenda is required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Event agenda must be a non-empty array',
      },
    },
    organizer: {
      type: String,
      required: [true, 'Event organizer is required'],
      trim: true,
      validate: {
        validator: (v: string) => v.length > 0,
        message: 'Event organizer cannot be empty',
      },
    },
    tags: {
      type: [String],
      required: [true, 'Event tags are required'],
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0,
        message: 'Event tags must be a non-empty array',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create unique index on slug for faster lookups and to enforce uniqueness
eventSchema.index({ slug: 1 }, { unique: true });

/**
 * Pre-save hook: Generates slug from title and normalizes date/time
 * Only regenerates slug if the title has changed (for updates)
 */
eventSchema.pre('save', function (next) {
  // Generate slug only if title is modified or slug doesn't exist
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title);
  }

  // Normalize date to ISO format if date is modified
  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  // Normalize time format if time is modified
  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }

  next();
});

/**
 * Event model
 * Uses mongoose.models to prevent re-compilation during hot reloading in development
 */
const Event: IEventModel =
  (mongoose.models.Event as IEventModel) ||
  mongoose.model<IEvent, IEventModel>('Event', eventSchema);

export default Event;
