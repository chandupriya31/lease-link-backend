import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import auth_routes from './routes/auth_routes.js'

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors());

app.use('/api/v1/auth', auth_routes)

export default app;
