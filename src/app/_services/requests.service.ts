import { Injectable } from '@angular/core';

import { UserService } from './user.service';
import { ApiService } from './api.service';

import { environment } from '../../_environments/environment';

import { Constants } from '../../_constants/constants'

@Injectable()
export class RequestsService {
	
	constructor(private _apiService: ApiService, private _userService: UserService, private _constants: Constants) { }

	getModel(direction) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;
			
			this._apiService.get(url).subscribe((obj) => {
				resolve(JSON.parse(obj["_body"]));
			});
		})

	}

	getModelForIncoming() {
		return (this.getModel(this._constants.INCOMING));
	}

	getModelForOutgoing() {
		return (this.getModel(this._constants.OUTGOING));
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

	setRequestStatusByUserIdAndDirection(request, status, direction) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			
			// TODO: How can this operation be made more secure?
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;

			let data =	"requestId=" + request["id"] + "&newStatus=" + status +"&declinedReasonCode=" + request["declinedReasonCode"];
			
			this._apiService.post(url, data).subscribe((obj) => {
				let model = undefined;
				
				if (obj["_body"] && obj["_body"].length > 0)
					model = JSON.parse(obj["_body"]);
				
				resolve(model);
			});
		});
	}

	acknowledgeDeclinedRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED, this._constants.OUTGOING);
	}

	declineIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_DECLINED, this._constants.INCOMING);
	}

	acceptIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_ACCEPTED, this._constants.INCOMING);
	}

	acceptOutgoingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_ACCEPTED, this._constants.OUTGOING);
	}

	cancelOutgoingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_CANCELLED, this._constants.OUTGOING);
	}

	cancelIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_CANCELLED, this._constants.INCOMING);
	}

	completeIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_COMPLETED, this._constants.INCOMING);
	}

	secondCompleteIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_COMPLETED, this._constants.INCOMING);
	}

	completeOutgoingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_COMPLETED, this._constants.OUTGOING);
	}

	notCompleteOutgoingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_NOT_COMPLETED, this._constants.OUTGOING);
	}
}