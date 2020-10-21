import Router from 'express-promise-router';
import passport from 'passport';
import '../config/passport';
import { deleteD, signUp, update, google, getProjects, signIn } from '../controllers/users';
import { validateBody, schemas } from '../helpers/routeHelpers';

const router = Router()
router.route('/signup').post(validateBody(schemas.authSchema), signUp);
router.route('/update').post(validateBody(schemas.authSchema), update);
router.route('/delete').delete(deleteD);
router.route('/projects').get(passport.authenticate('jwt', { session: false }), getProjects);
router.route('/signin').post(validateBody(schemas.passSchema), passport.authenticate('local'), signIn);
router.route('/google').post(passport.authenticate('google', { scope: ['profile'] }), google);

export default router;