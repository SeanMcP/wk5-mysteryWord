const express = require('express');
const fs = require('fs');
const router = express.Router();

const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let easyWords = ['alliance', 'barefoot', 'converse', 'dumfound', 'enormous'];

function chooseWord (array) {
  return array[Math.floor(Math.random() * array.length)];
};
function stringToObjArr (string){
  let currentWordArr = [];
  for (var i = 0; i < string.length; i++) {
    let obj = {
      value: string[i],
      placeholder: "_",
      guessed: false
    }
    currentWordArr.push(obj);
  }
  return currentWordArr;
};
function createGameState(){
  return {
    word: stringToObjArr(chooseWord(words)),
    guesses: [],
    remaining: 8
  }
}

router.get('/', function (req, res) {
  if(!req.session.state){
    req.session.state = createGameState();
    res.render('game', req.session.state);
  } else {
    res.render('game', req.session.state);
  }
});

router.post('/guess', async function (req, res) {
  let currentState = req.session.state;

  req.checkBody('guess', 'Guess a letter').notEmpty();
  req.checkBody('guess', 'Only guess one letter at a time').len(1, 1);
  req.checkBody('guess', 'You can only guess English letters').isAlpha();

  // Try and catch did not work here
  let errors = await req.getValidationResult();
  let messages = errors.array().map(function(error){
    return error.msg;
  })

  currentState.error = messages;

  if (currentState.error.length === 0) {
    let guessFlag = false;
    let newGuess = req.body.guess.toLowerCase();
    if (currentState.guesses.includes(newGuess)) {
      guessFlag = true;
      currentState.error = ['You already guessed that letter']
    } else {
      currentState.word.forEach(function (obj) {
        if (obj.value == newGuess) {
          guessFlag = true;
          obj.placeholder = obj.value;
          obj.guessed = true;
        }
      })

      let winCheck = false;
      for (let letter of currentState.word) {
        if (letter.guessed == false) {
          winCheck = false;
          break;
        }
        winCheck = true;
      }

      // **********************************
      //             YOU WIN!
      // **********************************
      if (winCheck) {
        currentState.outcome = 'You win';
        if (currentState.remaining === 1) {
          currentState.message = 'with ' +  currentState.remaining + ' guess to spare!';
        } else {
          currentState.message = 'with ' +  currentState.remaining + ' guesses to spare!';
        }
        res.redirect('/over');
      }

      if (!guessFlag) {
        currentState.remaining--;
      }

      // **********************************
      //             YOU LOSE!
      // **********************************
      currentState.guesses.push(req.body.guess.toLowerCase());
      if (currentState.remaining < 1) {
        currentState.outcome = 'You lose.';
        currentState.message = 'Better luck next time.';
        currentState.remaining = 0;
        res.redirect('/over');
      }
    }
    res.redirect('/');
  } else {
    res.render('game', currentState);
  }
  // .catch did not work here
}); // catch did not work here

router.get('/over', function(req, res){
  if (!req.session.state) {
    res.redirect('/')
  } else if (!req.session.state.outcome) {
    res.redirect('/')
  } else {
    res.render('over', {session: req.session.state})
  }
});

router.get('/again', function(req, res){

  req.session.destroy(function(err){
    if (err) {
      console.log('Play again error:', err);
    }
  })
  res.redirect('/');
});

module.exports = router;
