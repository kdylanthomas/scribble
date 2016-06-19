// goal: provide space for user to write a journal entry
// upon submit, POST entry to db AND get entryID back from GET
// then, make post request to indico /sentiment and /emotion for data
// use those responses to build a entryAnalysis object and POST to db

// 1. POST entry. on success, trigger GET 
// 2. GET entry so you have the entryId  <-- get request should return a promise
// 3. POST to indico /sentiment
// 4. POST to indico /emotion
// 5. POST entryAnalysis object to db 

'use strict';

app.controller('JournalCtrl', [
	'$scope',
	'authenticate',
	'$http',
	'$q',
	'journalServer',
	'indicoEmotion',
	'indicoSentiment',
	function ($scope, authenticate, $http, $q, journalServer, indicoEmotion, indicoSentiment) {
		//$scope.currentUser = authenticate.getUser(); // get user currently logged in

		$scope.journalEntry = {
			text: '',
			dateStarted: null,
			dateSubmitted: null,
			wordCount: 0,
			//userId: $scope.currentUser.UserId
			userId: 5
		}

		$scope.entryAnalysis = {
			anger: 0,
			joy: 0,
			fear: 0,
			surprise: 0,
			sadness: 0,
			sentiment: 0,
			userId: null,
			entryId: null
		};

		let startedWriting = false;

		$scope.assignDateStarted = function () { // method on $scope to use ng-keypress directive
			if (!startedWriting) {
				$scope.journalEntry.dateStarted = new Date();
				startedWriting = true;
			}
		}

		$scope.postEntry = function () {
			$scope.journalEntry.dateSubmitted = new Date();
			$scope.journalEntry.wordCount = getWordCount($scope.journalEntry.text);
			$http.post(`${journalServer}Entry`, JSON.stringify($scope.journalEntry))
			.then(
				res => {
					let submittedEntry = res.data;
					console.log('successfully saved entry!', submittedEntry);
					$scope.entryAnalysis.entryId = submittedEntry.EntryId;
					$scope.entryAnalysis.userId = submittedEntry.UserId;
					return analyzeSentiment(submittedEntry.Text);
				},
				err => console.error('Something went wrong:', err) // err
			);
		}

		let getWordCount = (text) => text.split(' ').length

		let analyzeSentiment = (text) => {
			$http({
				method: 'POST',
				url: indicoSentiment,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
			    data: JSON.stringify({'data': text})
			})
			.then(
				res => {
					console.log('success! sentiment data:', res.data);
					$scope.entryAnalysis.sentiment = res.data.results;
					return analyzeEmotion(text);
				},
				err => console.error('error :(', err)
			)
		}

		let analyzeEmotion = function (text) {
			$http({
				method: 'POST',
				url: indicoEmotion,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
			    data: JSON.stringify({'data': text})
			})
			.then(
				res => {
					console.log('success! emotion data:', res.data);
					let results = res.data.results;
					$scope.entryAnalysis.anger = results.anger;
					$scope.entryAnalysis.joy = results.joy;
					$scope.entryAnalysis.fear = results.fear;
					$scope.entryAnalysis.surprise = results.surprise;
					$scope.entryAnalysis.sadness = results.sadness;
					return postEntryAnalysis();
				},
				err => console.error('error :(', err)
			)
		}

		let postEntryAnalysis = () => {
			$http.post(`${journalServer}EntryAnalysis`, $scope.entryAnalysis)
			.then(
				res => {
					console.log('successfully saved entry analysis!', res.data);
				},
				err => console.error('Something went wrong:', err) 
			);
		}

	}
]);