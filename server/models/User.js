const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const SessionSchema = new mongoose.Schema({
  loginTime: {
    type: Date,
    default: Date.now
  },
  logoutTime: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  profilePicture: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    emailUpdates: {
      type: Boolean,
      default: true
    }
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  sessions: [SessionSchema],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create virtual properties for associated data
UserSchema.virtual('journals', {
  ref: 'Journal',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

UserSchema.virtual('moods', {
  ref: 'Mood',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

UserSchema.virtual('chatMessages', {
  ref: 'ChatMessage',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Record login session
UserSchema.methods.recordLogin = function(ipAddress, userAgent) {
  const session = {
    loginTime: Date.now(),
    ipAddress,
    userAgent,
    isActive: true
  };
  
  this.sessions.push(session);
  this.lastActive = Date.now();
  
  return session;
};

// Record logout
UserSchema.methods.recordLogout = function(sessionId) {
  const session = this.sessions.id(sessionId);
  
  if (session) {
    session.logoutTime = Date.now();
    session.isActive = false;
  }
  
  return session;
};

module.exports = mongoose.model('User', UserSchema); 