import express from 'express';
import { userLogin, userRigster } from '../Controller/userController.js';
import { adminVerifySeller } from '../Middelware/verifySeller.js';
import { verifyRole } from '../Middelware/isAuthendicate.js';
const router = express.Router();

router.put("/admin-verify-seller/:id",verifyRole(["admin"]),adminVerifySeller)
router.post("/register",userRigster)
router.post("/login",userLogin);

export {router as userRoute }