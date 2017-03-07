// Packages
require("rootpath")();
var _ = require("lodash");
var emptyBlueprint = require(__base + "config/data/profileBlueprint");

module.exports = function(profile) {
    // Copy empty blueprint
    var blueprint = _.cloneDeepWith(emptyBlueprint);

    // Copy profile
    profile = _.cloneDeepWith(profile);

    // Check if personal property exists
    if (profile.hasOwnProperty("personal")) {
        // Loop over the personal properties
        _.forOwn(blueprint.personal, function(v, k) {
            // Overwrite value or use default from blueprint
            v.value = profile.personal[k] || v.value;
        });
        // Replace personal info on the profile with the blueprint profile
        profile.personal = blueprint.personal;
    }

    return profile;
};
