const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from('language')
      .select(
        'language.id',
        'language.name',
        'language.user_id',
        'language.head',
        'language.total_score',
      )
      .where('language.user_id', user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ language_id });
  },

  getWord(db, id) {
    return db
      .from('word')
      .select(
        'id',
        'language_id',
        'original',
        'translation',
        'next',
        'memory_value',
        'correct_count',
        'incorrect_count',
      )
      .where({ id });
  },

  updateWord(db, id, node) {
    return db
      .from('word')
      .where({ id })
      .update({
        next: node.next,
        memory_value: node.memory_value,
        correct_count: node.correct_count,
        incorrect_count: node.incorrect_count
      });
  },

  updateScore(db, user_id, newScore) {
    return db
      .from('language')
      .where('language.user_id', user_id)
      .update({
        total_score: newScore
      });
  }


  // updateScore(db, user_id) {
  //   return db
  //     .select(
  //       db.raw(
  //         `SUM('word.correct_count') as correct_total`
  //       )
  //     )
  //     .from('language')
  //     .where('language.user_id', user_id)
  //     .join('word', 'words.language_id', 'language.id')
  //     // .update({
  //     //   total_score: 'language.correct_total',
  //     // })
  // }
};

module.exports = LanguageService;
