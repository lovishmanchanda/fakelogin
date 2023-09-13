const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const app = express();
const port = 3000; // You can change this port if necessary

const db = new sqlite3.Database('userdata.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      passwordHash TEXT
    )`);
  }
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Create a 'public' folder for static files (HTML, CSS, etc.)

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Route to handle form submission
app.post('/submit', async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  // Check if inputs are not empty
  if (!name || !password) {
    res.status(400).send('Please fill in all fields.');
    return;
  }

  try {
    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10);

    // Hash the password with the generated salt
    const passwordHash = await bcrypt.hash(password, salt);

    // Save the data to the database
    db.run('INSERT INTO users (name, passwordHash) VALUES (?, ?)', [name, passwordHash], function (err) {
      if (err) {
        console.error('Error inserting data into the database:', err.message);
        res.status(500).send('An error occurred while submitting the form. Please try again.');
      } else {
        console.log('Data inserted successfully!');
        res.sendStatus(200);
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error.message);
    res.status(500).send('An error occurred while submitting the form. Please try again.');
  }
});

// Log server errors
app.on('error', (err) => {
  console.error('Server error:', err.message);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason.message || reason);
});

// Start the server and listen on all network interfaces (0.0.0.0) on the specified port
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${port}`);
});

