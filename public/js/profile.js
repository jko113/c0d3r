function toggleHidden(dataLabel) {
  let elements = document.querySelectorAll(dataLabel);
  elements.forEach(function(element) {
    element.classList.toggle('is-hidden');
  });
}

function addEditButtonListener() {
  let button = document.querySelector('[data-edit-button]');
  if(button){
    button.addEventListener('click', function(event) {
      toggleHidden('[data-edit-button]');
      toggleHidden('[data-save-button]');
      toggleHidden('[data-cancel-button]');
      toggleHidden('[data-display]');
      toggleHidden('[data-delete-button]');
    });
  }
}

function addCancelListener() {
  let button = document.querySelector('[data-cancel-button]');
  if(button){
    button.addEventListener('click', function(event) {
      location.reload();
      // TODO Replace reload with ajax request?
    });
  }
}

function main() {
  addEditButtonListener();
  addCancelListener();
}

main();