import express from 'express'
import { verifyRole } from '../Middelware/isAuthendicate.js';
import {addProperties, getAllProperties, getPropertyById, searchProperties} from '../Controller/propertyController.js'
import { upload } from '../Utils/S3.service.js';

const propertiesRoute=express.Router();
propertiesRoute.post("/add-properties",verifyRole(["seller"]),upload.array('images', 10),addProperties)
propertiesRoute.get("/getProperties",getAllProperties)
// propertiesRoute.put("/updateProperty/:id", verifyRole(["seller", "admin"]),updateProperty)
// propertiesRoute.delete("/deleteProperty/:id",deleteProperty)
propertiesRoute.get("/getPropertyById/:id",getPropertyById)
propertiesRoute.get("/searchProperties",searchProperties)


  export {propertiesRoute}