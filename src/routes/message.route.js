import { Router} from 'express';
import jwtVerify from '../middlewares/auth.middleware';
const router = Router();

router.route('/').get(jwtVerify,)


export default router;
