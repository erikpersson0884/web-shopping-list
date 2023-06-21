const express = require('express');
const fs = require('fs');
const app = express();

const PORT = 3000;
const SHOPPING_LIST_FILE = 'shoppingList.json';

let shoppingList = [];

// Middleware to parse JSON request bodies
app.use(express.json());

// Function to save the shopping list to the file
function saveShoppingList() {
  fs.writeFile(SHOPPING_LIST_FILE, JSON.stringify(shoppingList), err => {
    if (err) {
      console.error('Error saving shopping list:', err);
    }
  });
}

// Load the shopping list from the file on server startup
fs.readFile(SHOPPING_LIST_FILE, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading shopping list file:', err);
  } else {
    shoppingList = JSON.parse(data);
    console.log('Shopping list loaded from file.');
  }
});

// REST API endpoint to get the current shopping list
app.get('/api/shopping-list', (req, res) => {
  res.json(shoppingList);
});

// REST API endpoint to add an item to the shopping list
app.post('/api/shopping-list', (req, res) => {
  const { name } = req.body;
  const existingItem = shoppingList.find(item => item.name.toLowerCase() === name.toLowerCase());

  if (existingItem) {
    existingItem.amount++;
  } else {
    shoppingList.push({ name, amount: 1 });
  }

  saveShoppingList();

  res.json(shoppingList); // Return the updated shopping list as the response
});

// REST API endpoint to update the amount of an item in the shopping list
app.put('/api/shopping-list/:name', (req, res) => {
  const { name } = req.params;
  const { amount } = req.body;
  const item = shoppingList.find(item => item.name.toLowerCase() === name.toLowerCase());

  if (item) {
    item.amount = amount;
    saveShoppingList();
    res.json(shoppingList); // Return the updated shopping list as the response
  } else {
    res.status(404).end();
  }
});

// REST API endpoint to delete an item from the shopping list
app.delete('/api/shopping-list/:name', (req, res) => {
  const { name } = req.params;
  const index = shoppingList.findIndex(item => item.name.toLowerCase() === name.toLowerCase());

  if (index !== -1) {
    shoppingList.splice(index, 1);
    saveShoppingList();
    res.json(shoppingList); // Return the updated shopping list as the response
  } else {
    res.status(404).end();
  }
});

// Serve the static files for the client-side app
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

