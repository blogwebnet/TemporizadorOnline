/*
break time:
  #breakMinus -
  #breakMin
  #breakPlus +

session time:
  #sessionMinus -
  #sessionMin
  #sessionPlus +

timer:
  #time

button for reset: 
  #resetButton
*/
//--------------------------------------------------------------------------------------------------
/*TODO: delete unused html classes and ids,
        
        maybe change the doorbell sound to something else,

        IDEA: if we click on sessionMin while timerCurrent == 'break' reset time timer and putthe number of sessionMin to #time
        
Used this site to learn how to proper do a countdown:
https://www.sitepoint.com/build-javascript-countdown-timer-no-dependencies/
*/

//flags
// for timer pause
let timerPause = true;
//for checking if countdown is break or session
let timerCurrent = 'session';
//mute
let isMute = false;

//the set interval function used for clearInterval
let timeinterval;

//Audio
//Gong
var gong = new Audio('https://calendariodeferiados.com/wp-content/themes/calendario-feriados/sons/Militar_1.mp3');
//doorbell
var doorbell = new Audio('https://calendariodeferiados.com/wp-content/themes/calendario-feriados/despertador/wake-up-sound.mp3');

//----------------COUNTDOWN TIMER----------------------

//set endtime from #time element in html
function setEndtime(){
  let setTime = document.querySelector('#time')
  let currentTime = Date.parse(new Date());
  //get minutes only to the : character
  let minutes = /(.*)?(\:)/.exec(setTime.textContent)[1]
  //last 2 digits are the seconds
  let seconds = (setTime.textContent).slice(-2)
  let endtime;
  //console.log(minutes);
  //console.log(seconds);
  
  if (seconds == '00') {
    endtime = new Date(currentTime + minutes*60*1000);
  } else {
    endtime = new Date(currentTime + (minutes*60*1000)+seconds*1000);
  }

  return endtime
  }

//endtime(deadline) using #breakMin and #sessionMin
function setEndBreakSessionTime(target){
  let setTime = document.querySelector(target)
  //console.log(setTime.textContent)
  let currentTime = Date.parse(new Date());
  let minutes = setTime.textContent
  let endtime = new Date(currentTime + minutes*60*1000);
  return endtime;
}

