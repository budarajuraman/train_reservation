const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (HTML, CSS, JS) from the 'public' directory
app.use(express.static('public'));

// API route to get seat data
app.get('/api/seats', (req, res) => {
  fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      res.status(500).json({ error: 'Failed to load seat data' });
    } else {
      res.json(JSON.parse(data));
    }
  });
});

// API route to book seats
app.post('/api/bookSeats', (req, res) => {
  const seatNumbers = req.body.seatNumbers; // Array of seat numbers to be booked

  if (!seatNumbers || seatNumbers.length === 0) {
    return res.status(400).json({ error: 'No seat numbers provided' });
  }

  fs.readFile(path.join(__dirname, 'data.json'), 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading data.json:', err);
      return res.status(500).json({ error: 'Failed to load seat data' });
    }

    let seatsData = JSON.parse(data);

    // Update seat bookings
    seatNumbers.forEach(seatNumber => {
      const seatIndex = seatNumber - 1; // Adjust for 0-indexed array
      if (seatsData.seats[seatIndex].booked) {
        return res.status(400).json({ error: `Seat number ${seatNumber} is already booked` });
      }
      seatsData.seats[seatIndex].booked = true;
    });

    // Write updated seat data back to file
    fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(seatsData, null, 2), (err) => {
      if (err) {
        console.error('Error writing to data.json:', err);
        return res.status(500).json({ error: 'Failed to book seats' });
      }

      res.status(200).json({ message: 'Seats booked successfully' });
    });
  });
});

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
