import express from "express";
import cors from "cors";
import mysql from "mysql2";

const app = express();
const port = 3000;
app.use(cors()); // for allowing cross-origin requests from frontend to backend server.It is a middleware function.
app.use(express.json()); // for parsing application/json

// Import the router from a separate file (e.g., './userRoutes.js')
import simpleWtStarRoutes from './simpleWtStar.js';

// Mount the router on the '/users' path
// All routes defined in userRoutes.js will be relative to '/users'
app.use('/simplewtstar', simpleWtStarRoutes);

app.listen(port, () => {
  console.log(`Server listening on port : ${port}`);
});

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gss",
});
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "u668410136_user",
//   password: "spaceX25@",
//   database: "u668410136_gss"
// });


app.get("/", (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
  // console.log("Page:", page, "Limit:", limit, "Offset:", offset);
  // console.log("Get all guests endpoint hit");
  // const queery = "SELECT * FROM guest where status = 1 ORDER BY id DESC";
  // connection.query(queery, (err, result) => {
  //   if (err) return res.json({ Message: err });
  //   return res.json(result);
  // });
  const countQuery = "SELECT COUNT(*) AS count FROM guest WHERE status = 1";
  connection.query(countQuery, (countErr, countResult) => {
    if (countErr) return res.status(500).json({ Message: countErr });
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);
    const query = "SELECT * FROM guest WHERE status = 1 ORDER BY id DESC LIMIT ? OFFSET ?";
    connection.query(query, [limit, offset], (err, result) => {
      if (err) return res.status(500).json({ Message: err });
      return res.json({ data: result, totalRecords, totalPages });
    });
  });
});

app.get("/getGuest/:id", (req, res) => {
  const id = req.params.id;
  const query = "SELECT * FROM guest WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ Message: err });
    if (result.length === 0) return res.status(404).json({ Message: "Guest not found" });
    return res.json(result[0]);
  });
});

app.put("/update/:id", (req, res) => {
  // console.log("Update endpoint hit");
  // const id = req.params.id;
  // const { name, phone, email, startDate, endDate, roomNumber } = req.body;
  // const query = "UPDATE guest SET name = ?, phone = ?, email = ?, startDate = ?, endDate = ?, roomNumber = ? WHERE id = ?";
  // connection.query(query, [name, phone, email, startDate, endDate, roomNumber, id], (err, result) => {
  //   if (err) return res.status(500).json({ Message: err });
  //   if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
  //   return res.json({ Message: "Guest updated successfully" });
  // });
  const id = req.params.id;
  const { name, phone, email, startDate, endDate, roomNumber } = req.body;
  if (!name || !phone || !email || !startDate || !endDate || !roomNumber) {
    return res.status(400).json({ Message: "All fields are required" });
  }
  /*************  ✨ Windsurf Command ⭐  *************/
  connection.query("SELECT * FROM guest WHERE email = ? AND id != ? AND status = 1", [email, id], (err, emailResult) => {
    if (err) return res.status(500).json({ Message: err });
    if (emailResult.length > 0) return res.status(409).json({ Message: "Email already exists" });
    connection.query("SELECT * FROM guest WHERE phone = ? AND id != ? AND status = 1", [phone, id], (err, phoneResult) => {
      if (err) return res.status(500).json({ Message: err });
      if (phoneResult.length > 0) return res.status(409).json({ Message: "Phone already exists" });
    const query = "UPDATE guest SET name = ?, phone = ?, email = ?, startDate = ?, endDate = ?, roomNumber = ? WHERE id = ?";
    connection.query(query, [name, phone, email, startDate, endDate, roomNumber, id], (err, result) => {
      if (err) return res.status(500).json({ Message: err });
      if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
      return res.json({ Message: "Guest updated successfully" });
    });
  });
  });
});

app.put("/delete/:id", (req, res) => {
  const id = req.params.id;
    connection.query("UPDATE guest SET status = 9 WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json({ Message: err });
      if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
      return res.json({ Message: "Guest deleted successfully" });
    });
});
app.post("/add", (req, res) => {
  const { name, phone, email, startDate, endDate, roomNumber } = req.body;

  if (!name || !phone || !email || !startDate || !endDate || !roomNumber) {
    return res.status(400).json({ Message: "All fields are required" });
  }
  
/*************  ✨ Windsurf Command ⭐  *************/
  connection.query("SELECT * FROM guest WHERE email = ? AND status = 1", [email], (err, emailResult) => {
    if (err) return res.status(500).json({ Message: err });
    if (emailResult.length > 0) return res.status(409).json({ Message: "Email already exists" });

    connection.query("SELECT * FROM guest WHERE phone = ? AND status = 1", [phone], (err, phoneResult) => {
      if (err) return res.status(500).json({ Message: err });
      if (phoneResult.length > 0) return res.status(409).json({ Message: "Phone already exists" });

      const query = "INSERT INTO guest (name, phone, email, startDate, endDate, roomNumber) VALUES (?,?,?,?,?,?)";
      connection.query(query, [name, phone, email, startDate, endDate, roomNumber], (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        return res.json({ Message: "Guest added successfully" });
      });
    });
  });
/*******  11dd0357-6023-4046-ae1a-c3f2f6667c52  *******/  
});