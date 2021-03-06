'use strict';

app.controller('JournalCtrl', [
	'$scope',
	'authenticate',
	'$http',
	'journalServer',
	'indicoEmotion',
	'indicoSentiment',
	function ($scope, authenticate, $http, journalServer, indicoEmotion, indicoSentiment) {
		$scope.currentUser = authenticate.getUser(); // get user currently logged in
		$scope.currUserName = localStorage.getItem('currUserName');
		$scope.currDate = moment().format('dddd, MMMM Do');

		$scope.journalEntry = {
			text: '',
			dateStarted: null,
			dateSubmitted: null,
			wordCount: 0,
			userId: parseInt($scope.currentUser)
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

		$scope.allUserEntries = [];

		// DEFAULT VALUES ON PAGE LOAD
		$scope.isEditing = false;
		$scope.textForSubmit = "Submit";

		let startedWriting = false;
		let entryToEdit = null;
		let analysisToEdit = null;

		$scope.restoreDefaults = function () {
			$scope.isEditing = false;
			$scope.textForSubmit = "Submit";
			$scope.journalEntry.text = "";
			$scope.journalEntry.formattedDate = null;
			startedWriting = false;
			entryToEdit = null;
			analysisToEdit = null;
		};

		// **********************
		// GET ENTRIES ON PAGE LOAD
		// **********************

		$scope.getAllEntries = function () {
			$http.get(`${journalServer}Entry?UserId=5`)
			.then(
				res => {
					let entries = res.data;
					entries.forEach((entry, i) => {
						entry.formattedDate = moment(entry.DateStarted).format('dddd, MMMM Do YYYY');
					});
					$scope.allUserEntries = entries;
				},
				err => console.log(err)
			)
		}

		$scope.displaySingleEntry = function (id) { // for user to view and edit an entry
			$http.get(`${journalServer}Entry/${id}`)
			.then(
				res => {
					let entry = res.data;
					$scope.journalEntry.text = entry.Text;
					$scope.journalEntry.dateStarted = entry.DateStarted;
					$scope.journalEntry.formattedDate = moment(entry.DateStarted).format('MMMM D, YYYY');
					$scope.isEditing = true;
					$scope.textForSubmit = "Save Edits";
					entryToEdit = entry.EntryId;
				},
				err => console.log(err)
			)
		}

		$scope.assignDateStarted = function () { // method on $scope to use ng-keypress directive
			if (!startedWriting && !$scope.isEditing) {
				$scope.journalEntry.dateStarted = new Date();
				startedWriting = true;
			}
		}

		// **********************
		// POST/PUT ENTRY
		// **********************

		let postNewEntry = entry => {
			$http.post(`${journalServer}Entry`, JSON.stringify(entry))
			.then(
			res => {
				let submittedEntry = res.data;
				console.log('successfully saved entry!', submittedEntry);
				$scope.entryAnalysis.entryId = submittedEntry.EntryId;
				$scope.entryAnalysis.userId = submittedEntry.UserId;
				return analyzeSentiment(submittedEntry.Text);
			},
			err => console.error('Something went wrong:', err) // err
		)};

		let editExistingEntry = entry => {
			$http.put(`${journalServer}Entry/${entryToEdit}`, JSON.stringify(entry))
			.then(
			res => {
				let submittedEntry = res.data;
				$scope.entryAnalysis.entryId = entryToEdit;
				$scope.entryAnalysis.userId = $scope.journalEntry.userId;
				$http.get(`${journalServer}EntryAnalysis?EntryId=${entryToEdit}`)
				.then(
					res => {
						console.log(res.data[0]);
						let entryAnalysis = res.data[0];
						analysisToEdit = entryAnalysis.EntryAnalysisId;
						return analyzeSentiment($scope.journalEntry.text);
					},
					err => console.log(err)
				);
			},
			err => console.error('Something went wrong:', err) // err
			);
		}

		$scope.submitEntry = function () {
			$scope.journalEntry.dateSubmitted = new Date();
			$scope.journalEntry.wordCount = getWordCount($scope.journalEntry.text);
			if ($scope.isEditing === false) {
				postNewEntry($scope.journalEntry);
			} else {
				$scope.journalEntry.EntryId = entryToEdit;
				editExistingEntry($scope.journalEntry);
			}
		}


		// **********************
		// GETTING ANALYTICS
		// **********************

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

		// **********************
		// POST/PUT ENTRY ANALYSIS
		// **********************

		let postEntryAnalysis = () => {
			if ($scope.isEditing) {
				$scope.entryAnalysis.EntryAnalysisId = analysisToEdit;
				$http.put(`${journalServer}EntryAnalysis/${analysisToEdit}`, $scope.entryAnalysis)
				.then(
					res => console.log('successfully edited entry analysis!'),
					err => console.log(err)
				);
			} else {
				$http.post(`${journalServer}EntryAnalysis`, $scope.entryAnalysis)
				.then(
					res => {
						console.log('successfully saved entry analysis!', res.data);
						$scope.getAllEntries();
					},
					err => console.error(err) 
				);
			}
		}

		// **********************
		// DELETE ENTRY
		// **********************

		$scope.deleteEntry = function () {
			$http.delete(`${journalServer}Entry/${entryToEdit}`)
			.then(
				() => {
					$scope.restoreDefaults();
					$scope.getAllEntries();
				},
				err => console.error(err)
			);
		}

	}
]);