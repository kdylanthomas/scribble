'use strict';

app.factory('authenticate', function ($location) {
	let currentUser = null;
	return {
		getUser: () => localStorage.getItem('currUserId'),
		setUser: (user) => {
			if (user === null) {
				localStorage.removeItem('currUserId');
				$location.path('/login');
			} else {
				console.log(user);
				localStorage.setItem('currUserId', user.UserId);
				$location.path('/journal');
			}
			currentUser = user;
		}
	}
});