
const llService = {

  createList(ll, words) {
    // create SLL with words
    for (let i = 0; i < words.length; i++) {
      ll.insertLast(words[i]);
    }
    return ll;
  },

  correctGuess(ll) {
    ll.print(ll);
    let currNode = ll.head;
    let previousNode = ll.head;
    let tempNode = ll.head;
    let positionCounter = 0;
    let position = 0;
    console.log('RUN THIS ONCE');
    currNode.value.memory_value = currNode.value.memory_value * 2;
    position = currNode.value.memory_value;
    currNode.value.correct_count++;
    while ((currNode !== null) && (positionCounter !== position)) {
      previousNode = currNode;
      currNode = currNode.next;
      positionCounter++;
      console.log('POSITION', position, 'POSITION COUNTER', positionCounter);
    }
    tempNode.next = currNode.next;
    //console.log('TEMPNODE.NEXT', tempNode.next);
    currNode.next = tempNode;
    //console.log('CURRNODE.NEXT', currNode.next);
    ll.print(ll);
  },

  incorrectGuess(ll) {
    let currNode = ll.head;
    let nextNode = ll.head.next;
    let tempNode = nextNode.next;
    currNode.value.memory_value = 1;
    currNode.value.incorrect_count++;
    ll.head = nextNode;
    ll.head.next = currNode;
    currNode.next = tempNode;
    console.log('LINKED LIST', ll);

  },
  
};

module.exports = llService;