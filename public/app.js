const inputPrompt = document.getElementById('inputPrompt');
const shoppingList = document.getElementById('shoppingList');

let items = [];

function renderShoppingList() {
  shoppingList.innerHTML = '';

  items.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';

    const checkBoxElement = document.createElement('img');
    checkBoxElement.className = 'checkmark';
    if (item.isBought == false) {
      checkBoxElement.src = '/img/checked.svg';
    } else {
      checkBoxElement.src = '/img/unchecked.svg';
    };


    const nameElement = document.createElement('p');
    nameElement.textContent = item.name;

    const amountElement = document.createElement('p');
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
    const newItem = { name, amount: 1, isBought: false};
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

inputPrompt.addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    const productName = inputPrompt.value.trim();

    if (productName) {
      addItem(productName);
      inputPrompt.value = '';
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
