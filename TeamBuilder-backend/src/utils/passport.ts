import passport from 'passport'
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from '../env.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/api/v1/auth/google/callback"
    },
    async (accessToken:any, refreshToken:any, profile:any, done:any) => {
      try {
        // Find or create user

        const user = {
          id: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName
        };

        return done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport