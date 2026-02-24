// const express = require("express");
// const mongoose = require("mongoose");
// const path = require("path");
// const cors = require("cors");
// const cookieParser = require("cookie-parser");
// const otpRouter = require("./router/otp");
// const loginRouter = require("./router/login"); // adjusted path
// const incomeRouter = require("./router/income");
// const expenseRouter = require("./router/expense");
// const budgetRouter = require("./router/budget");

// // MongoDB connection
// mongoose
//   .connect(
//     "mongodb+srv://trydb:trydb12@meetreact.if4yxp2.mongodb.net/MoneyMap?retryWrites=true&w=majority&appName=meetreact"
//   )
//   .then(() => console.log("MongoDB Connected!!"))
//   .catch((err) => console.error("MongoDB Connection Error:", err));

// const app = express();

// // Middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cors());
// app.use(cookieParser());

// // View engine
// app.set("view engine", "ejs");
// app.set("views", path.resolve("./views"));

// // Routes
// app.use("/otp", otpRouter);
// app.use("/login", loginRouter);
// app.use("/income", incomeRouter);
// app.use("/expense", expenseRouter);
// app.use("/budget", budgetRouter);
// app.use("/uploads/profilePics", express.static("uploads/profilePics"));

// // Example of a protected route
// // app.get("/dashboard", checkAuthCookie("authToken"), (req, res) => {
// //   return res.render("dashboard", { user: req.user });
// // });

// // Start server
// app.listen(8000, () => console.log("Server Started on port 8000!!"));




// index.js (replace your current file with this)
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// routers
const otpRouter = require("./router/otp");
const loginRouter = require("./router/login");
const incomeRouter = require("./router/income");
const expenseRouter = require("./router/expense");
const budgetRouter = require("./router/budget");
const monthlyRouter = require("./router/monthly");
const paymentRouter = require("./router/payment");
const adminRouter = require("./router/admin");
const savingRouter = require("./router/saving");

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

// View engine
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Routes
app.use("/otp", otpRouter);
app.use("/login", loginRouter);
app.use("/income", incomeRouter);
app.use("/expense", expenseRouter);
app.use("/budget", budgetRouter);
app.use("/uploads/profilePics", express.static("uploads/profilePics"));
app.use("/monthly", monthlyRouter);
app.use("/payment", paymentRouter);
app.use("/admin", adminRouter);
app.use("/saving", savingRouter);

// Admin route placeholder — real handler will be set after cron module is loaded (after DB connect)
let runDailyExpenseSMS = null; // will be replaced once cron module is required

app.get("/", (req, res) => {
  res.send("MoneyMap Backend is running 🚀");
});



app.post("/admin/run-daily-sms", async (req, res) => {
  const secretHeader = req.headers["x-admin-secret"];
  const expected = process.env.expected;

  if (!expected || secretHeader !== expected) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  if (typeof runDailyExpenseSMS !== "function") {
    return res.status(500).json({ ok: false, message: "Job not available yet (server still starting?)" });
  }

  try {
    await runDailyExpenseSMS({ throttleMs: 400 });
    return res.json({ ok: true, message: "Daily SMS job executed" });
  } catch (err) {
    console.error("Admin triggered job error:", err);
    return res.status(500).json({ ok: false, error: err.message || String(err) });
  }
});

// MongoDB connection
mongoose
  .connect(
    // "mongodb+srv://trydb:trydb12@meetreact.if4yxp2.mongodb.net/MoneyMap?retryWrites=true&w=majority&appName=meetreact"
    process.env.MONGODB_URI
  )
  .then(() => {
    console.log("MongoDB Connected!!");

    // require the cron module AFTER DB connected so it can access mongoose
    try {
      // cron module should export runDailyExpenseSMS
      const cronModule = require("./cron/dailyExpenseSms");
      if (cronModule && typeof cronModule.runDailyExpenseSMS === "function") {
        runDailyExpenseSMS = cronModule.runDailyExpenseSMS;
        console.log("Loaded cron/dailyExpenseSms (runDailyExpenseSMS available).");
      } else {
        // If cron only registers itself, we try to still load it to ensure schedule registered
        console.log("cron/dailyExpenseSms loaded (no exported runDailyExpenseSMS function detected).");
      }
    } catch (e) {
      console.warn("Could not load cron/dailyExpenseSms:", e && e.message ? e.message : e);
    }

    // Start server ONLY after DB is connected
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(`🚀 Server Started on port ${PORT}!!`));
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.error("Please check your MONGODB_URI in the .env file. Ensure your IP is whitelisted and credentials are correct.");
    process.exit(1); // Exit if DB connection fails
  });
