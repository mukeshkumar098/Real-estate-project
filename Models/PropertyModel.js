import mongoose from "mongoose"
import { propertiesSchema } from "../Schemas/propertiesSchema.js"


const propertyModel=mongoose.model("Property",propertiesSchema)


export {propertyModel}