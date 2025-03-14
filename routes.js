import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_routes from "./routes/auth_routes.js";
import category_routes from "./routes/category.routes.js";
import user_routes from "./routes/user_routes.js";
import insurance_routes from "./routes/insurance.routes.js";
import product_routes from './routes/product_routes.js';
import query_routes from "./routes/query_routes.js";
import addressRoute from "./routes/address.route.js";
import billingRoute from "./routes/billing.route.js";
import blog_routes from "./routes/blog_routes.js"
import faqs_routes from "./routes/faq_routes.js"
import ratingrouter from "./routes/rating.route.js";
import cartroute from "./routes/cart.routes.js";
import bank_routes from './routes/bank_details.routes.js';
import wallet_routes from './routes/wallet.route.js';
import withdraw_routes from './routes/withdraw.route.js';
import transactions_routes from './routes/transactionRoutes.js';
import paymet_routes from './routes/payment.routes.js';

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({limit: '50mb', extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "accesstoken"]
}));

app.use("/api/v1/address", addressRoute);
app.use("/api/v1/rating", ratingrouter);
app.use("/api/v1/cart", cartroute);

// auth routes

app.use("/api/v1/auth", auth_routes);

// user routes
app.use("/api/v1/user", user_routes);

// category routes
app.use("/api/v1/categories", category_routes);

// insurance routes
app.use("/api/v1/insurance", insurance_routes);

// product routes
app.use("/api/v1/product", product_routes);

// query routes
app.use("/api/v1/contact-us", query_routes);
// billing routes
app.use("/api/v1/billingroute", billingRoute);

app.use("/api/v1/blogs", blog_routes);

app.use("/api/v1/faqs", faqs_routes);

app.use("/api/v1/bank", bank_routes);

app.use("/api/v1/wallet",wallet_routes);

app.use("/api/v1/admin",  withdraw_routes);

app.use("api/v1", transactions_routes);


app.use('/api/v1/payment', paymet_routes);

export default app;
