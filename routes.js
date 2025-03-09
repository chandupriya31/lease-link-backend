import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_routes from "./routes/auth_routes.js";
import category_routes from "./routes/category.routes.js";
import user_routes from "./routes/user_routes.js";
import insurance_routes from "./routes/insurance.routes.js";
import product_routes from './routes/product_routes.js';
import query_routes from "./routes/query_routes.js"
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors({
  origin: process.env.NODE_ENV === "production" ? process.env.FRONTEND_URL : "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "accesstoken"]
}));

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

export default app;
