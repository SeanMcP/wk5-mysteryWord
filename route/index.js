const express = require('express');
const fs = require('fs');
const router = express.Router();

const genWords = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");

let words = ['alliance', 'barefoot', 'converse', 'dumfound', 'enormous'];
let mdWords = ['ape', 'bat', 'can', 'dog']
let smWords = ['z', 'x', 'a', 's'];

function chooseWord(array){
  return array[Math.floor(Math.random() * array.length)];
};
function stringToObjArr (string){
  let currentWordArr = [];
  for (var i = 0; i < string.length; i++) {
    let obj = {
      actual: string[i],
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


router.get('/', function(req, res){
  if(!req.session.state){
    req.session.state = createGameState();
    console.log("no state!!!!!!!!!");
    console.log("state: ", req.session.state);
    res.render('game', req.session.state);
  } else {
    console.log("YES state!!!!!!!!!");
    res.render('game', req.session.state);
  }
});

router.post('/guess', function(req, res){
  let currentState = req.session.state;
  let messages = [];

  req.checkBody('guess', 'Guess a letter').notEmpty();
  req.checkBody('guess', 'Only guess one letter at a time').len(1, 1);
  req.checkBody('guess', 'Your guesses can only be letters').isAlpha();

  let errors = req.getValidationResult();

  errors.then(function(result){
    result.array().forEach(function(error){
      console.log("pushing: " + error.msg);
      messages.push(error.msg);
    });
  });
  console.log('====== HOT POTATO ======');
  console.log('messages: ', messages);

  req.session.state.error = messages;

  console.log('req.session.state.error', req.session.state.error);
  console.log('messages.length: ',messages.length);

  if(messages.length === 0){
    let guessFlag = false;
    let newGuess = req.body.guess.toLowerCase();
    if(req.session.state.guesses.includes(newGuess)){
      guessFlag = true;
      return;
    } else {
      req.session.state.word.forEach(function(obj){
        if(obj.value == newGuess){
          guessFlag = true;
          obj.placeholder = obj.value;
          obj.value = "_";
          obj.guessed = true;
        }
      })

      let winCheck = false;
      for(let letter of currentState.word){
        if(letter.guessed == false){
          winCheck = false;
          break;
        }
        winCheck = true;
      }

      // **********************************
      //             YOU WIN!
      // **********************************
      if(winCheck){
        req.session.state.outcome = 'You win!';
        if(req.session.state.remaining !== 1){
          req.session.state.message = 'With ' +  req.session.state.remaining + ' moves to spare.';
        } else {
          req.session.state.message = 'With ' +  req.session.state.remaining + ' move to spare.';
        }
        // req.session.answer = dataObj;
        res.redirect('/over');
      }

      if(!guessFlag){
        req.session.state.remaining--;
      }

      // **********************************
      //             YOU LOSE!
      // **********************************
      req.session.state.guesses.push(req.body.guess.toLowerCase());
      if(req.session.state.remaining < 0){
        req.session.state.outcome = 'You lose!';
        req.session.state.message = 'Better luck next time.';
        req.session.state.remaining = 0;
        // req.session.answer = dataObj;
        res.redirect('/over');
      }
    }
  }
  res.redirect('/');
});

router.get('/over', function(req, res){
  res.render('over', {session: req.session.state})
});

router.get('/again', function(req, res){

  req.session.destroy(function(err){
    console.log('Play again error:', err);
  })
  // currentWordArr = [];
  // stringToObjArr(chooseWord(words));
  //
  // guesses = [];
  // remaining = currentWordArr.length;
  //
  // dataObj = {
  //   word: currentWordArr,
  //   guesses: guesses,
  //   remaining: currentWordArr.length
  // }
  res.redirect('/');
});

module.exports = router;
