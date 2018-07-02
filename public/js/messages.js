function toggleHidden(dataLabel) {
  let elements = document.querySelectorAll(dataLabel);
  elements.forEach(function(element) {
    element.classList.toggle('is-hidden');
  });
}

function toggleInverted(dataLabel) {
  let elements = document.querySelectorAll(dataLabel);
  elements.forEach(function(element) {
    element.classList.toggle('is-outlined');
  });
}

function addButtonListener() {
    let buttons = document.querySelectorAll('[data-box-button]');
    if (buttons) {
        buttons.forEach(function (button) {
          button.addEventListener('click', function (event) {
              //event.preventDefault();
              toggleHidden('[data-display]');
              toggleInverted('[data-box-button]');
          });
        });
    }
}

function main() {
  addButtonListener();
}

main();