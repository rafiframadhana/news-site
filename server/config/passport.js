import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';

export default (passport) => {
  // JWT Strategy
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET
      },
      async (jwt_payload, done) => {
        try {
          const user = await User.findById(jwt_payload.id).select('-password');
          if (user) {
            return done(null, user);
          }
          return done(null, false);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );

  // Local Strategy for login
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password'
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email: email.toLowerCase() });
          
          if (!user) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          if (!user.isActive) {
            return done(null, false, { message: 'Account is deactivated' });
          }

          const isValidPassword = await user.comparePassword(password);
          
          if (!isValidPassword) {
            return done(null, false, { message: 'Invalid credentials' });
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
};
