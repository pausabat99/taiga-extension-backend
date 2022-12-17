const passport = require('passport')
const GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;

//AIXO EN PRODUCCIÓ S'HAURIA D'UTILITZAR VARIABLES D'ENTORN
const GOOGLE_CLIENT_ID = '866670743901-f4i7ln5i3sjva1q60kj1jjm7pgm225rk.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';

passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    return done(null, profile);
  }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});