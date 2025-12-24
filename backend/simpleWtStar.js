import { Router } from 'express';
import mysql from 'mysql2';
const router = Router();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "gss",
});

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
    const query = "SELECT swt.rating, swt.comment, g.name FROM simplewtstar swt INNER JOIN guest g ON swt.guest_id = g.id";
    connection.query(query, (err, result) => {
        if (err) return res.status(500).json({ Message: err });
        return res.json(result);
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



// Export the router for use in the main app file
export default router;