
const llService = {

  async createList(ll, data) {
    // create SLL with words
    let results = data.forEach((word) => ll.insertLast(word));
    return results;
  },

  correctGuess() {

  },

  incorrectGuess() {

  },
  
};

module.exports = llService;