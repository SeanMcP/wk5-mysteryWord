const express = require('express');
const router = express.Router();

let words = ['alliance', 'barefoot', 'converse', 'dumfound', 'enormous'];
let mdWords = ['ape', 'bat', 'can', 'dog']
let smWords = ['z', 'x', 'a', 's'];

function chooseWord(array){
  return array[Math.floor(Math.random() * array.length)];
};
function stringToObjArr (string){
  currentWordArr = [];
  for (var i = 0; i < string.length; i++) {
    let obj = {
      actual: string[i],
      value: string[i],
      placeholder: "_",
      guessed: false
    }
    currentWordArr.push(obj);
  }
};

let currentWordArr = [];
stringToObjArr(chooseWord(words));

let guesses = [];
let remaining = currentWordArr.length;

let dataObj = {
  word: currentWordArr,
  guesses: guesses,
  remaining: currentWordArr.length
}

router.get('/', function(req, res){
  res.render('game', dataObj);
});

router.post('/guess', function(req, res){
  let guessFlag = false;
  let newGuess = req.body.guess;
  if(guesses.includes(newGuess)){
    guessFlag = true;
    return;
  } else {
    currentWordArr.forEach(function(obj){
      if(obj.value == newGuess){
        guessFlag = true;
        obj.placeholder = obj.value;
        obj.value = "_";
        obj.guessed = true;
        console.log('currentWordArr:\n', currentWordArr);
      }
    })

    let winCheck = false;
    for(let letter of currentWordArr){
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
      console.log('You win!');
      dataObj.outcome = 'You win!';
      if(dataObj.remaining !== 1){
        dataObj.message = 'With ' +  dataObj.remaining + ' moves to spare';
      } else {
        dataObj.message = 'With ' +  dataObj.remaining + ' move to spare';
      }
      req.session.answer = dataObj;
      console.log('dataObj:\n', dataObj);
      res.redirect('/over');
    }

    if(!guessFlag){
      dataObj.remaining--;
    }

    // **********************************
    //             YOU LOSE!
    // **********************************
    guesses.push(req.body.guess);
    if(dataObj.remaining < 0){
      console.log('You lose!');
      dataObj.outcome = 'You lose!';
      dataObj.message = 'Better luck next time';
      dataObj.remaining = 0;
      req.session.answer = dataObj;
      res.redirect('/over');
    }
    res.redirect('/');
  }
});

router.get('/over', function(req, res){
  res.render('over', {session: req.session.answer})
  console.log(req.session.answer);
});

router.get('/again', function(req, res){

  req.session.destroy(function(err){
    console.log('Plag again error:', err);
  })

  currentWordArr = [];
  stringToObjArr(chooseWord(words));

  guesses = [];
  remaining = currentWordArr.length;

  dataObj = {
    word: currentWordArr,
    guesses: guesses,
    remaining: currentWordArr.length
  }
  res.redirect('/');
});

module.exports = router;
