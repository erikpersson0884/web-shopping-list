const productInput = document.getElementById('productInput');
const shoppingList = document.getElementById('shoppingList');

let items = [];

function renderShoppingList() {
  shoppingList.innerHTML = '';

  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';

    const nameElement = document.createElement('span');
    nameElement.textContent = item.name;

    const amountElement = document.createElement('span');
    amountElement.textContent = item.amount;

    const increaseButton = document.createElement('button');
    increaseButton.textContent = '+';
    increaseButton.addEventListener('click', () => {
      item.amount++;
      updateItem(item);
    });

    const decreaseButton = document.createElement('button');
    decreaseButton.textContent = '-';
    decreaseButton.addEventListener('click', () => {
      if (item.amount > 1) {
        item.amount--;
        updateItem(item);
      } else {
        deleteItem(item);
      }
    });

    itemElement.appendChild(nameElement);
    itemElement.appendChild(amountElement);
    itemElement.appendChild(increaseButton);
    itemElement.appendChild(decreaseButton);

    shoppingList.appendChild(itemElement);
  });
}

function addItem(name) {
  const existingItem = items.find(item => item.name.toLowerCase() === name.toLowerCase());

  if (existingItem) {
    existingItem.amount++;
    updateItem(existingItem);
  } else {
    const newItem = { name, amount: 1 };
    fetch('/api/shopping-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newItem)
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to add item to shopping list.');
        }
      })
      .then(updatedList => {
        items = updatedList;
        renderShoppingList();
      })
      .catch(error => {
        console.error(error);
      });
  }
}

function updateItem(item) {
  fetch(`/api/shopping-list/${encodeURIComponent(item.name)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(item)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to update item in shopping list.');
      }
    })
    .then(updatedList => {
      items = updatedList;
      renderShoppingList();
    })
    .catch(error => {
      console.error(error);
    });
}

function deleteItem(item) {
  fetch(`/api/shopping-list/${encodeURIComponent(item.name)}`, {
    method: 'DELETE'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to delete item from shopping list.');
      }
    })
    .then(updatedList => {
      items = updatedList;
      renderShoppingList();
    })
    .catch(error => {
      console.error(error);
    });
}

productInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const productName = productInput.value.trim();

    if (productName) {
      addItem(productName);
      productInput.value = '';
    }
  }
});

fetch('/api/shopping-list')
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to fetch shopping list.');
    }
  })
  .then(data => {
    items = data;
    renderShoppingList();
  })
  .catch(error => {
    console.error(error);
  });
