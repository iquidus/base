var db = require('./database');
var gravatar = require('./gravatar');
var settings = require('./settings');

exports.index = {
  get: function(req, res){
    res.render('index', { active: 'home', user: req.user });
  }
};

exports.license = {
  get: function(req, res){
    res.render('license', { active: 'license', user: req.user });
  }
};

exports.register = {
  get: function(req, res){
    res.render('register', { active: 'register', messages: req.flash('error')});
  },
    post: function(req, res){
    if(req.body.passwd == req.body.passwd2) {
      db.usernameInUse(req.body.username, function(uresult){
          if (uresult == false) {
            db.emailInUse(req.body.email, function(eresult){
              if (eresult == false) {
                var enabled = true;
                if (settings.registration.mode !== "open") {
                  enabled = false;
                }
                db.create_user(req.body.username, req.body.email, req.body.passwd, enabled, false, function(){
                  req.flash('info', 'Account created successfully');
                  res.redirect('/signin');
                })
              } else {
                req.flash('error', "Email unavailable");
              res.redirect('/register');
              }
            });
          } else {
            //username not available
            req.flash('error', "Username unavailable");
                res.redirect('/register');
          }
        });
    } else {
      //passwords dont match
      req.flash('error', "password mismatch");
      res.redirect('/register');
    }
    }
};

exports.signin = {
  get: function(req, res){
    res.render('signin', { active: 'signin', messages: req.flash('error'), info: req.flash('info') });
  }
};

exports.settings = {
  get: function(req, res){
    res.render('settings', { active: 'settings', user: req.user, messages: req.flash('error'), info: req.flash('info')});
  },
  gravatar: function(req, res){
    if ( req.user.gravatar == false) {
      gravatar.url(req.user.email, {s: '256', r: 'pg'}, true, function(url){
        db.changeAvatar(req.user.username, url);
        db.setGravatar(req.user.username, true);
        req.flash('info', 'Gravatar enabled');
      });
    } else {
      db.changeAvatar(req.user.username, '/images/avatar/default.png');
      db.setGravatar(req.user.username, false);
      req.flash('info', 'Gravatar disabled');
    }
    res.redirect('/settings');
  },
  changepw: function(req, res){
    req.user.comparePassword(req.body.current, function(err, match){
      if(match){
        if(req.body.newpass == req.body.confirmpw) {
          db.changePassword(req.user, req.body.newpass);
          req.flash('info', 'Password changed succesfully' );
        } else {
          req.flash('error', 'Passwords do not match');
        }
      } else {
        req.flash('error', 'Passwords do not match');  
      }
      res.redirect('/settings');
    });
  },
  changeEmail: function(req, res){
    db.emailInUse(req.body.newemail, function(exists){
      if(exists == false){
        db.changeEmail(req.user.username, req.body.newemail); 
        req.flash('info', 'Email changed successfully');
        res.redirect('/settings'); 
      } else {
        req.flash('error', 'Email already in use');
        res.redirect('/settings')
      }
    });
  },
  changeUsername: function(req, res){
    db.usernameInUse(req.body.newname, function(exists){
      if(exists == false){
        db.changeUsername(req.user.username, req.body.newname); 
        req.flash('info', 'Username changed successfully');
        res.redirect('/settings'); 
      } else {
        req.flash('error', 'Username unavailable');
        res.redirect('/settings')
      }
    });
  }
};

exports.users = {
  get: function(req, res){
    db.getUsers(function(userdb){
      res.render('users', { active: 'users', user: req.user, users: userdb, messages: req.flash('error'), info: req.flash('info')});
    });
  },
  post: function(req, res){
    var action = req.body.submit;
    var users = Object.keys(req.body);
    if(action == "enable") {
      db.enableUsers(users, true);
      req.flash('info', '%s user account(s) enabled successfully', users.length -1);
      res.redirect('/users');
    }
    if(action == "disable") {
      db.enableUsers(users, false);
      req.flash('info', '%s user account(s) disabled successfully', users.length -1);
      res.redirect('/users');
    }
    if(action == "grant") {
      db.adminUsers(users, true);
      req.flash('info', '%s user account(s) granted admin successfully', users.length -1);
      res.redirect('/users');
    } 
    if(action == "revoke") {
      db.adminUsers(users, false);
      req.flash('info', '%s user account(s) revoked admin successfully', users.length -1);
      res.redirect('/users');
    } 
    if(action == "delete") {
      db.removeUsers(users);
      req.flash('info', '%s user account(s) deleted successfully', users.length -1);
      res.redirect('/users');
    } 
  }
};
