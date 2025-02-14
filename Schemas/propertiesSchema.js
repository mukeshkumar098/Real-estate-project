import mongoose from "mongoose";

 const propertiesSchema= new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    property_type: {
      type: String,
      enum: ['Apartment', 'House', 'Commercial', 'Land'],
      required: true,
    },
    images: [{ type: String }],
    price: { type: Number, required: true },
    location: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Available', 'Sold', 'Rented', 'Under Review'],
      default: 'Available',
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);


export {propertiesSchema}