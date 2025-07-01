import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 
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
app.use(express.static('public'))



app.get("/", (req, res) => {
  res.send("🚀 Hello from the backend!");
});

// TODO: Import routes
import userRoutes from "./routes/user.route.js";
import messageRoutes from "./routes/message.route.js";
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/messages', messageRoutes);

// TODO: Define more API endpoints here


// Last middleware in the stack
app.use(errorMiddleware);

// Optional final handler (sends the formatted error)
app.use((err, req, res, next) => {
  const { statusCode = 500, formattedError } = err;

  res.status(statusCode).json(formattedError || {
    success: false,
    message: "Unhandled error",
  });
});

export default app;
