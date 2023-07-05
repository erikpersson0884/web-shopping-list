const inputPrompt = document.getElementById('inputPrompt');
const shoppingList = document.getElementById('shoppingList');

let items = [];

function renderShoppingList() {
  shoppingList.innerHTML = '';

  // Sort items based on the 'isBought' property
  items.sort((a, b) => (a.isBought ? 1 : -1));

  items.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';


    const checkBoxButton = document.createElement('button');
    checkBoxButton.classList.add('buttonWithLogo');
    checkBoxButton.classList.add('checkmark');
    const checkBoxImage = document.createElement('img');
    checkBoxButton.appendChild(checkBoxImage);
    if (item.isBought) {
      checkBoxImage.src = '/img/checked.svg';
      itemElement.classList.add('checked'); // Add the 'checked' class
    } else {
      checkBoxImage.src = '/img/unchecked.svg';
    }
    checkBoxButton.addEventListener('click', () => {
      item.isBought = !item.isBought;
      updateItem(item);
    });

    const nameElement = document.createElement('p');
    nameElement.textContent = item.name;

    const amountElement = document.createElement('p');
    amountElement.textContent = item.amount;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'buttonGroup'

    const increaseButton = document.createElement('button');
    increaseButton.classList.add('buttonWithLogo');
    const increaseImage = document.createElement('img');
    increaseImage.src = '/img/increase.svg';
    increaseButton.appendChild(increaseImage);

    increaseButton.addEventListener('click', () => {
      item.amount++;
      updateItem(item);
    });

    const decreaseButton = document.createElement('button');
    decreaseButton.classList.add('buttonWithLogo');
    const decreaseImage = document.createElement('img');
    decreaseImage.src = '/img/decrease.svg';
    decreaseButton.appendChild(decreaseImage);
    
    decreaseButton.addEventListener('click', () => {
      if (item.amount > 1) {
        item.amount--;
        updateItem(item);
      } else {
        deleteItem(item);
      }
    });

    const removeButton = document.createElement('button');
    removeButton.classList.add('buttonWithLogo');
    const deleteImage = document.createElement('img');
    deleteImage.src = '/img/trashcan.svg'
    removeButton.appendChild(deleteImage);
    removeButton.addEventListener('click', () => {
      deleteItem(item);
    });

    buttonGroup.appendChild(increaseButton)
    buttonGroup.appendChild(decreaseButton)
    buttonGroup.appendChild(removeButton)


    itemElement.appendChild(checkBoxButton);
    itemElement.appendChild(nameElement);
    itemElement.appendChild(amountElement);
    itemElement.appendChild(buttonGroup);

    shoppingList.appendChild(itemElement);
  });
}

function addItem(name) {
  const existingItem = items.find(item => item.name.toLowerCase() === name.toLowerCase());

  if (existingItem) {
    existingItem.amount++;
    updateItem(existingItem);
  } else {
    const newItem = { name, amount: 1, isBought: false };
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

function removeBoughtItems() {
  for (let item of items){
    if (item.isBought){
      deleteItem(item);
    }
  }
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
