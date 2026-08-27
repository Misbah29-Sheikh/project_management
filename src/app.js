import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// cors configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
  credentials:true, 
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}))

// basic configurations
app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended: true, limit : "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// import the routes
import healthCheckRouter from "./routes/healthcheck.routes.js"
import authRouter from "./routes/auth.routes.js"
import projectRouter from "./routes/project.routes.js"
import taskRouter from "./routes/task.routes.js"
import noteRouter from "./routes/note.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js"

app.use("/api/v1/healthcheck", healthCheckRouter);
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/projects", projectRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/api/v1/notes", noteRouter)
app.use("/api/v1/dashboard", dashboardRouter);

app.use(errorHandler);

app.get("/",(req,res) => {
  res.send("Welcome to backend")
})

export default app;