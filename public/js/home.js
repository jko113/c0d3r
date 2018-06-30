


function addLoadToggle(){
    let load = document.body.querySelector('.add-profiles');
    if(load){
        load.addEventListener('click', function(event) {
            // console.log('button licked');
            app.get('/home', (req, res) => {
                console.log(req.body)
            })
        });
    } else {
        console.log('no button selected')
    };
};


function get(url) {
    return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = () => req.status === 200 ? resolve(req.response) : reject(Error(req.statusText));
      req.onerror = (e) => reject(Error(`Network Error: ${e}`));
      req.send();
    });
};

addLoadToggle();