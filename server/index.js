require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/focusblock';

const app = express();
app.use(cors());
app.use(express.json());

const blockedWebsiteSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    category: { type: String },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const timeBlockSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    daysOfWeek: {
      type: [Number],
      required: true,
      validate: (value) => value.every((day) => day >= 0 && day <= 6),
    },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    passwordHash: { type: String, required: true },
    timezoneOffset: { type: Number, default: 0 },
    blockedWebsites: [blockedWebsiteSchema],
    timeBlocks: [timeBlockSchema],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

const hashPassword = (password) =>
  crypto.createHash('sha256').update(password).digest('hex');

const sanitizeUser = (userDoc) => ({
  id: userDoc._id.toString(),
  email: userDoc.email,
  username: userDoc.username,
  timezoneOffset: userDoc.timezoneOffset || 0,
});

const serializeWebsite = (siteDoc) => ({
  id: siteDoc._id.toString(),
  url: siteDoc.url,
  category: siteDoc.category,
  addedAt: siteDoc.addedAt,
});

const serializeTimeBlock = (blockDoc) => ({
  id: blockDoc._id.toString(),
  name: blockDoc.name,
  startTime: blockDoc.startTime,
  endTime: blockDoc.endTime,
  daysOfWeek: blockDoc.daysOfWeek,
  isActive: blockDoc.isActive,
});

const buildUserPayload = (userDoc) => ({
  user: sanitizeUser(userDoc),
  blockedWebsites: (userDoc.blockedWebsites || []).map(serializeWebsite),
  timeBlocks: (userDoc.timeBlocks || []).map(serializeTimeBlock),
});

const isUrlMatch = (blockedUrl, urlToTest) => {
  try {
    const blocked = new URL(blockedUrl.includes('://') ? blockedUrl : `https://${blockedUrl}`);
    const incoming = new URL(urlToTest);
    return incoming.hostname === blocked.hostname || incoming.hostname.endsWith(`.${blocked.hostname}`);
  } catch (error) {
    return urlToTest.includes(blockedUrl);
  }
};

const isBlockActive = (block, date = new Date(), timezoneOffset = 0) => {
  if (!block.isActive) {
    return false;
  }

  const localDate = new Date(date.getTime() - timezoneOffset * 60000);
  if (!block.daysOfWeek.includes(localDate.getDay())) {
    return false;
  }

  const [startH, startM] = block.startTime.split(':').map(Number);
  const [endH, endM] = block.endTime.split(':').map(Number);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;
  const nowMinutes = localDate.getHours() * 60 + localDate.getMinutes();

  if (endMinutes < startMinutes) {
    return nowMinutes >= startMinutes || nowMinutes < endMinutes;
  }

  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password, timezoneOffset } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ message: 'Email, username and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered.' });
    }

    const user = await User.create({
      email,
      username,
      passwordHash: hashPassword(password),
      timezoneOffset: typeof timezoneOffset === 'number' ? timezoneOffset : 0,
      blockedWebsites: [],
      timeBlocks: [],
    });

    res.json(buildUserPayload(user));
  } catch (error) {
    console.error('Register error', error);
    res.status(500).json({ message: 'Unable to register user.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, timezoneOffset } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (typeof timezoneOffset === 'number' && user.timezoneOffset !== timezoneOffset) {
      user.timezoneOffset = timezoneOffset;
      await user.save();
    }

    res.json(buildUserPayload(user));
  } catch (error) {
    console.error('Login error', error);
    res.status(500).json({ message: 'Unable to login user.' });
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(buildUserPayload(user));
  } catch (error) {
    console.error('Fetch user error', error);
    res.status(500).json({ message: 'Unable to fetch user data.' });
  }
});

app.post('/api/users/:userId/blocked-sites', async (req, res) => {
  try {
    const { url, category } = req.body;
    if (!url) {
      return res.status(400).json({ message: 'URL is required.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.blockedWebsites.push({ url, category: category || undefined, addedAt: new Date() });
    await user.save();
    const created = user.blockedWebsites[user.blockedWebsites.length - 1];

    res.status(201).json(serializeWebsite(created));
  } catch (error) {
    console.error('Add blocked site error', error);
    res.status(500).json({ message: 'Unable to add blocked site.' });
  }
});

app.delete('/api/users/:userId/blocked-sites/:siteId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.blockedWebsites.pull(req.params.siteId);
    await user.save();

    res.status(204).end();
  } catch (error) {
    console.error('Delete blocked site error', error);
    res.status(500).json({ message: 'Unable to remove blocked site.' });
  }
});

app.post('/api/users/:userId/time-blocks', async (req, res) => {
  try {
    const { name, startTime, endTime, daysOfWeek, isActive = true } = req.body;
    if (!name || !startTime || !endTime || !Array.isArray(daysOfWeek)) {
      return res.status(400).json({ message: 'Invalid time block payload.' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.timeBlocks.push({ name, startTime, endTime, daysOfWeek, isActive });
    await user.save();
    const created = user.timeBlocks[user.timeBlocks.length - 1];

    res.status(201).json(serializeTimeBlock(created));
  } catch (error) {
    console.error('Add time block error', error);
    res.status(500).json({ message: 'Unable to add time block.' });
  }
});

app.patch('/api/users/:userId/time-blocks/:blockId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const block = user.timeBlocks.id(req.params.blockId);
    if (!block) {
      return res.status(404).json({ message: 'Time block not found.' });
    }

    Object.assign(block, req.body);
    await user.save();

    res.json(serializeTimeBlock(block));
  } catch (error) {
    console.error('Update time block error', error);
    res.status(500).json({ message: 'Unable to update time block.' });
  }
});

app.delete('/api/users/:userId/time-blocks/:blockId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.timeBlocks.pull(req.params.blockId);
    await user.save();

    res.status(204).end();
  } catch (error) {
    console.error('Delete time block error', error);
    res.status(500).json({ message: 'Unable to remove time block.' });
  }
});

app.get('/api/block-check', async (req, res) => {
  try {
    const { userId, url } = req.query;
    if (!userId || !url) {
      return res.status(400).json({ blocked: false, message: 'userId and url are required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ blocked: false, message: 'User not found.' });
    }

    const blockedSites = user.blockedWebsites || [];
    const timeBlocks = user.timeBlocks || [];

    const matchingSite = blockedSites.find((site) => isUrlMatch(site.url, url));
    if (!matchingSite) {
      return res.json({ blocked: false });
    }

    const now = new Date();
    const activeBlock = timeBlocks.find((block) =>
      isBlockActive(block, now, user.timezoneOffset || 0)
    );
    if (!activeBlock) {
      return res.json({ blocked: false });
    }

    res.json({
      blocked: true,
      reason: `Blocked by ${activeBlock.name}`,
      block: serializeTimeBlock(activeBlock),
      site: serializeWebsite(matchingSite),
    });
  } catch (error) {
    console.error('Block check error', error);
    res.status(500).json({ blocked: false, message: 'Unable to evaluate block.' });
  }
});

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    process.exit(1);
  }
};

startServer();
