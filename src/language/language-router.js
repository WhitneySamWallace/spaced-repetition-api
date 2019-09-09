const express = require('express');
const LanguageService = require('./language-service');
const LinkedListService = require('./linked-list-service');
const { requireAuth } = require('../middleware/jwt-auth');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );

      if (!language)
        return res.status(404).json({
          error: 'You don\'t have any languages',
        });

      req.language = language;
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });


languageRouter
  .get('/head', async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      );
      const word = await LanguageService.getWord(
        req.app.get('db'),
        req.language.head, // reassigned after each guess, see /guess below
      );
      
      res.status(200).json({
        nextWord: word[0].original,
        totalScore: language.total_score,
        wordCorrectCount: word[0].correct_count,
        wordIncorrectCount: word[0].incorrect_count,
      });
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    // if there is no body or no guess, return 400
    if (!req.body || !req.body.guess) {
      res.status(400).json({
        error: 'Missing \'guess\' in request body'
      });
    }
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id,
    );
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.user.id,
    );
    const currentWord = await LanguageService.getWord(
      req.app.get('db'),
      // ID of current word is whichever is currently the head
      req.language.head
    );
    const nextWord = await LanguageService.getWord(
      req.app.get('db'),
      // ID of next word is current head + 1
      (req.language.head + 1)
    );
    // if guess is incorrect, return 200 
    if (req.body.guess === 'incorrect') {
      try {
      // MANIPULATE LINKED LIST HERE?
        let ll = LinkedListService.createList(words);
        // set M to 1, increment incorrect count for specific word, increment total score
        // move head to next (remove node and reposition?)
        // reposition question according to M
        // return status 200
        res.status(200)
        // send head (new question)
          .json({
            ll: ll,
            nextWord: nextWord[0].original,
            totalScore: language.total_score,
            wordCorrectCount: currentWord[0],
            wordIncorrectCount: currentWord[0].incorrect_count,
            answer: currentWord[0].translation,
            isCorrect: false,
          });
      } catch (error) {
        next(error);
      }
    }

    if (req.body.guess === 'correct') {
      try {
      // MANIPULATE LINKED LIST HERE?
      // set M to M^2, increment incorrectly answered, DO NOT increment score
      // move head to next (remove node and reposition?)
      // reposition question according to M
      // return status 200
        res.status(200)
        // send head (new question)
          .json({
            nextWord: nextWord[0].original,
            totalScore: language.total_score,
            wordCorrectCount: currentWord[0],
            wordIncorrectCount: currentWord[0].incorrect_count,
            answer: currentWord[0].translation,
            isCorrect: false,
          });
      } catch (error) {
        next(error);
      }
    }
  });

module.exports = languageRouter;
