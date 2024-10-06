// Initialize coach layout from server data
let coach = Array(12).fill(null).map((_, row) => {
  return row === 11 ? Array(3).fill(false) : Array(7).fill(false); // Last row has only 3 seats
});

// Fetch initial seat data from the server
async function fetchSeats() {
  try {
    const response = await fetch('http://localhost:3000/api/seats', {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    data.seats.forEach((seat, index) => {
      const row = Math.floor(index / 7);
      const col = index % 7;
      if (row === 11) {
        coach[row][col] = seat.booked; // Handle last row correctly
      } else {
        coach[row][col] = seat.booked; // Handle other rows
      }
    });

    renderCoach(); // Render the coach after fetching seats
  } catch (error) {
    console.error('Fetch error:', error);
    alert('Failed to load seats. Please try again later.');
  }
}

// Render the coach layout
function renderCoach() {
  const coachContainer = document.getElementById('coachContainer');
  coachContainer.innerHTML = ''; // Clear previous rendering

  let seatNumber = 1;
  for (let row = 0; row < coach.length; row++) {
    for (let col = 0; col < coach[row].length; col++) {
      const seat = document.createElement('div');
      seat.classList.add('seat');
      if (coach[row][col] === true) {
        seat.classList.add('booked');
        seat.textContent = 'X'; // Show 'X' for booked seats
      } else {
        seat.textContent = seatNumber; // Show seat number for unbooked seats
      }
      coachContainer.appendChild(seat);
      seatNumber++;
    }
  }
}

// Get seat number function (handling the last row with fewer seats)
function getSeatNumber(row, col) {
  return row === 11 ? 78 + col : row * 7 + col + 1; // Adjust for last row with only 3 seats
}

// Book seats function
async function bookSeats() {
  const seatCountInput = document.getElementById('seatCount').value;
  const seatCount = Number(seatCountInput);

  if (isNaN(seatCount) || seatCount < 1 || seatCount > 7) {
    alert('Invalid number of seats. You can book between 1 and 7 seats.');
    return;
  }

  const availableSeats = findAvailableSeats(seatCount);
  if (availableSeats.length === 0) {
    alert('Unable to book the requested number of seats. Please try again.');
    return;
  }

  const seatNumbers = availableSeats.map(([row, col]) => getSeatNumber(row, col));

  try {
    const response = await fetch('http://localhost:3000/api/bookSeats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ seatNumbers }),
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      alert(`Failed to book seats: ${errorMessage || 'Please try again.'}`);
      return;
    }

    availableSeats.forEach(([row, col]) => {
      coach[row][col] = true;
    });
    renderCoach();
    alert(`Seats booked successfully: ${seatNumbers.join(', ')}`);
  } catch (error) {
    alert('Failed to book seats. Please try again later.');
  }
}

// Find available seats function
function findAvailableSeats(seatCount) {
  let availableSeats = [];

  for (let row = 0; row < coach.length; row++) {
    let rowSeats = coach[row];
    let rowAvailableSeats = [];

    for (let col = 0; col < rowSeats.length; col++) {
      if (rowSeats[col] === false) {
        rowAvailableSeats.push([row, col]);
        if (rowAvailableSeats.length === seatCount) {
          return rowAvailableSeats;
        }
      }
    }

    if (rowAvailableSeats.length >= seatCount) {
      return rowAvailableSeats.slice(0, seatCount);
    }

    availableSeats = availableSeats.concat(rowAvailableSeats);
  }

  return availableSeats.slice(0, seatCount);
}

// Initial fetch of seat data
window.onload = function() {
  fetchSeats();
};
