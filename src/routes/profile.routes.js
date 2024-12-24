import { Router } from "express";
import { createprofile } from "../controllers/profile.controller.js";
import { editprofile } from "../controllers/profile.controller.js";
import { showprofile } from "../controllers/profile.controller.js";
import { showuserprofile } from "../controllers/profile.controller.js";
import {allprofile} from "../controllers/profile.controller.js";
import {upload} from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();


router.post("/api/createprofile", upload.single("profilepic"), verifyJWT ,createprofile)

router.put("/api/editprofile",upload.single("profilepic"),verifyJWT, editprofile);

router.get("/api/showuserprofile",verifyJWT, showuserprofile);

router.get("/api/showprofile/:_id", showprofile);

router.get("/api/allprofile",allprofile);



export default router;