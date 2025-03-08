import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_routes from "./routes/auth_routes.js";
import category_routes from "./routes/category.routes.js";
import user_routes from "./routes/user_routes.js";

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

// API routes
app.use("/api/v1/auth", auth_routes);
app.use("/api/v1/categories", category_routes);
app.use("/api/v1/user", user_routes);

export default app;
