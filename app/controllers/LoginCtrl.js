'use strict';

app.controller('LoginCtrl', [
	'$scope',
	'$http',
	'journalServer',
	'authenticate',
	function ($scope, $http, journalServer, authenticate) {

		$scope.googleOauth = function () {
			OAuth.initialize('VQpWdUCqvJVMusQiRHOgoExz274')
			OAuth.popup('google').done((result) => { // result is the oauth object with token info
			    console.log(result)
			    result.me().done(data => { // data is user info object
			    	console.log(data);
			    	localStorage.setItem('currUserName', data.firstname);
			    	let user = JSON.stringify({
			    		username: data.email,
			    		firstName: data.firstname,
			    	 	lastName: data.lastname,
			    	  	dateRegistered: new Date()
			    	});
			    	$http.post(`${journalServer}User`, user)
					.then(
						res => { // handles 201 
							authenticate.setUser(res.data[0]);
						}, 
						err => { // handles non-200, including 409 (conflict/user already exists)
							if (err.status === 409) {
								$http.get(`${journalServer}User?Username=${data.email}`)
								.then(
									userData => authenticate.setUser(userData.data[0]),
									err => console.log(`could not find ${data.email}`)
								);
							} else {
								throw new Error(err);
							}
						} 
					)
	    		});
			});
		}
	}
]);