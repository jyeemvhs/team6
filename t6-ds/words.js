const fs = require("fs");

let words;

exports.loadWords = function() {
    fs.readFile(__dirname + "/words.txt", 'utf8', function(err, data) {
        if (err) 
            throw new Error(err);
        
        words = data.split(/\r?\n/);
        //console.log(words);
    });
}

exports.randomWord = function() {
    return words[Math.floor(Math.random() * words.length)];
}

exports.checkEmpty = function(str) {
    return !str || str.length == 0 || str.trim().length == 0 || str.trim() == "";
}