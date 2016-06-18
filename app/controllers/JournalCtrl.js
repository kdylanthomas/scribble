// goal: provide space for user to write a journal entry
// upon submit, POST entry to db AND get entryID back from GET
// then, make post request to indico /sentiment and /emotion for data
// use those responses to build a entryAnalysis object and POST to db

'use strict';

app.controller('JournalCtrl', [
	'$scope',
	'authenticate',
	'$http',
	'$q',
	function ($scope, authenticate, $http, $q) {
		let currentUser = authenticate.getUser();
		console.log(currentUser);
	}
]);