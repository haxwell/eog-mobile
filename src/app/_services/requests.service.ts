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
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	INCOMING = "incoming";
	OUTGOING = "outgoing";

	constructor(private _apiService: ApiService, private _userService: UserService) { }

	getModel(direction) {

		let self = this;
		
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;
			
			this._apiService.get(url).subscribe((obj) => {
				resolve(JSON.parse(obj["_body"]));
			});
		})

	}

	getModelForIncoming() {
		return (this.getModel(this.INCOMING));
	}

	getModelForOutgoing() {
		return (this.getModel(this.OUTGOING));
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
				let model = undefined;
				
				if (obj["_body"] && obj["_body"].length > 0)
					model = JSON.parse(obj["_body"]);
				
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

	secondCompleteIncomingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_COMPLETED, this.INCOMING);
	}

	completeOutgoingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_COMPLETED, this.OUTGOING);
	}

	notCompleteOutgoingRequest(request) {
		return this.foo(request, this.REQUEST_STATUS_NOT_COMPLETED, this.OUTGOING);
	}
}