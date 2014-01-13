var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  bcrypt = require('bcrypt'),
  SALT_WORK_FACTOR = 10,
  MAX_LOGIN_ATTEMPTS = 3,
  LOCK_TIME = 1 * 60 * 60 * 1000; //1 hour
 
var UserSchema = new Schema({
  username: { type: String, required: true, index: { unique: true } },
  email: { type: String , required: true, unique: true },
  password: { type: String, required: true },
  avatarURL: { type: String, default: "/images/avatar/default.png" },
  gravatar: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  admin: {type: Boolean, default: false },
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: { type: Number },
  lastActivity: { type: Number, default: Date.now }
});

UserSchema.virtual('isLocked').get(function() {
  // check for a future lockUntil timestamp
  return !!(this.lockUntil && this.lockUntil > Date.now());
});
 
UserSchema.pre('save', function(next) {
  var user = this;
  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next(); 
  // generate a salt
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
  if (err) return next(err);
   
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
       
      // override the cleartext password with the hashed one
      user.password = hash;
      next();
    });
  });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

UserSchema.methods.incLoginAttempts = function(cb) {
  // if we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.update({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    }, cb);
  }
  // otherwise we're incrementing
  var updates = { $inc: { loginAttempts: 1 } };
  // lock the account if we've reached max attempts and it's not locked already
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference 
var reasons = UserSchema.statics.failedLogin = {
  NOT_FOUND: 0,
  PASSWORD_INCORRECT: 1,
  MAX_ATTEMPTS: 2,
  DISABLED: 3
};

UserSchema.static('getAuthenticated' , function(username, password, cb) {
  this.findOne({ email: username }, function(err, user) {
    if (err) return cb(err);

    // make sure the user exists
    if (!user) {
      return cb(null, null, reasons.NOT_FOUND);
    }
    if (user.enabled !== true) {
      return cb(null, null, reasons.DISABLED);
    }
    // check if the account is currently locked
    if (user.isLocked) {
      // just increment login attempts if account is already locked
      return user.incLoginAttempts(function(err) {
        if (err) return cb(err);
        return cb(null, null, reasons.MAX_ATTEMPTS);
      });
    }

    // test for a matching password
    user.comparePassword(password, function(err, isMatch) {
      if (err) return cb(err);
      // check if the password was a match
      if (isMatch) {
        // if there's no lock or failed attempts, just return the user
        if (!user.loginAttempts && !user.lockUntil) return cb(null, user);
        // reset attempts and lock info
        var updates = {
          $set: { loginAttempts: 0 },
          $unset: { lockUntil: 1 }
        };
        return user.update(updates, function(err) {
          if (err) return cb(err);
          return cb(null, user);
        });
      }
      // password is incorrect, so increment login attempts before responding
      user.incLoginAttempts(function(err) {
        if (err) return cb(err);
          return cb(null, null, reasons.PASSWORD_INCORRECT);
      });
    });
  });
});

UserSchema.static('getUserByName', function(username, cb) {
  this.findOne({username: username}, function(err, user) {
    if(user) {
      return cb(user);
    } else {
      return cb();
    }
  });
});

UserSchema.static('userExists', function(username, cb) {
  this.getUserByName(username, function(user) {
    if(user) {
      return cb(true);
    } else {
      return cb(false);
    }
  });
});

UserSchema.static('emailExists', function(email, cb) {
  this.findOne({email: email}, function(err, user) {
    if(user) {
      return cb(true);
    } else {
      return cb(false);
    }
  });
});

UserSchema.static('adminExists', function(cb) {
  this.findOne({admin: true}, function(err, user) {
    if(user) {
      return cb(true);
    } else {
      return cb(false);
    }
  });
});

module.exports = mongoose.model('User', UserSchema);