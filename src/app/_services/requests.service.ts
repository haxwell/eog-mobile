import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

@Injectable()
export class RequestsService {
	
	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	

	INCOMING = "incoming";
	OUTGOING = "outgoing";

	// TODO: Refactor incoming/outgoing into one method
	incomingPromise = undefined;
	outgoingPromise = undefined;

	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getModelForIncoming() {

		let self = this;
		
		self.incomingPromise = new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/incoming";
			
			this._apiService.get(url).subscribe((incomingObj) => {
				resolve(JSON.parse(incomingObj["_body"]));
			});
		})

		return self.incomingPromise;
	}

	getModelForOutgoing() {

		let self = this;
		
		self.outgoingPromise = new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/outgoing";
			
			this._apiService.get(url).subscribe((outgoingObj) => {
				let model = JSON.parse(outgoingObj["_body"]);

				model.map((obj) => {
					let url = environment.apiUrl + "/api/users/" + obj["thing"]["userId"];
					this._apiService.get(url).subscribe((userObj) => {
						obj["thingUser"] = JSON.parse(userObj["_body"]);

						if (model.every((x) => { return x.hasOwnProperty("thingUser"); })) {
							resolve(model);
						}
					});
				});
			});
		})

		return self.outgoingPromise;
	}

	saveNew(dream, thing) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/requests";

			let data =	"requestingUserId=" + user["id"] + "&requestedThingId=" + thing["id"] + 
						"&requestingDreamId=" + dream["id"];
			
			this._apiService.post(url, data).subscribe((obj) => {
				let model = JSON.parse(obj["_body"]);
				resolve(model);
			});
		});
	}

	foo(request, status, direction) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			
			// TODO: How can this operation be made more secure?
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;

			let data =	"requestId=" + request["id"] + "&newStatus=" + status;
			
			this._apiService.post(url, data).subscribe((obj) => {
				let model = JSON.parse(obj["_body"]);
				resolve(model);
			});
		});
	}

	declineIncomingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_DECLINED, this.INCOMING);
	}

	acceptIncomingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_ACCEPTED, this.INCOMING);
	}

	acceptOutgoingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_ACCEPTED, this.OUTGOING);
	}

	cancelOutgoingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_CANCELLED, this.OUTGOING);
	}

	cancelIncomingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_CANCELLED, this.INCOMING);
	}

	completeIncomingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_COMPLETED, this.INCOMING);
	}

	completeOutgoingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_COMPLETED, this.OUTGOING);
	}
}