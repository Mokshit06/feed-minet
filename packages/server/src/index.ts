import { Provider, User, UserRole } from '@prisma/client';
import pgSession from 'connect-pg-simple';
import cors from 'cors';
import 'dotenv-flow/config';
import express, { NextFunction, Request, Response } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from './lib/prisma';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin(origin, cb) {
      cb(null, true);
    },
  })
);

const PgStore = pgSession(expressSession);
const sessionMiddleware = expressSession({
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  store: new PgStore(),
});

app.use(sessionMiddleware);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const userProfile = await prisma.user.upsert({
          where: {
            socialId: profile.id,
          },
          create: {
            email: profile.emails[0].value,
            name: profile.displayName,
            socialId: profile.id,
            provider: Provider.GOOGLE,
            role: UserRole.STUDENT,
            image: profile.photos[0].value,
          },
          update: {
            name: profile.displayName,
            image: profile.photos[0].value,
          },
        });

        done(null, userProfile);
      } catch (error) {
        console.error(error);
        done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, (user as User).id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  console.error(err);

  res.status(500).json({ success: false, message: err.message });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
