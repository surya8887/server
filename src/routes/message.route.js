import { Router} from 'express';
import jwtVerify from '../middlewares/auth.middleware.js';
import { getMessage,getUsersForSidebar,sendMessage } from '../controllers/message.controller.js';
const router = Router();

router.route('/users').get(jwtVerify,getUsersForSidebar)
router.route('/:id').post(jwtVerify, sendMessage);



export default router;
