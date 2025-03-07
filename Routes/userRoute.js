import express from 'express';
import { forgetPassword, getUnverifiedSellers, getverifiedSellers, resetPassword, userLogin, userRigster } from '../Controller/userController.js';
import { adminVerifySeller } from '../Middelware/verifySeller.js';
import { verifyRole } from '../Middelware/isAuthendicate.js';
const router = express.Router();

router.put("/admin-verify-seller/:id",verifyRole(["admin"]),adminVerifySeller)
router.post("/register",userRigster)
router.post("/login",userLogin);
router.post('/forgot-passward', forgetPassword);
router.patch('/reset-password/:token',resetPassword);
router.get("/getUnverifiedSellers",getUnverifiedSellers)
router.get("/getverifiedSellers",getverifiedSellers)

export {router as userRoute }