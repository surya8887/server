import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // corrected typo in import name
import errorMiddleware from "./middlewares/error.middleware.js";
const app = express();

// Middleware
app.use(cors({
  origin :'*',
  credentials : true,
  methods : ['GET', 'POST', 'PUT', 'DELETE' ],
}));
app.use(express.json({ limit: "10mb" })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 



app.get("/", (req, res) => {
  res.send("🚀 Hello from the backend!");
});

// TODO: Import routes
// import userRoutes from './routes/user.routes.js';
// app.use('/api/users', userRoutes);

// TODO: Define more API endpoints here


app.use(errorMiddleware)
export default app;
