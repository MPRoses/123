$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
 });

 
 document.getElementById("register").onclick = function () {
    location.href = "./register";
  };

  var burgerMenu = document.getElementById('burger-menu');
    var overlay = document.getElementById('menu');
    burgerMenu.addEventListener('click',function(){
      this.classList.toggle("close");
      overlay.classList.toggle("overlay");
    });

    if (document.getElementById("countDown").innerHTML.length > 20) {
                       
        let timeOut = 5;
    var counter = setInterval(function(){
            document.getElementById("countDown").innerHTML = 'Te veel foute inlpogpogingen! Kom terug over ' + timeOut + ' seconden.';
            timeOut--;
            console.log(timeOut);
              if (timeOut == 0) {
                clearInterval(counter);
    }
        }, 1000);      

   }