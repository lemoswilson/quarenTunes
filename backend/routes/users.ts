import Router from 'express-promise-router';
import passport from 'passport';
import '../config/passport';
import { deleteUser, signUp, update, getProjects, signIn, google } from '../controllers/users';
import { validateBody, schemas } from '../helpers/routeHelpers';

const router = Router()
router.route('/signup').post(validateBody(schemas.authSchema), signUp);
router.route('/update').post(validateBody(schemas.authSchema), update);
router.route('/signin').post(validateBody(schemas.passSchema), passport.authenticate('local'), signIn);
router.route('/delete').delete(deleteUser);
router.route('/failed').get((_req, res) => res.send('failed login'));
router.route('/success').get((_req, res) => {
    res.send('success');
});
router.route('/projects').get(passport.authenticate('jwt', { session: false }), getProjects);
router.route('/auth/google').post(google);

export default router;