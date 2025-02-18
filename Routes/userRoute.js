import express from 'express';
import { getUnverifiedSellers, getverifiedSellers, userLogin, userRigster } from '../Controller/userController.js';
import { adminVerifySeller } from '../Middelware/verifySeller.js';
import { verifyRole } from '../Middelware/isAuthendicate.js';
const router = express.Router();

router.put("/admin-verify-seller/:id",verifyRole(["admin"]),adminVerifySeller)
router.get("/getUnverifiedSellers",getUnverifiedSellers)
router.get("/getverifiedSellers",getverifiedSellers)
router.post("/register",userRigster)
router.post("/login",userLogin);

export {router as userRoute }