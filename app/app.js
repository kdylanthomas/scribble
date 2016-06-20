'use strict';

let app = angular.module('scribble', ['ngRoute'])
.constant('journalServer', 'http://localhost:5000/api/')
.constant('indicoSentiment', 'https://apiv2.indico.io/sentiment?key=43ef4ee1b5a5375de5a3e17f9d69794f')
.constant('indicoEmotion', 'https://apiv2.indico.io/emotion?key=43ef4ee1b5a5375de5a3e17f9d69794f');

app.config(['$routeProvider', '$httpProvider',

  ($routeProvider, $httpProvider) => {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider.
      when('/login', {
        templateUrl: 'partials/login-view.html',
        controller: 'LoginCtrl'
      }).
      when('/journal', {
        templateUrl: 'partials/journal-view.html',
        controller: 'JournalCtrl'
      }).
      when('/dashboard', {
        templateUrl: 'partials/dashboard-view.html',
        controller: 'DashboardCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);