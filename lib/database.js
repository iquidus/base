var mongoose = require('mongoose')
  , User = require('../models/user');
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// Define local strategy for Passport
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
  },
  function(email, password, done) {
    User.getAuthenticated(email, password, function(err, user) {
      return done(err, user);
    });
  }
));
      
// serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

module.exports = {

  // initialize DB
  connect: function(database, cb) {
    mongoose.connect(database, function(err) {
      if (err) {
        console.log('Unable to connect to database: %s', database);
        console.log('Aborting');
        process.exit(1);

      }
      console.log('Successfully connected to MongoDB');
      return cb();
    });
  },
  
  create_user: function(username, email, password, enabled, admin, cb){
    var newUser = new User({
      username: username,
      email: email,
      password: password,
      enabled: enabled,
      admin: admin
    });

    newUser.save(function(err) {
      if (err) {
        console.log(err);
        return cb();
      } else {
        console.log("user account created: %s", username);
        return cb();
      }
    });
  },

  usernameInUse: function(username, cb) {
    User.userExists(username, function(result) {
      if (result == true) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  },

  emailInUse: function(email, cb) {
    User.emailExists(email, function(result) {
      if (result == true) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  },

  setAdmin: function(username, state) {
    User.update({username: username}, {admin: state}, function() {
      console.log("%s: admin status changed to %s", username, state);
    });
  },

  setEnabled: function(username, state) {
    User.update({username: username}, {enabled: state}, function() {
      console.log("%s: enabled status changed to %s", username, state);
    });
  },

  enableUsers: function(users, state) {
    users.forEach(function(id, index){
      if(id != 'submit') {
        User.update({_id: id}, {enabled: state}, function() {
          console.log('%s: enabled changed to %s', id, state);
        });
      }
    });
  },

  adminUsers: function(users, state) {
    users.forEach(function(id, index){
      if(id != 'submit') {
        User.update({_id: id}, {admin: state}, function() {
          console.log('%s: admin changed to %s', id, state);
        });
      }
    });
  },

  changeEmail: function(username, email) {
    User.update({username:username}, {email: email}, function() {
      console.log("%s: email changed to %s", username, email);
    });
  },

  changeUsername: function(username, newname) {
    User.update({username:username}, {username: newname}, function() {
      console.log("%s: username changed to %s", username, newname);
    });
  },

  changeAvatar: function(username, url) {
    User.update({username:username}, {avatarURL: url}, function() {
      console.log("%s: avatar changed to %s", username, url);
    });
  },

  setGravatar: function(username, state) {
    User.update({username:username}, {gravatar: state}, function() {
      console.log("%s: gravatar status changed to %s", username, state);
    });
  },

  changePassword: function(user, password) {
    var u = user;
    u.password = password;
    u.save();
  },

  adminExists: function(cb) {
   User.findOne({admin: true}, function(err, user) {
      if(user) {
        return cb(true);
      } else {
        return cb(false);
      }
    });
  },

  getUsers: function(cb) {
    User.find({}, function (err, users) {
        return cb(users);
    });
  },

  removeUsers: function(users) {
    users.forEach(function(id, index){
      if(id != 'submit') {
        User.remove({_id: id}, function() {
          console.log('%s: deleted', id);
        });
      }
    });
  }
};
