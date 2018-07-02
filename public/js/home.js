


function addLoadToggle(){
    let load = document.body.querySelector('.load');
    if(load){
        let hiddenCards = document.querySelectorAll('.hide');
        let hiddenArr = Array.from(hiddenCards);
        console.log(hiddenArr);
        load.addEventListener('click', function(event) {
            let count = 0;
            for (i=0; i<5; i++){
                if (hiddenArr[0]){
                    hiddenArr[0].classList.remove('hide');
                    hiddenArr = hiddenArr.slice(1, hiddenArr.length)
                } else {
                    load.classList.add('hide');
                }
            }
        })
    }
};
function hideAllCards(){
    let profileCards = document.body.querySelectorAll('.profile-container');
    let cardsArr = Array.from(profileCards);
    let cutCardsArr = cardsArr.slice(5, cardsArr.length);
    console.log(cutCardsArr);
    for (i=0; i<cutCardsArr.length; i++){
        cutCardsArr[i].classList.add('hide');
    }
}


hideAllCards();
addLoadToggle();