import { Injectable } from '@angular/core';

import { UserService } from '../../../app/_services/user.service';
import { ApiService } from '../../../app/_services/api.service';

import { environment } from '../../../_environments/environment';

@Injectable()
export class NotificationService {
	
	notifications = undefined;
	notificationsPromise = undefined;

	constructor(private _apiService: ApiService, 
				private _userService: UserService) { 

	}

	init() {
		this.notifications = undefined;
		this.notificationsPromise = undefined;
	}

	get(force?) {
		let self = this;
		let rtn = undefined;

		let user = this._userService.getCurrentUser()

		if (this.notifications === undefined || force) {
			this.notifications = null;
			rtn = new Promise((resolve, reject) => {
				let url = environment.apiUrl + "/api/user/" + user["id"] + "/notifications"
				this._apiService.get(url).subscribe(
					(notificationsObj) => { 
						this.notifications = JSON.parse(notificationsObj["_body"]);
						
						this.notifications.map((obj) => { 
							var d = new Date();
							var nowSeconds = Math.round(d.getTime() / 1000);
							var thenSeconds = Math.round(obj["timestamp"] / 1000);
							var diff = nowSeconds - thenSeconds;

							obj["howLongAgo"] = self.getHowLongAgo(diff);
						})

						resolve(this.notifications);
					 });
			});

			self.notificationsPromise = rtn;
		} else {
			rtn = self.notificationsPromise;
		};

		return rtn;
	}

	getHowLongAgo(seconds) {
		if (seconds < 60)
			return "Just Now";
		else if (seconds < 90)
			return "Just a minute ago..";
		else if (seconds < 300)
			return "A few minutes ago..";
		else if (seconds < 3600)
			return "Within the last hour..";
		else if (seconds < (3600 * 3))
			return "Within the last three hours..";
		else if (seconds < (3600 * 9))
			return "Within the last nine hours..";
		else if (seconds < (3600 * 15))
			return "Within the last fifteen hours..";
		else if (seconds < (3600 * 24))
			return "Within the last day..";
		else if (seconds < (3600 * 24 * 3))
			return "Within the last three days..";
		else if (seconds < (3600 * 24 * 7))
			return "Within the last week..";
		else
			return "Over a week ago";
	}

	delete(notification) {
		return new Promise((resolve, reject) => {
			let url = environment.apiUrl + "/api/notifications/" + notification["id"];
			this._apiService.delete(url).subscribe(() => { 
					resolve();
			});
		});
	}

	deleteAll() {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/notifications/all";

			this._apiService.delete(url).subscribe(() => { 
					resolve();
			});
		})
	}

}
