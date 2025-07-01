import { Router} from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import {SignUp,Logout,Login} from '../controllers/user.controller.js';
const router = Router();

router.route('/signup').post(SignUp)
router.route('/login').post(Login)
router.route('/logout').get(verifyJwt,Logout)









export default router;
