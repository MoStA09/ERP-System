const passport = require("passport");

exports.auth = function(authVariables){

    return passport.authenticate(authVariables);

}