//countdown
function getTimeRemaining(endtime){
  let t = Date.parse(endtime) - Date.parse(new Date());
  let seconds = Math.floor( (t/1000) % 60 );
  let minutes = Math.floor( (t/1000/60) % 60 );
  let hours = Math.floor( (t/(1000*60*60)) % 24 );
  let days = Math.floor( t/(1000*60*60*24) );
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

//initialize clock
//here it's displaying on the html
function initializeClock(id, endtime){
  timerPause = false;
  let clock = document.querySelector(id);
  function updateClock(){
  let t = getTimeRemaining(endtime);
  let seconds = (t.seconds).toString();
  let minutes = (t.minutes).toString();
  if (t.hours > 0) {
    clock.textContent = t.hours+':'+('0'+minutes).slice(-2)+':'+('0'+seconds).slice(-2);
  } else {
    clock.textContent = t.minutes+':'+('0'+seconds).slice(-2);
  }

  
  //break
  //when we reach 0 with session time, clearInterval and start new one with break time
  if(t.total<=0 && timerCurrent == 'session'){
    timerCurrent = 'break';
    clearInterval(timeinterval);
    console.log('initialize BREAK')
    initializeClock('#time', setEndBreakSessionTime('#breakMin'));
    sessionNameChange('PAUSA');
    if (isMute == false){
      gong.play()
    }
  
  //session
  //when we reach end of break timer start the session timer again
  } else if (t.total<=0 && timerCurrent == 'break') {
    timerCurrent = 'session'
    clearInterval(timeinterval);
    console.log('initialize SESSION')
    initializeClock('#time', setEndBreakSessionTime('#sessionMin'));
    sessionNameChange('SESSION');
    if (isMute == false){
      doorbell.play()
    }
  }
  
}

updateClock(); // run function once at first to avoid delay
timeinterval = setInterval(updateClock,1000);
}
//-------------------END----------------------

//change minutes for break and session, the + and - in html
function changeMin(operator, showOn) {
  
  //reset the timer when we change the session time during session
  
  let minutes = document.querySelector(showOn)
  let minutesTimer = document.querySelector('#time')
  //+ operator
  if (operator == '+') {
    minutes.textContent = parseFloat(minutes.textContent) + 1
    //enable us to change session time without stopping the timer when it's on break, same below for -
    if(showOn == '#sessionMin' && timerCurrent == 'session') {
      minutesTimer.textContent = minutes.textContent + ':00';
      clearInterval(timeinterval);
      timerPause = true;
      $('#time').addClass('red');
      $('#startButton').html('Iniciar')
    } 
    //- operator
  } else {
    if(minutes.textContent > 1) {
      minutes.textContent = parseFloat(minutes.textContent) - 1
      if(showOn == '#sessionMin' && timerCurrent == 'session') {
        minutesTimer.textContent = minutes.textContent + ':00'
        clearInterval(timeinterval);
        timerPause = true;
        $('#time').addClass('red');
        $('#startButton').html('Iniciar')
      }
    } else {
      //console.log("can't subtract more - changeMin()")
    }   
  }
}

//change session name
function sessionNameChange(sessionName) {
  let name = document.querySelector('#mainName');
  name.textContent = sessionName
}

//reset button
function resetButton() {
  clearInterval(timeinterval);
  timerPause = true;
  timerCurrent = 'session';
  let breakMin = document.querySelector('#breakMin');
  let sessionMin = document.querySelector('#sessionMin');
  let mainTimer = document.querySelector('#time')
  breakMin.textContent = '5';
  sessionMin.textContent = '25';
  mainTimer.textContent = sessionMin.textContent + ':00';
  //start button
  let startText = document.querySelector('#startButton');
  startText.textContent = 'Iniciar';
  //mute button
  isMute = false;
  $('.fa').remove()
  $('#mute').append('<i class="fa fa-volume-up" aria-hidden="true"></i>')
  //change color to pause color
  $('#time').addClass('red');
  //session name
  timerCurrent = 'session';
  sessionNameChange('SESSION');
};

//mute button
function muteButton() {
  if (isMute == false){
    isMute = true;
    $('.fa').remove()
    $('#mute').append('<i class="fa fa-volume-off" aria-hidden="true"></i>')
    $('.fa').addClass('red');
    //console.log('isMute: '+isMute);
  } else {
    isMute = false;
    $('.fa').remove()
    $('#mute').append('<i class="fa fa-volume-up" aria-hidden="true"></i>')
    $('.fa').removeClass('red');
    //console.log('isMute: '+isMute);
  }
}

//for starting the timer on click
function startTimerOnClick(){
  let startText = document.querySelector('#startButton');
    if (timerPause==true) {
      initializeClock('#time', setEndtime())
      startText.textContent = 'Parar';
      $('#time').removeClass('red');
    } else if (timerPause == false) {
      clearInterval(timeinterval);
      console.log('timer is paused');
      timerPause = true; 
      startText.textContent = 'Continuar';
      $('#time').addClass('red');
    }
}
//jquery
$(document).ready(function(){
  //start the timer
  $('.mainTimer').on('click',function(){
    startTimerOnClick();
  })

  //+,-
  $('#breakMinus').on('click',function(){
    changeMin('-','#breakMin')
  })
  $('#breakPlus').on('click',function(){
    changeMin('+','#breakMin')
  })
  $('#sessionMinus').on('click',function(){
    changeMin('-','#sessionMin')
  })
  $('#sessionPlus').on('click',function(){
    changeMin('+','#sessionMin')
  })

  //start button
  $('#startButton').on('click',function(){
    startTimerOnClick()
  })
  
  //reset button
  $('#resetButton').on('click',function(){
      resetButton();
  })
  
  //mute button
  $('#mute').on('click',function(){
    muteButton();
  })
})