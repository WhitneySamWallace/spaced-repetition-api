const express = require('express');
const LanguageService = require('./language-service');
const LinkedListService = require('./linked-list-service');
const SLL = require('./LinkedList');
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

      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      );

      await LanguageService.updateHead(
        req.app.get('db'),
        req.user.id,
        words[0].id
      );
      
      res.status(200).json({
        nextWord: words[0].original,
        totalScore: language.total_score,
        wordCorrectCount: words[0].correct_count,
        wordIncorrectCount: words[0].incorrect_count,
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
      req.language.id,
    );
    const currentWord = words[0];
    // Create SLL
    let languageLL = new SLL();
    languageLL = LinkedListService.createList(languageLL, words);
    
    if (req.body.guess !== currentWord.translation) {
      try {
        // linked-list-service for data manipulation
        LinkedListService.incorrectGuess(languageLL);
        // Update database
        let currNode = languageLL.head;
        while (currNode !== null) {
          await LanguageService.updateWord(
            req.app.get('db'),
            currNode.value.id,
            currNode.value
          );
          currNode = currNode.next;
        }
        
        // return status 200
        res.status(200)
          .json({
            nextWord: words[1].original,
            totalScore: language.total_score,
            wordCorrectCount: currentWord.correct_count,
            wordIncorrectCount: currentWord.incorrect_count,
            answer: currentWord.translation,
            isCorrect: false,
          });
      } catch (error) {
        next(error);
      }
    }
    if (req.body.guess === currentWord.translation) {
      try {
        // linked-list-service for data manipulation
        LinkedListService.correctGuess(languageLL);
        // update database
        let currNode = languageLL.head;
        while (currNode !== null) {
          await LanguageService.updateWord(
            req.app.get('db'),
            currNode.value.id,
            currNode.value
          );
          currNode = currNode.next;
        }

        const updatedScore = (language.total_score + 1);
        
        await LanguageService.updateScore(
          req.app.get('db'),
          req.user.id,
          updatedScore
        );

        const updatedTotalScore = await LanguageService.getUsersLanguage(
          req.app.get('db'),
          req.user.id,
        );
        
        
        // return status 200
        res.status(200)
          .json({
            nextWord: words[1].original,
            totalScore: updatedTotalScore.total_score,
            wordCorrectCount: currentWord.correct_count,
            wordIncorrectCount: currentWord.incorrect_count,
            answer: currentWord.translation,
            isCorrect: true,
          });
      } catch (error) {
        next(error);
      }
    }
  });

module.exports = languageRouter;
