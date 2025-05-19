// server.js
import express5 from "express";
import cors from "cors";

// config/db.js
import mongoose from "mongoose";
var connectDB = async () => {
  await mongoose.connect("mongodb+srv://greatstack:123123123@cluster0.3xpkeaq.mongodb.net/food-del").then(() => console.log("DB Connected"));
};

// routes/userRoute.js
import express from "express";

// controllers/userController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// models/userModel.js
import mongoose2 from "mongoose";
var userSchema = new mongoose2.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  cartData: { type: Object, default: {} }
}, { minimize: false });
var userModel = mongoose2.models.user || mongoose2.model("user", userSchema);
var userModel_default = userModel;

// controllers/userController.js
var createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};
var loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel_default.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await userModel_default.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new userModel_default({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// routes/userRoute.js
var userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
var userRoute_default = userRouter;

// routes/foodRoute.js
import express2 from "express";

// models/foodModel.js
import mongoose3 from "mongoose";
var foodSchema = new mongoose3.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true }
});
var foodModel = mongoose3.models.food || mongoose3.model("food", foodSchema);
var foodModel_default = foodModel;

// controllers/foodController.js
import fs from "fs";
var listFood = async (req, res) => {
  try {
    const foods = await foodModel_default.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var addFood = async (req, res) => {
  try {
    let image_filename = `${req.file.filename}`;
    const food = new foodModel_default({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      image: image_filename
    });
    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var removeFood = async (req, res) => {
  try {
    const food = await foodModel_default.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {
    });
    await foodModel_default.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// routes/foodRoute.js
import multer from "multer";
var foodRouter = express2.Router();
var storage = multer.diskStorage({
  destination: "uploads",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  }
});
var upload = multer({ storage });
foodRouter.get("/list", listFood);
foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.post("/remove", removeFood);
var foodRoute_default = foodRouter;

// server.js
import "dotenv/config";

// routes/cartRoute.js
import express3 from "express";

// controllers/cartController.js
var addToCart = async (req, res) => {
  try {
    let userData = await userModel_default.findOne({ _id: req.body.userId });
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModel_default.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Added To Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var removeFromCart = async (req, res) => {
  try {
    let userData = await userModel_default.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (cartData[req.body.itemId] > 0) {
      cartData[req.body.itemId] -= 1;
    }
    await userModel_default.findByIdAndUpdate(req.body.userId, { cartData });
    res.json({ success: true, message: "Removed From Cart" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var getCart = async (req, res) => {
  try {
    let userData = await userModel_default.findById(req.body.userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// middleware/auth.js
import jwt2 from "jsonwebtoken";
var authMiddleware = async (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.json({ success: false, message: "Not Authorized Login Again" });
  }
  try {
    const token_decode = jwt2.verify(token, process.env.JWT_SECRET);
    req.body.userId = token_decode.id;
    next();
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
var auth_default = authMiddleware;

// routes/cartRoute.js
var cartRouter = express3.Router();
cartRouter.post("/get", auth_default, getCart);
cartRouter.post("/add", auth_default, addToCart);
cartRouter.post("/remove", auth_default, removeFromCart);
var cartRoute_default = cartRouter;

// routes/orderRoute.js
import express4 from "express";

// models/orderModel.js
import mongoose4 from "mongoose";
var orderSchema = new mongoose4.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false }
});
var orderModel = mongoose4.models.order || mongoose4.model("order", orderSchema);
var orderModel_default = orderModel;

// controllers/orderController.js
import Stripe from "stripe";
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
var currency = "usd";
var deliveryCharge = 5;
var frontend_URL = "http://localhost:5173";
var placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel_default({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address
    });
    await newOrder.save();
    await userModel_default.findByIdAndUpdate(req.body.userId, { cartData: {} });
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name
        },
        unit_amount: item.price * 100
      },
      quantity: item.quantity
    }));
    line_items.push({
      price_data: {
        currency,
        product_data: {
          name: "Delivery Charge"
        },
        unit_amount: deliveryCharge * 100
      },
      quantity: 1
    });
    const session = await stripe.checkout.sessions.create({
      success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment"
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var placeOrderCod = async (req, res) => {
  try {
    const newOrder = new orderModel_default({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true
    });
    await newOrder.save();
    await userModel_default.findByIdAndUpdate(req.body.userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var listOrders = async (req, res) => {
  try {
    const orders = await orderModel_default.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var userOrders = async (req, res) => {
  try {
    const orders = await orderModel_default.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
var updateStatus = async (req, res) => {
  console.log(req.body);
  try {
    await orderModel_default.findByIdAndUpdate(req.body.orderId, { status: req.body.status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    res.json({ success: false, message: "Error" });
  }
};
var verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel_default.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel_default.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    res.json({ success: false, message: "Not  Verified" });
  }
};

// routes/orderRoute.js
var orderRouter = express4.Router();
orderRouter.get("/list", listOrders);
orderRouter.post("/userorders", auth_default, userOrders);
orderRouter.post("/place", auth_default, placeOrder);
orderRouter.post("/status", updateStatus);
orderRouter.post("/verify", verifyOrder);
orderRouter.post("/placecod", auth_default, placeOrderCod);
var orderRoute_default = orderRouter;

// server.js
var app = express5();
var port = process.env.PORT || 4e3;
app.use(express5.json());
app.use(cors());
connectDB();
app.use("/api/user", userRoute_default);
app.use("/api/food", foodRoute_default);
app.use("/images", express5.static("uploads"));
app.use("/api/cart", cartRoute_default);
app.use("/api/order", orderRoute_default);
app.get("/", (req, res) => {
  res.send("API Working");
});
app.listen(port, () => console.log(`Server started on http://localhost:${port}`));
