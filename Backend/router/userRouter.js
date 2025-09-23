import express from "express"
import rateLimit from "express-rate-limit"
import { addNewAdmin, addNewDoctor, getAllDoctors, getUserDetails, login, logoutAdmin, logoutPatient, patientRegister } from "../controller/userController.js";
import { isAdminAuthenticated, isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later."
});

router.post("/patient/register", limiter, patientRegister)
router.post("/login", limiter, login)
router.post("/admin/addnew", limiter, isAdminAuthenticated, addNewAdmin)
router.get("/doctors", limiter, getAllDoctors)
router.get("/admin/me", limiter, isAdminAuthenticated, getUserDetails)
router.get("/patient/me", limiter, isPatientAuthenticated, getUserDetails)
router.get("/admin/logout", limiter, isAdminAuthenticated, logoutAdmin)
router.get("/patient/logout", limiter, isPatientAuthenticated, logoutPatient)
router.post("/doctor/addnew", limiter, isAdminAuthenticated, addNewDoctor)



export default router;
