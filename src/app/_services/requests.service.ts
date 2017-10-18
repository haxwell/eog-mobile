import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { DeclineReasonCodeService } from './declined-reason-codes.service';

import { environment } from '../../_environments/environment';

import { Constants } from '../../_constants/constants'

@Injectable()
export class RequestsService {
	
	archivedUserRequestsForPrmPromiseCache = {};

	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _declineReasonCodeService: DeclineReasonCodeService,
				private _constants: Constants,
				private _events: Events) {


	}

	saveNew(dream, prm) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/requests";

			let data =	"requestingUserId=" + user["id"] + "&requestedPromiseId=" + prm["id"] + 
						"&requestingDreamId=" + dream["id"];
			
			this._apiService.post(url, data).subscribe((obj) => {
				let model = JSON.parse(obj["_body"]);
				this._events.publish('request:saved', {request: model});
				resolve(model);
			});
		});
	}

	getArchivedUserRequestsForPrm(prm) {

		if (this.archivedUserRequestsForPrmPromiseCache[prm["id"]] === undefined) {
			this.archivedUserRequestsForPrmPromiseCache[prm["id"]] = null;
			this.initArchivedUserRequestsForPrmPromiseCache(prm); 
		}

		return this.archivedUserRequestsForPrmPromiseCache[prm["id"]];
	}

	initArchivedUserRequestsForPrmPromiseCache(prm) {
		let self = this;
		self.archivedUserRequestsForPrmPromiseCache[prm["id"]] = new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/promises/" + prm["id"] + "/archived";

			this._apiService.get(url).subscribe((obj) => {
				let model = JSON.parse(obj["_body"]);
				resolve(model);
			});
		});
	}

	getModel(direction) {
		let self = this;
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;
			
			self._apiService.get(url).subscribe((obj) => {
				let arr = JSON.parse(obj["_body"]);

				arr.forEach((request) => { 
					self.changePromiseAttributeToPrm(request); 
				});

				self._declineReasonCodeService.getDeclineReasonCodes().then((drcs: Array<Object>) => {
					arr.map((req) => { 
						if (req["declinedReasonCode"] === null) {
							req["declinedReasonCode"] = {id: undefined, text: undefined};
						} else {
							let drc = drcs.find((obj) => { return obj["id"] === req["declinedReasonCode"] });
							req["declinedReasonCode"] = {id: drc["id"], text: drc["text"]};
						}
					});

					resolve(arr);
				});
			});
		})

	}

	// hack
	changePromiseAttributeToPrm(request) {
		request["prm"] = Object.assign({}, request["promise"]);
		delete request["promise"];					

		return request;
	}

	getIncomingRequestsForCurrentUser() {
		return (this.getModel(this._constants.INCOMING));
	}

	getOutgoingRequestsForCurrentUser() {
		return (this.getModel(this._constants.OUTGOING));
	}

	setRequestStatusByUserIdAndDirection(request, status, direction) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			
			// TODO: How can this operation be made more secure?
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;

			let data =	"requestId=" + request["id"] + "&newStatus=" + status + "&requestAgainDelayCode=" + request["requestAgainDelayCode"] + "&declinedReasonCode=" + request["declinedReasonCode"];
			
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