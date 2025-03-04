// backend/src/routes/auth.ts
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '30d',
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '30d',
    });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// backend/src/routes/foodEntries.ts
import express from 'express';
import { protect } from '../middleware/auth';
import FoodEntry from '../models/FoodEntry';

const router = express.Router();

// Get all food entries
router.get('/', protect, async (req, res) => {
  try {
    const entries = await FoodEntry.find({ userId: req.user._id });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create food entry
router.post('/', protect, async (req, res) => {
  try {
    const { date, mealType, foodItem, initialWeight } = req.body;

    const entry = await FoodEntry.create({
      date,
      mealType,
      foodItem,
      initialWeight,
      userId: req.user._id,
    });

    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update remaining weight
router.patch('/:id/remaining-weight', protect, async (req, res) => {
  try {
    const { remainingWeight } = req.body;

    const entry = await FoodEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { remainingWeight },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;

// backend/src/routes/bookings.ts
import express from 'express';
import { protect } from '../middleware/auth';
import Booking from '../models/Booking';

const router = express.Router();

// Get all bookings
router.get('/', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('foodEntryId');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { foodEntryId, personName, contactNumber, trustName, bookingDate } = req.body;

    const booking = await Booking.create({
      foodEntryId,
      personName,
      contactNumber,
      trustName,
      bookingDate,
      userId: req.user._id,
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;