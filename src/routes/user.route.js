import { Router} from 'express';
import verifyJwt from '../middlewares/auth.middleware.js';
import {SignUp,Logout,Login,UpdateProfile} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();

router.route('/signup').post(SignUp);
router.route('/login').post(Login);

// 🔒 Protected Routes
router.route('/logout').get(verifyJwt, Logout);
router.route('/update-profile').patch(
  verifyJwt,
  upload.single('avatar'),
  UpdateProfile
);





export default router;
