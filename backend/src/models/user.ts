// backend/src/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', userSchema);

// backend/src/models/FoodEntry.ts
import mongoose from 'mongoose';

interface IFoodEntry extends mongoose.Document {
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItem: string;
  initialWeight: number;
  remainingWeight?: number;
  userId: mongoose.Types.ObjectId;
}

const foodEntrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
  },
  foodItem: {
    type: String,
    required: true,
  },
  initialWeight: {
    type: Number,
    required: true,
  },
  remainingWeight: {
    type: Number,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IFoodEntry>('FoodEntry', foodEntrySchema);

// backend/src/models/Booking.ts
import mongoose from 'mongoose';

interface IBooking extends mongoose.Document {
  foodEntryId: mongoose.Types.ObjectId;
  personName: string;
  contactNumber: string;
  trustName: string;
  bookingDate: Date;
  userId: mongoose.Types.ObjectId;
}

const bookingSchema = new mongoose.Schema({
  foodEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FoodEntry',
    required: true,
  },
  personName: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  trustName: {
    type: String,
    required: true,
  },
  bookingDate: {
    type: Date,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model<IBooking>('Booking', bookingSchema);