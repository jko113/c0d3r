


function hideAllCards(){
    let profileCards = document.body.querySelectorAll('.profile-container');
    let cardsArr = Array.from(profileCards);
    if(cardsArr.length < 5 || !cardsArr){
        let load = document.body.querySelector('.load');
        load.classList.add('hide');
    };
    let cutCardsArr = cardsArr.slice(5, cardsArr.length);
    for (i=0; i<cutCardsArr.length; i++){
        cutCardsArr[i].classList.add('hide');
    };
};
function scrollPage(){
    $(window).scroll(function() {
        setTimeout(scrollTimeout, 800);
    });
};

function scrollTimeout() {
    let hiddenCards = document.querySelectorAll('.hide');
    let hiddenArr = Array.from(hiddenCards);
    if($(window).scrollTop() + $(window).height() == $(document).height()) {
        for (i=0; i<5; i++){
            if (hiddenArr[0]){
                hiddenArr[0].classList.remove('hide');
                hiddenArr = hiddenArr.slice(1, hiddenArr.length);
            } else {
                let refreshButton = document.querySelector('.refresh');
                refreshButton.classList.remove('hide');
            };
        };
    };
};


hideAllCards();
// scrollPage();
setTimeout(scrollPage, 500);