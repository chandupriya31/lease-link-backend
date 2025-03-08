import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_routes from "./routes/auth_routes.js";
import category_routes from "./routes/category.routes.js";
import product_routes from './routes/product_routes.js';
import query_routes from "./routes/query_routes.js"
const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors());

app.use("/api/v1/auth", auth_routes);

app.use("/api/v1/category", category_routes);

app.use("/api/v1/product", product_routes);

app.use("/api/v1/contact-us", query_routes);

export default app;
