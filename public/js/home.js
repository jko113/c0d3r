


function hideAllCards(){
    let profileCards = document.body.querySelectorAll('.profile-container');
    let cardsArr = Array.from(profileCards);
    if(cardsArr.length < 5 || !cardsArr){
        let load = document.body.querySelector('.load');
        load.classList.add('hide');
    }
    let cutCardsArr = cardsArr.slice(5, cardsArr.length);
    //console.log(cutCardsArr);
    for (i=0; i<cutCardsArr.length; i++){
        cutCardsArr[i].classList.add('hide');
    }
}
function scrollPage(){
    let hiddenCards = document.querySelectorAll('.hide');
    let hiddenArr = Array.from(hiddenCards);
    $(window).scroll(setTimeout(function() {
        if($(window).scrollTop() + $(window).height() == $(document).height()) {
            for (i=0; i<5; i++){
                if (hiddenArr[0]){
                    hiddenArr[0].classList.remove('hide');
                    hiddenArr = hiddenArr.slice(1, hiddenArr.length)
                }
            }
        }
    }, 400));
}

hideAllCards();
// scrollPage();
setTimeout(scrollPage, 500);