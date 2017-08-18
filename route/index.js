const express = require('express');
const router = express.Router();

let words = ['alliance', 'barefoot', 'converse', 'dumfound', 'enormous'];

function chooseWord(array){
  return array[Math.floor(Math.random() * array.length)];
};
function stringToObjArr (string){
  currentWordArr = [];
  for (var i = 0; i < string.length; i++) {
    let obj = {
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

    // function isCorrect(obj){
    //   return obj.guessed = true;
    // };
    // if(currentWordArr.every(isCorrect)){
    //   console.log('True');
    // } else {
    //   console.log('False');
    // }

    // let winCheck = false;
    // currentWordArr.forEach(function(letter){
    //   console.log(winCheck);
    //   if (!letter.guessed) break;
    //   winCheck = true;
    //   console.log(winCheck);
    // })
    let winCheck = false;
    for(let letter of currentWordArr){
      if(letter.guessed == false){
        winCheck = false;
        break;
      }
      winCheck = true;
    }
    if(winCheck){
      console.log('You win!');
    }

    if(!guessFlag){
      dataObj.remaining--;
    }
    guesses.push(req.body.guess);
    res.redirect('/');
  }
});

module.exports = router;
