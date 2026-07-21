const Category = require("../models/Category");

// Create Category
const createCategory = async (req,res)=>{
    try{

        const category = await Category.create(req.body);

        res.status(201).json({
            success:true,
            message:"Category Created",
            category
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }
};

// Get Categories
const getCategories = async(req,res)=>{

    try{

        const categories = await Category.find();

        res.status(200).json({
            success:true,
            count:categories.length,
            categories
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

// Update Category
const updateCategory = async(req,res)=>{

    try{

        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            {new:true}
        );

        res.status(200).json({
            success:true,
            category
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

// Delete Category
const deleteCategory = async(req,res)=>{

    try{

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success:true,
            message:"Category Deleted"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

module.exports={
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
};