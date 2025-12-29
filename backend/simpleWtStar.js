import { Router } from 'express';
import mysql from 'mysql2';
const router = Router();

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

// Define a GET route relative to the mount path (e.g., the final path is /users/)
// router.get('/', (req, res) => {
//   console.log("Handler for /simplewtstar route from separate file.");
//   res.send('Handler for /simplewtstar route from separate file.');
// });

// Define another route (e.g., final path is /users/:id)
// router.get('/:id', (req, res) => {
//   const userId = req.params.id; // Access request parameters
//   res.send(`User ID: ${userId} from separate file.`);
// });
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;
    const countQuery = "SELECT COUNT(*) AS count FROM simplewtstar WHERE status = 1";
    connection.query(countQuery, (countErr, countResult) => {
        if (countErr) return res.status(500).json({ Message: countErr });
        const totalRecords = countResult[0].count;
        const totalPages = Math.ceil(totalRecords / limit);
        // const query = "SELECT * FROM simplewtstar WHERE status = 1 ORDER BY id DESC LIMIT ? OFFSET ?";
        const query = "SELECT sws.*, g.name AS name, g.email AS guest_email, g.phone AS guest_phone FROM simplewtstar sws JOIN guest g ON sws.guest_id = g.id WHERE sws.status = 1 ORDER BY sws.id DESC LIMIT ? OFFSET ?";
        connection.query(query, [limit, offset], (err, result) => {
            if (err) return res.status(500).json({ Message: err });
            return res.json({ data: result, totalRecords, totalPages });
        });
    });
});

router.post('/add', (req, res) => {
    const { rating, comment, guestid } = req.body;
    // Check if rating and comment are provided
    if (!rating || !comment || !guestid) {
        return res.status(400).json({ Message: "Rating, comment, are required" });
    }
    const query = "INSERT INTO simplewtstar (rating, comment, guest_id) VALUES (?, ?, ?)";
    connection.query(query, [rating, comment, guestid], (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        return res.json({ Message: "Feedback added successfully" });
    });
});
router.put('/reply/:id', (req, res) => {
    const feedbackId = req.params.id;
    const { replytext } = req.body;
    const query = "UPDATE simplewtstar SET reply = ? WHERE id = ?";
    connection.query(query, [replytext, feedbackId], (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Feedback updated successfully" });
    });

});
router.put('/state/:id', (req, res) => {
    const feedbackId = req.params.id;
    const { state } = req.body;
    const query = "UPDATE simplewtstar SET state = ? WHERE id = ?";
    connection.query(query, [state, feedbackId], (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Feedback updated successfully" });
    });

});

router.delete('/delete/:id', (req, res) => {
    const feedbackId = req.params.id;
    const query = "UPDATE simplewtstar SET status = 9 WHERE id = ?";
    connection.query(query, [feedbackId], (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        if (result.affectedRows === 0) return res.status(404).json({ Message: "Feedback not found" });
        return res.json({ Message: "Feedback deleted successfully" });
    });
});

// Export the router for use in the main app file
export default router;