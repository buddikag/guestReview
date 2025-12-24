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


app.get("/", (req, res) => {
  const queery = "SELECT * FROM guest where status = 1";
  connection.query(queery, (err, result) => {
    if (err) return res.json({ Message: err });
    return res.json(result);
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
  console.log("Update endpoint hit");
  const id = req.params.id;
  const { name, phone, email, startDate, endDate, roomNumber } = req.body;
  const query = "UPDATE guest SET name = ?, phone = ?, email = ?, startDate = ?, endDate = ?, roomNumber = ? WHERE id = ?";
  connection.query(query, [name, phone, email, startDate, endDate, roomNumber, id], (err, result) => {
    if (err) return res.status(500).json({ Message: err });
    if (result.affectedRows === 0) return res.status(404).json({ Message: "Guest not found" });
    return res.json({ Message: "Guest updated successfully" });
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
  
  const Checkquery = "SELECT * FROM guest WHERE name = ? AND phone = ? AND email = ? AND startDate = ? AND endDate = ? AND roomNumber = ?";
  connection.query(Checkquery, [name, phone, email, startDate, endDate, roomNumber], (err, result) => {
    if (err) return res.status(500).json({ Message: err });
    if (result.length > 0) return res.status(409).json({ Message: "Guest already exists" });
  });

  const query = "INSERT INTO guest (name, phone, email, startDate, endDate, roomNumber) VALUES (?,?,?,?,?,?)";
  connection.query(query, [name, phone, email, startDate, endDate, roomNumber], (err, result) => {
    if (err) return res.status(500).json({ Message: err });
    return res.json({ Message: "Guest added successfully" });
  });
});