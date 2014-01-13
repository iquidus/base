var crypto = require('crypto')
  , querystring = require('querystring');

module.exports = {
    url: function (email, options, https, cb) {
      var baseURL = (https && "https://secure.gravatar.com/avatar/") || 'http://www.gravatar.com/avatar/';
      var queryData = querystring.stringify(options);
      var query = (queryData && "?" + queryData) || "";

      return cb(baseURL + crypto.createHash('md5').update(email.toLowerCase().trim()).digest('hex') + query);
    }
};

