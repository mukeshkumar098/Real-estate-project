import express from 'express';
import { userLogin, userRigster } from '../Controller/userController.js';
const router = express.Router();


router.post("/register",userRigster)
router.post("/login",userLogin);

export {router as userRoute }