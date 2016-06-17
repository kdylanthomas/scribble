'use strict';

let app = angular.module('scribble', ['ngRoute'])
.constant('journalServer', 'http://localhost:5000/api/');


app.config(['$routeProvider',
  ($routeProvider) => {
    $routeProvider.
      when('/login', {
        templateUrl: 'partials/login-view.html',
        controller: 'LoginCtrl'
      }).
      when('/journal', {
        templateUrl: 'partials/journal-view.html'
        //controller: 'JournalCtrl'
      }).
      otherwise({
        redirectTo: '/login'
      });
  }]);