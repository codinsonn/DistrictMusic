// Packages
require("rootpath")();

var authConfig = require(__base + "config/auth");

module.exports = function(profile) {

  var profileEmail = profile.emails[0].value.toLowerCase();

  var idx = profileEmail.lastIndexOf('@');
  if (idx > -1 && profileEmail.slice(idx+1) === 'district01.be') {
    return true;
  }else if(authConfig.whitelistedEmails.indexOf(profileEmail) > -1){
    return true;
  }else{
    return false;
  }

};
