const SLL = require('./LinkedList');
const languageService = require('./language-service');

let languageLL = new SLL();

const llService = {

  async createList() {
    // get current words
    let words = await languageService.getLanguageWords();
    // create SLL with words
    words.forEach((word) => languageLL.insertLast(word));
    console.log('CREATED LIST', languageLL);
  },

  correctGuess() {

  },

  incorrectGuess() {

  },
  
};

module.exports = llService;