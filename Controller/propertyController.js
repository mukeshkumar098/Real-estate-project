import { propertyModel } from "../Models/PropertyModel.js";
import { userModel } from "../Models/userModel.js";


const addProperties = async (req, res) => {
  try {
    const { title, description, property_type, latitude, longitude, price, location } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized: Please log in' });
    }

    const seller = await userModel.findById(req.user.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({ message: 'Only sellers can add properties' });
    }

    if (!seller.isVerified) {
      return res.status(403).json({ message: 'You must be verified by an admin to add properties' });
    }

    if (!title || !description || !price || !location || !property_type || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageUrls = req.files ? req.files.map((file) => file.location) : [];

    const newProperty = new propertyModel({
      title,
      description,
      price,
      location,
      images: imageUrls,
      property_type,
      latitude,
      longitude,
      seller: req.user.id,
    });

    await newProperty.save();

    res.status(201).json({ message: 'Property added successfully', property: newProperty });
  } catch (error) {
    console.error('Error adding property:', error);
    res.status(500).json({ message: 'Error adding property', error });
  }
};





  const getAllProperties = async (req, res) => {
    try {
      const properties = await propertyModel.find();
      console.log(properties);
      res.send(properties)
    
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  // const updateProperty = async (req, res) => {
  //   try {
  //     const { id } = req.params;
  //     const updatedData = req.body;


  //     console.log(id,updatedData,"id");
      
  
  //     const property = await propertyModel.findById(id);
  //     console.log(property,"property");
      
  
  //     if (!property) {
  //       return res.status(404).json({ message: "Property not found" });
  //     }

  //     console.log(req.user.id,"ndsffnnfnkj");
      
  
  //     if (property.seller.toString() !== req.user.id) {
  //       return res.status(403).json({ message: "You are not authorized to update this property" });
  //     }
  
  //     const updatedProperty = await propertyModel.findByIdAndUpdate(
  //       id,
  //       updatedData,
  //       { new: true }
  //     );
  
  //     res.status(200).json({
  //       message: "Property updated successfully",
  //       property: updatedProperty,
  //     });
  //   } catch (error) {
  //     console.error("Error updating property:", error);
  //     res.status(500).json({ message: "Server error" });
  //   }
  // };
  


  const deleteProperty = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id);


      
      const property = await propertyModel.findById(id);
      console.log(property,"property");
      
      if (property.seller.toString() !== req.user.id) {
        return res.status(403).json({ message: "You are not authorized to update this property" });
      }
      
  
      const deletedProperty = await propertyModel.findByIdAndDelete(id);
  
      if (!deletedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json({ message: "Property deleted successfully" });
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


 const getPropertyById = async (req, res) => {
    try {
      const { id } = req.params;
      const property = await propertyModel.findById(id);
  
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
  
      res.status(200).json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Server error" });
    }
  };


  const searchProperties = async (req, res) => {
    try {
      const { location, price, property_type } = req.query;
  
      const filter = {};
  
      if (location) {
        filter.location = { $regex: location, $options: 'i' };
      }
  
      if (property_type) {
        filter.property_type = { $regex: property_type, $options: 'i' }; // Corrected 'type' to 'property_type'
      }
  
      if (price) {
        filter.price = { $lte: Number(price) };
      }
  
      const properties = await propertyModel.find(filter);
      res.status(200).json(properties);
    } catch (error) {
      console.error('Error searching properties:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  






export {addProperties,getAllProperties,getPropertyById,searchProperties,deleteProperty};