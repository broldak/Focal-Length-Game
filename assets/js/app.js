$(document).ready(function(){
  var App = {
    endpoint: 'http://24.6.41.229:8000/api/getPhoto',
    $photoRegion: $('#photo-region'),
    $photo: $('#photo-region').find('.photo-wrap'),
    gameState: {
      currentScore: 0,
      questionNumber: 0,
      gameOver: false
    },

    elements: {
      answerButton: '.answer-btn',
      answerForm: $('.answer-form'),
      answerInput: $('.answer-input'),
      score: $('.score'),
      progressBar: $('.top-bar-progress'),
      qNumber: $('.q-number'),
      error: $('.error'),
      gameOver: $('.game-over'),
      instructions: $('.instructions'),
      tryAgain: $('.try-again')
    },

    events: [
      {
        on: 'submit',
        el: '.answer-form',
        fn: 'refreshPhoto'
      },
      {
        on: 'load',
        el: '.photo',
        fn: 'toggleImageLoaded'
      },
      {
        on: 'click',
        el: '.try-again',
        fn: 'resetGame'
      }
    ],

    currentPhoto: {
      pageurl: '',
      photourl: '',
      fnumber: '',
      focallength: ''
    },

    initialize: function(reInit) {
      this._fetchAndUpdatePhoto();

      if (!reInit) {
        this._mapEvents();
      }
      
      this.elements.answerInput.focus();
    },

    _mapEvents: function() {
      this.events.forEach((function(v, i) {
        $(v.el).on(v.on, this[v.fn].bind(this));
      }).bind(this));
    },

    refreshPhoto: function(e) {
      e.preventDefault();

      var answer = parseInt(this.elements.answerInput.val());
      var isCorrect = false;

      if (isNaN(answer)) {
        this.elements.error.html('Please enter a number');
        return;
      } else {
        this.elements.error.html('');
      }

      if (answer == this.currentPhoto.focallength) isCorrect = true;
      if (this.gameState.questionNumber == 9) this.gameState.gameOver = true;

      if (!this.gameState.gameOver) {
        this.gameState.questionNumber += 1;
        this._fetchAndUpdatePhoto();
      }

      var scoreForQuestion = this._calculateScore(answer);
      this._updateState(scoreForQuestion);
    },

    _calculateScore: function(answer) {
      var threshold = this.currentPhoto.focallength*0.1;

      for (var x = 0; x< 10; x++){
        if (Math.abs(this.currentPhoto.focallength - answer) <= x*threshold) {
          return 10 - x;
        }
      }

      return 0;
    },

    _updateState: function(scoreForQuestion) {
      this.gameState.currentScore += scoreForQuestion;
      console.log(this.gameState.currentScore);

      if (this.gameState.gameOver) {
        this.populateTwitterShareButton();
        this._triggerGameOverState();
        
        return;
      }

      this.elements.score.html(this.gameState.currentScore);
      this.elements.progressBar.css('width', (this.gameState.questionNumber+1)*10+'%');
      this.elements.qNumber.html(this.gameState.questionNumber+1);
      this.elements.answerInput.focus();
    },

    _triggerGameOverState: function() {
      this.$photo.addClass('hidden');
      this.elements.answerInput.addClass('hidden');
      this.elements.gameOver.addClass('active');
      this.elements.instructions.find('h1').html('Game Over');
      return;
    },

    toggleImageLoaded: function() {
      this.$photo.toggleClass('loading');
    },

    _fetchAndUpdatePhoto: function() {
      $.get(this.endpoint).then((function(data){
        this.$photo.css('background-image', 'url(' + data.photourl + ')');
        this.$photo.parents('a').attr('href', data.pageurl);
        this.currentPhoto.pageurl = data.pageurl;
        this.currentPhoto.photourl = data.photourl;
        this.currentPhoto.fnumber = data.fnumber;
        this.currentPhoto.focallength = data.focallength;
        this.elements.answerInput.val('');
      }).bind(this));

      this.toggleImageLoaded();
    },

    populateTwitterShareButton: function() {
      $('.twitter-share-button').attr('data-text', 'Beat my score of ' + this.gameState.currentScore + ' on Focal Length game!');
      debugger;

      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    },

    resetGame: function() {
      this.gameState.currentScore = 0;
      this.gameState.questionNumber = 0;
      this.gameState.gameOver = false;

      //reset game over state
      this.$photo.removeClass('hidden');
      this.elements.answerInput.removeClass('hidden');
      this.elements.gameOver.removeClass('active');
      this.elements.instructions.find('h1').html('What is the focal length of this photo?');
      this.elements.progressBar.css('width', (this.gameState.questionNumber+1)*10+'%');
      this.elements.qNumber.html(this.gameState.questionNumber+1);

      this.initialize(true);
    }
  }

  App.initialize();
});