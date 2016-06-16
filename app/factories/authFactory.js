'use strict';

app.factory('AuthFactory', [
	function () {
		let currentUser = null;
		return {
			getUser: () => currentUser,
			setUser: (user) => currentUser = user
		}
	}
])