
const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config()
const cors = require('cors');
const Product = require('./Models/Products');
const Products = require('./Models/Products');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const dburl = process.env.MONGOURL;
mongoose.connect(dburl)
const app = express()
const port = 8000;
app.use(express.json())
app.use(cors())

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.diskStorage({});
const upload = multer({ storage });

app.get('/', (req, res) => {
    res.end("Server started")
})

// Add Products
// app.post('/products', async (req, res) => {
//     const { title, description, price, details, brand, colors, sizes, gender, images, category } = req.body;

//     if (!title || !description || !price) {
//         return res.status(400).json({ error: 'Title, description, and price are required.' });
//     }

//     try {
//         const product = new Product({
//             title,
//             description,
//             price,
//             details,
//             brand,
//             colors,
//             sizes,
//             gender,
//             images,
//             category
//         });
//         await product.save();
//         res.status(201).json(product);
//     } catch (error) {
//         console.log(error);
//         console.error('Error creating product:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// List Products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Delete Product
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Update Products
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { title, description, price, details, brand, colors, sizes, gender, images, category } = req.body;

    try {
        const product = await Product.findByIdAndUpdate(id, {
            title,
            description,
            price,
            details,
            brand,
            colors,
            sizes,
            gender,
            images,
            category
        }, { new: true }); // { new: true } returns the updated document


        res.status(200).json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Add Products 
app.post('/upload', upload.array('images'), async (req, res) => {
    console.log('Files:', req.files); 
    console.log('Body:', req.body);   

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const imageUploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
        const uploadResults = await Promise.all(imageUploadPromises);

        const imageUrls = uploadResults.map(result => result.secure_url);

        const newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            details: req.body.details,
            brand: req.body.brand,
            colors: req.body.colors,
            sizes: req.body.sizes,
            gender: req.body.gender,
            images: imageUrls,
            category: req.body.category
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log("Working ", port)
})

