const { list } = require('./data/names');
const HebrewDate = require('./utils/G2H');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, Together Backend!');
});

app.get('/check-date', (req, res) => {
  // Replace this with your actual logic to check the condition
  const isConditionMet = checkCondition(); // Implement this function

  if (isConditionMet) {
    res.json({ message: 'Condition is met. Perform your action.' });
  } else {
    res.json({ message: 'Condition is not met.' });
  }
});

// Function to check the condition (replace this with your actual logic)
function checkCondition() {
  list.map((person) => {
    const thisYear = new Date().getFullYear();
    const thisMonth = new Date().getMonth() + 1;
    const thisDate = new Date().getDate();
    let thisHebrew = HebrewDate(thisYear, thisMonth, thisDate);

    if (person.hebrewDate.month_name == thisHebrew.month_name) {
      if (person.hebrewDate.date == thisHebrew.date) {
        console.log(person);
      }
    }
  });
}
// checkCondition();
const today = HebrewDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
if (today.day_name === 'ראשון') {
}
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
