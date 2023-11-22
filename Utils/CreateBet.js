const Bet = require('../Models/Bet');
const declareResult = require('./DeclareBetResult');
const generateBetId = require('./GenerateBetId');

let timerInterval;
// Function to increment the timer every second
function startTimer(updateTimer) {
  timer = 180;  
  timerInterval = setInterval(() => {
    if(timer > 0) {
      timer--;
      updateTimer(timer);
    }
  }, 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

async function createBet(io, updateTimer) {
  try {
    // start the timer 
    startTimer(updateTimer);

    // retrieve latest bet
    const latestBet = await Bet.findOne().sort({ createdAt: -1 });
    let betId = generateBetId(latestBet ? latestBet.betId : undefined);

    // create new bet 
    const newBet = await Bet.create({
      betId,
      status: 'running'
    })

    if(!newBet) {
      console.log('Error creating new bet')
    }

    // Emit the event to all user and admin
    io.emit('newBet', newBet);
    
    // Schedule the result declaration using setTimeout
    setTimeout(() => {
      declareResult(io, newBet.id);

      // stop the timer 
      stopTimer();
      updateTimer(0);
    }, (1000*60*3) - 1000); 

  } catch (error) {
    console.error('Error creating bet:', error);
  }
}

module.exports = createBet;

