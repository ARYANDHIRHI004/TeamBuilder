import passport from 'passport'
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { env } from '../env.js';
import { prisma } from '../db/db.js';
import ApiError from './apiError.js';

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

        const registeredUser = await prisma.registeredUser.findFirst({
          where:{
            userEmail: profile.emails[0].value
          }
        })

        if(!registeredUser){
            throw new ApiError('User not registered',400)
        }

        const existedUser = await prisma.user.findUnique({
            where:{
                email: profile.emails[0].value
            }
        })

        if(!existedUser){
            const user:any = await prisma.user.create({
                data: {
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    isEmailVerified: true
                }
            })
            await prisma.systemRoles.create({
              data:{
                userId: user.id,
                role:"ADMIN"
              }
            })
            return done(null, user);
        }
        return done(null, existedUser);

      } catch (err) {
        done(err, null);
      }
    }
  )
);

export default passport