/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./lib/routes')
  , settings = require('./lib/settings')
  , http = require('http')
  , path = require('path')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , db = require('./lib/database')
  , flash = require('connect-flash');
var app = express();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/signin');
}

// all environments
app.set('port', settings.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon(settings.favicon));
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('!Qu1dU5um$'));
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(app.router);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// locals
app.locals.title = settings.title;
app.locals.registration = settings.registration;

// routes
app.get('/', routes.index.get);
app.get('/license', routes.license.get);
app.get('/signin', routes.signin.get);
app.post('/signin', passport.authenticate('local',
  {
    successRedirect: '/settings',
    failureRedirect: '/signin',
    failureFlash: 'Invalid username or password'
  })
);

app.get('/register', routes.register.get);
app.post('/register', routes.register.post);
app.get('/settings', ensureAuthenticated, routes.settings.get);
app.post('/gravatar', ensureAuthenticated, routes.settings.gravatar);
app.post('/changepw', ensureAuthenticated, routes.settings.changepw);
app.post('/changemail', ensureAuthenticated, routes.settings.changeEmail);
app.post('/changename', ensureAuthenticated, routes.settings.changeUsername);
app.get('/users', ensureAuthenticated, routes.users.get);
app.post('/users', ensureAuthenticated, routes.users.post);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// database
var dbString = "mongodb://" + settings.dbsettings.address;
dbString = dbString + ":" + settings.dbsettings.port;
dbString = dbString + "/" + settings.dbsettings.database;

db.connect(dbString, function() {
  db.adminExists(function(exists) {
    if (exists == false) {
      console.log('no admin accounts found, creating now..');
      db.create_user('admin', 'admin@local.host', '!Qu1dU5Ba$e', true, true, function(){
        console.log('You can now login with:');
        console.log('Email: admin@local.host');
        console.log('Password: !Qu1dU5Ba$e');
        console.log('It is recommended to change the admin users username, email and password as soon as possible.');
      });
    }
  });
  http.createServer(app).listen(app.get('port'), function(){
    console.log(settings.title + ': listening on port ' + app.get('port'));
  });
});
