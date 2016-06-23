'use strict';

app.controller('DashboardCtrl', [
	'$scope',
	'$location',
	'authenticate',
	'journalServer',
	'$http',
	'$q',
	'reformat-emotion-data',
	function ($scope, $location, authenticate, journalServer, $http, $q, reformatEmotionData) {

		$scope.userInsights = [];

		$scope.emotionAverages = {
			anger: 0,
			joy: 0, 
			fear: 0, 
			surprise: 0,
			sadness: 0
		};

		$scope.d3EmotionData = null;

		$scope.sentimentAverage = null;

		$scope.d3SentimentData = null;

		$scope.wordCountAverage = null;

		$scope.dominantEmotion = null;

		$scope.sentimentDescription = null;

		let setUser = () => {
			console.log('1: set the user');
			$scope.currentUser = parseInt(authenticate.getUser());
		}

		let getEntryInsights = () => {
			return $q((resolve, reject) => {
				$http.get(`${journalServer}EntryAnalysis?UserId=${$scope.currentUser}`)
		 		.then(
					res => resolve(res.data),
					err => reject(err)
			 	)
			});
		}

		// for dashboard AND journal, i need average emotions formatted like {'emotion': 'anger', 'value': 1}
		// one needs to calculate averages first, one doesn't
		let findAverages = (analyses) => {
			console.log('3: calculating averages', analyses);
			let angerSum = 0;
			let joySum = 0;
			let fearSum = 0;
			let surpriseSum = 0;
			let sadnessSum = 0;
			let sentimentSum = 0;
			let wordCountSum = 0;
			analyses.forEach((el, i) => {
				console.log(el);
				angerSum += el.Anger;
				joySum += el.Joy;
				fearSum += el.Fear;
				surpriseSum += el.Surprise;
				sadnessSum += el.Sadness;
				sentimentSum += el.Sentiment;
				wordCountSum += el.WordCount;
			});
			$scope.emotionAverages.anger = angerSum / analyses.length;
			$scope.emotionAverages.joy = joySum / analyses.length;
			$scope.emotionAverages.fear = fearSum / analyses.length;
			$scope.emotionAverages.surprise = surpriseSum / analyses.length;
			$scope.emotionAverages.sadness = sadnessSum / analyses.length;
			$scope.sentimentAverage = sentimentSum / analyses.length;
			$scope.wordCountAverage = wordCountSum / analyses.length;
			findDominantEmotion();
			describeSentiment();
			$scope.d3SentimentData = {'actual': $scope.sentimentAverage, 'total': 1};
			$.when(reformatEmotionData($scope.emotionAverages)).done((json) => {
				console.log('done!', json);
				$scope.d3EmotionData = json;
			}); // current issue: async not playing well with d3
		}

		let findDominantEmotion = () => {
			let currHighestValue = 0;
			let currDominantEmotion = '';
			for (let emotion in $scope.emotionAverages) {
				if ($scope.emotionAverages[emotion] > currHighestValue) {
					currDominantEmotion = emotion;
				}
			}
			$scope.dominantEmotion = currDominantEmotion;
		}

		let describeSentiment = () => {
			let sentiment = $scope.sentimentAverage;
			if (sentiment >= 0 && sentiment <= 0.2) {
				$scope.sentimentDescription = "very negative";
			} else if (sentiment > 0.2 && sentiment <= 0.45) {
				$scope.sentimentDescription = "somewhat negative";
			} else if (sentiment > 0.45 && sentiment <= 0.55) {
				$scope.sentimentDescription = "neutral";
			} else if (sentiment > 0.55 && sentiment <= 0.8) {
				$scope.sentimentDescription = "somewhat positive";
			} else {
				$scope.sentimentDescription = "very positive";
			}
		}

		$.when(setUser()).done(() => { // defer instead of promise, because factory fn isn't async (?)
			getEntryInsights()
			.then(
				data => {
					console.log('2: got the entry insights from the db');
					$scope.userInsights = data;
					findAverages(data);
				},
				err => console.error(err)
			)
		})

		
	}
]);