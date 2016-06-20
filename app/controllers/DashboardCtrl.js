'use strict';

app.controller('DashboardCtrl', [
	'$scope',
	'authenticate',
	'journalServer',
	'$http',
	'$q',
	function ($scope, authenticate, journalServer, $http, $q) {
		
		let setUser = () => {
			console.log('1: set the user');
			$scope.currentUser = authenticate.getUser();
		}

		$scope.userInsights = [];

		$scope.userAverages = {
			angerAvg: 0,
			joyAvg: 0, 
			fearAvg: 0, 
			surpriseAvg: 0,
			sadnessAvg: 0,
			sentimentAvg: 0,
			wordCountAvg: 0
		};

		let getEntryInsights = () => {
			return $q((resolve, reject) => {
				$http.get(`${journalServer}${$scope.currentUser.EntryAnalyses}`)
		 		.then(
					res => resolve(res.data),
					err => reject(err)
			 	)
			});
		}

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
			$scope.userAverages.angerAvg = angerSum / analyses.length;
			$scope.userAverages.joyAvg = joySum / analyses.length;
			$scope.userAverages.fearAvg = fearSum / analyses.length;
			$scope.userAverages.surpriseAvg = surpriseSum / analyses.length;
			$scope.userAverages.sadnessAvg = sadnessSum / analyses.length;
			$scope.userAverages.sentimentAvg = sentimentSum / analyses.length;
			$scope.userAverages.wordCountAvg = wordCountSum / analyses.length;
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