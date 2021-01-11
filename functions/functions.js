

requesterror = function(url, response, cb){
    if (response == 200) {
      cb(false);
    } else if (response == 400) {
      cb('400 bad request **' + url + '**');
    } else if (response == 403) {
      cb('403 Forbidden. Invalid api key **' + url + '**');
    } else if (response == 404) {
      cb('404 Not found **' + url + '**');
    } else if (response == 415) {
      cb('415 unsupported Media Type **' + url + '**');
    } else if (response == 429) {
      cb('429 Rate limit exceeded **' + url + '**');
    } else if (response == 500) {
      cb('500 internal server error **' + url + '**');
    } else if (response == 503) {
      cb('503 service unavailable **' + url + '**');
    }
  }



  module.exports = {
      requesterror
  }