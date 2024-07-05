
const express = require('express')
const mongoose = require('mongoose');
require('dotenv').config()
const cors = require('cors');
const Product = require('./Models/Products');
const Products = require('./Models/Products');
const Categories = require('./Models/Categories');
const multer = require('multer');
const Category = require('./Models/Categories');
const cloudinary = require('cloudinary').v2;
const nodemailer = require('nodemailer');
const User = require('./Models/User');
const Otp = require('./Models/UserOTP');
const Wishlist = require('./Models/Wishlist');



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

// Create a new user
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'anuragma807@gmail.com',
      pass: 'qdgcydiuuqieryny',
    },
  });
app.post('/signup', async (req, res) => {
    const { username, email, password, phoneNumber } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists.' });
      }
  
      const newUser = new User({ username, email, password, phoneNumber });
      await newUser.save();
  
      // Generate and save OTP
      const OTP = Math.floor(1000 + Math.random() * 9000).toString();
      const otpEntry = new Otp({ email, otp: OTP });
      await otpEntry.save();
  
      const mailOptions = {
        from: 'anuragma807@gmail.com',
        to: email,
        subject: 'Your OTP for authentication',
        text: `Your OTP is: ${OTP}`
      };
  
      // Send OTP via email
      await transporter.sendMail(mailOptions);
  
      res.status(201).json({ message: 'User registered successfully and OTP sent.', user: newUser });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while registering the user or sending OTP.' });
    }
  });

// Login API
app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(401).json({ error: 'User not registered', status: 'false' });
      }
  
      if (password === user.password) {
        res.status(200).json({
          message: 'Authentication successful',
          status: 'ok',
          email: user.email,
          username: user.username,
          phoneNumber: user.phoneNumber,
        });
      } else {
        res.status(401).json({ message: 'Please enter correct email or password', status: 'invalid' });
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//   Verify OTP
app.post('/verifyotp', async (req, res) => {
    try {
      const { email, otp } = req.body;
  
      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required.', status: 'false' });
      }
  
      const otpEntry = await Otp.findOne({ email, otp });
  
      if (!otpEntry) {
        return res.status(401).json({ error: 'Invalid OTP or email.', status: 'invalid' });
      }
  
      const user = await User.findOne({ email });
      if (user) {
        return res.status(200).json({
          message: 'OTP verified successfully.',
          status: 'ok',
          user: {
            email: user.email,
            username: user.username,
            phoneNumber: user.phoneNumber,
          }
        });
      } else {
        return res.status(404).json({ error: 'User not found.', status: 'false' });
      }
    } catch (error) {
      console.error('Error during OTP verification:', error);
      res.status(500).json({ error: 'Internal Server Error', status: 'false' });
    }
  });

//   Wishlist API
app.post('/wishlist', async (req, res) => {
    const { username, title, description, price, details, brand, colors, sizes, gender, images, category } = req.body;
  
    if (!username || !title || !description || !price) {
      return res.status(400).json({ error: 'Username, title, description, and price are required.' });
    }
  
    try {
      // Create a new wishlist item
      const newWishlistItem = new Wishlist({
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
      });
      await newWishlistItem.save();
  
      // Find the user by username and update their wishlist
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }
  
      user.wishlist.push(newWishlistItem);
      await user.save();
  
      res.status(201).json({ message: 'Wishlist item added successfully.', wishlistItem: newWishlistItem, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while adding the wishlist item.' });
    }
  });



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

// List Products based on id 
app.get('/products/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
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

app.post('/upload2', upload.array('images'), async (req, res) => {
    console.log('Files:', req.files);
    console.log('Body:', req.body);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const imageUploadPromises = req.files.map(file => cloudinary.uploader.upload(file.path));
        const uploadResults = await Promise.all(imageUploadPromises);

        const imageUrls = uploadResults.map(result => result.secure_url);

        const newProduct = {
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
        };

        const savedProduct = await new Product(newProduct).save();

        let category = await Category.findOne({ name: req.body.category });
        if (!category) {
            category = new Category({ name: req.body.category, products: [] });
        }

        category.products.push(savedProduct);
        await category.save();

        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// All Categories api start


app.post('/categories', upload.single('image'), async (req, res) => {
    console.log('File:', req.file);
    console.log('Body:', req.body);

    if (!req.file) {
        
        return res.status(400).json({ error: 'No image uploaded' });
    }

    try {
        const uploadResult = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = uploadResult.secure_url;

        const newCategory = new Category({
            name: req.body.name,
            products: req.body.products || [],
            image: imageUrl
        });

        await newCategory.save();

        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get categories
app.get('/categories', async (req, res) => {
    try {
        const categories = await Categories.find({});
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).send(error);
    }
});

//   Update
app.put('/categories/:id', upload.single('image'), async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
  
      const uploadResult = await cloudinary.uploader.upload(req.file.path);
      const imageUrl = uploadResult.secure_url;
      updateData.image = imageUrl;
  
      const category = await Category.findByIdAndUpdate(id, updateData, {
        new: true, 
        runValidators: true 
      });
  
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
  
      res.status(200).json(category);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

// Delete categories api
app.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) {
            return res.status(404).send();
        }
        res.send(category);
    } catch (error) {
        res.status(500).send(error);
    }
});











app.listen(port, () => {
    console.log("Working ", port)
})

