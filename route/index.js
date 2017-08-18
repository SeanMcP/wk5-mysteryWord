const express = require('express');
const router = express.Router();

let words = ['redbeard'];
let formattedWord = ['r', 'e', 'd', 'b', 'e', 'a', 'r', 'd'];
let testString = 'redbeard';
let testArr = [];

for (var i = 0; i < testString.length; i++) {
  let obj = {
    value: "_",
    placeholder: testString[i]
  }
  testArr.push(obj);
}

console.log('testArr after:', testArr);

let guesses = [];
let remaining = 8;

let dataObj = {
  word: testArr,
  guesses: guesses,
  remaining: remaining
}

router.get('/', function(req, res){
  res.render('layout', dataObj);
});

router.post('/guess', function(req, res){
  let guessFlag = false;
  let newGuess = req.body.guess;
  if(guesses.includes(newGuess)){
    guessFlag = true;
    return;
  } else {
    testArr.forEach(function(obj){
      if(obj.placeholder == newGuess){
        guessFlag = true;
        obj.placeholder = obj.value;
        obj.value = newGuess;
      }
    })
    if(!guessFlag){
      dataObj.remaining--;
    }
    guesses.push(req.body.guess);
    res.redirect('/');
  }
});

module.exports = router;
