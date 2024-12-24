import { Router } from "express";
import { postcreate, postget ,createmiragepost,getmiragepost} from "../controllers/post.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();



router.post("/createpost" ,verifyJWT, postcreate)
router.get("/showpost",postget)
router.post("/createmiragepost",createmiragepost)
router.get("/showmiragepost",getmiragepost)



export default router;