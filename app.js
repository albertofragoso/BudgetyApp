////////////////////////////////////////////////////////////////////////////////
// BUDGET CONTROLLER
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {

    if(totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }

  };

  Expense.prototype.getPercentage = function() {

    return this.percentage;

  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(current) {
      sum += current.value;
    });

    data.totals[type] = sum;
  }

  return {
    addItem: function(type, desc, val) {
      var newItem, ID;

      // Create new ID.
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // Create new item based on 'inc' or 'exp' type.
      if(type === 'exp') {
        newItem = new Expense(ID, desc, val);
      } else if(type === 'inc') {
        newItem = new Income(ID, desc, val);
      }

      // Push it our data structure
      data.allItems[type].push(newItem);

      // Return the new element.
      return newItem;

    },

    deleteItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function() {

      // Calculate total income and expenses.
      calculateTotal('inc');
      calculateTotal('exp');

      // Calculate the budget: incomes - expenses.
      data.budget = data.totals.inc - data.totals.exp;

      // Calculate the percentage of income that we spent.
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.precentage = -1;
      }

    },

    calculatePercentages: function() {

      data.allItems.exp.forEach(function(current) {
        current.calcPercentage(data.totals.inc);
      })

    },

    getPercentages: function() {

      var allPercentages;

      allPercentages = data.allItems.exp.map(function(current) {
        return current.getPercentage();
      })

      return allPercentages;

    },

    getBudget: function() {

      return {
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
      }

    },

    testing: function() {

      console.log(data);

    },
  }


})();

////////////////////////////////////////////////////////////////////////////////
//UI CONTROLLER
var UIController = (function() {

  //Some code
  var DOMStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    budgetValue: '.budget__value',
    incomeValue: '.budget__income--value',
    expensesValue: '.budget__expenses--value',
    expensesPercentage: '.budget__expenses--percentage',
    container: '.container',
    itemPercentage: '.item__percentage',
    budgetDate :'.budget__title--month',
  }

  var formatNumbers = function(num, type) {

    var numSplit, int, dec, sign;
    /*
      + or - before number
      exactly two decimal points
      comma separating the thousands
    */
    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split('.');

    int = numSplit[0];

    if(int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    type === 'exp' ? sign = '-' : sign = '+';

    return sign + ' ' + int + '.' + dec;

  };

  var nodeListForEach = function(list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMStrings.inputType).value, // Will be either inc or exp
        description: document.querySelector(DOMStrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMStrings.inputValue).value),
      }
    },

    addItemList: function(obj, type) {

      var html, newHtml, element;

      // Create HTML string with placeholder text.
      if (type === 'inc') {

        element = document.querySelector('.income__list');

        html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if(type === 'exp') {

        element = document.querySelector('.expenses__list');

        html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // Replace the placeholder text with some actual data.
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', formatNumbers(obj.value, type));

      //Insert the HTML into the DOM.
      element.insertAdjacentHTML('afterbegin', newHtml);

    },

    deleteItemList: function(selectorID) {

      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);

    },

    clearFields: function() {

      var fields, fieldsArr;

      fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(function(current, index, array) {
        current.value = '';
      });

      fieldsArr[0].focus();

    },

    displayBudget: function(obj) {
      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMStrings.budgetValue).textContent = formatNumbers(obj.budget, type);
      document.querySelector(DOMStrings.incomeValue).textContent = formatNumbers(obj.totalInc, 'inc');
      document.querySelector(DOMStrings.expensesValue).textContent = formatNumbers(obj.totalExp, 'exp');
      if(obj.percentage > 0) {
        document.querySelector(DOMStrings.expensesPercentage).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMStrings.expensesPercentage).textContent = '---';
      }
    },

    displayPercentages: function(percentages) {

      // Something
      var fields = document.querySelectorAll(DOMStrings.itemPercentage);

      nodeListForEach(fields, function(current, index) {

        if (percentages[index] > 0) {
          current.textContent = percentages[index] + '%';
        } else {
          current.textContent = '---';
        }
      });

    },

    displayDate: function() {
      var now, year, months, month;

      now = new Date();

      months = ['January', 'Febraury', 'March', 'April', 'May', 'June', 'July', 'August', 'Septembre', 'October', 'November', 'December'];
      month = now.getMonth();

      year = now.getFullYear();

      document.querySelector(DOMStrings.budgetDate).textContent = months[month] + ' ' + year;

    },

    changedType: function() {
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue
      );

      nodeListForEach(fields, function(current, index){
        current.classList.toggle('red-focus');
      });

      document.querySelector(DOMStrings.inputBtn).classList.toggle('red');

    },

    getDOMStrings: function() {
      return DOMStrings;
    }
  };

})();

////////////////////////////////////////////////////////////////////////////////
//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){

  var setupEventListeners = function() {

    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function(event) {
      if (event.keyCode === 13) {
        ctrlAddItem();
      }
    });

    document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  }


  var updateBudget = function() {
    // 1. Calculate the budget.
    budgetCtrl.calculateBudget();

    // 2. Return budget.
    var budget = budgetCtrl.getBudget();

    // 3. Display the budget on the UI.
    UICtrl.displayBudget(budget);
  }

  var updatePercentages = function() {

      var percentages;
      // 1. Calculate percentages.
      budgetCtrl.calculatePercentages();

      // 2. Read percentages from the budget CONTROLLER.
      percentages = budgetCtrl.getPercentages();

      // 3. Update the UI wiht the new percentages.
      UICtrl.displayPercentages(percentages);

  }


  var ctrlAddItem = function() {

    var input, newItem;

    // 1. Get the filled input data.
    input = UICtrl.getInput();

    if( input.description !== '' && !isNaN(input.value) && input.value > 0) {
      // 2. Add the item to the budget CONTROLLER.
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      // 3. Add the item to the UI.
      UICtrl.addItemList(newItem, input.type);

      // 4. Clear input data.
      UICtrl.clearFields();

      // 5. Calculate and update budget.
      updateBudget();

      // 6. Calculate and update percentages.
      updatePercentages();

    }

  }

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if(itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // 1. Delete the item form the data structure.
      budgetCtrl.deleteItem(type, ID);

      // 2. Delete the item from the UI.
      UICtrl.deleteItemList(itemID);

      // 3. Update and show the new budget.
      updateBudget();

      // 4. Calculate and update percentages.
      updatePercentages();

    }
  }

  return {
    init: function() {
      console.log('App has started');
      UICtrl.displayDate();
      UICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        totalInc: 0,
        totalExp: 0,
      });
      setupEventListeners();
    }
  }

})(budgetController, UIController);

controller.init();
