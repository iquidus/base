/**
* The Settings Modul reads the settings out of settings.json and provides
* this information to the other modules
*/

var fs = require("fs");
var jsonminify = require("jsonminify");

function randomString(len)
{
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  var randomstring = '';
  len = len || 20
  for (var i = 0; i < len; i++)
  {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }
  return randomstring;
}

/**
* The app title, visible e.g. in the browser window
*/
exports.title = "iquidus-base";

/**
* The app favicon fully specified url, visible e.g. in the browser window
*/
exports.favicon = "favicon.ico";

/**
* The IP ep-lite should listen to
*/
exports.ip = "0.0.0.0";

/**
* The Port ep-lite should listen to
*/
exports.port = process.env.PORT || 9001;


/*
* Session Key, do not set this.
*/
exports.sessionkey = false;

/**
* This setting is passed to MongoDB to set up the database
*/
exports.dbsettings = { "database" : "basedb", "address" : "localhost", "port" : "27017" };

/**
* Registration settings
*/
exports.registration = { "enabled" : true, "mode" : "open" };

exports.reloadSettings = function reloadSettings() {
  // Discover where the settings file lives
  var settingsFilename = "settings.json";
  settingsFilename = "./" + settingsFilename;

  var settingsStr;
  try{
    //read the settings sync
    settingsStr = fs.readFileSync(settingsFilename).toString();
  } catch(e){
    console.warn('No settings file found. Continuing using defaults!');
  }

  // try to parse the settings
  var settings;
  try {
    if(settingsStr) {
      settingsStr = jsonminify(settingsStr).replace(",]","]").replace(",}","}");
      settings = JSON.parse(settingsStr);
    }
  }catch(e){
    console.error('There was an error processing your settings.json file: '+e.message);
    process.exit(1);
  }

  //loop trough the settings
  for(var i in settings)
  {
    //test if the setting start with a low character
    if(i.charAt(0).search("[a-z]") !== 0)
    {
      console.warn("Settings should start with a low character: '" + i + "'");
    }

    //we know this setting, so we overwrite it
    //or it's a settings hash, specific to a plugin
    if(exports[i] !== undefined || i.indexOf('ep_')==0)
    {
      exports[i] = settings[i];
    }
    //this setting is unkown, output a warning and throw it away
    else
    {
      console.warn("Unknown Setting: '" + i + "'. This setting doesn't exist or it was removed");
    }
  }

//  if(!exports.sessionkey){ // If the secretKey isn't set we also create yet another unique value here
//    exports.sessionkey = randomString(32);
//    console.warn("You need to set a sessionKey value in settings.json, this will allow your users to reconnect to your instance if it restarts");
//  }

};

// initially load settings
exports.reloadSettings();