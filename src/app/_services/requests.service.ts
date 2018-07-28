import { Injectable } from '@angular/core';
import { Events } from 'ionic-angular';

import { UserService } from './user.service';
import { ApiService } from './api.service';
import { DeclineReasonCodeService } from './declined-reason-codes.service';
import { PrmModelService } from './prm-model.service';
import { FunctionPromiseService } from './function-promise.service';

import { environment } from '../../_environments/environment';

import { Constants } from '../../_constants/constants'

@Injectable()
export class RequestsService {
	
	archivedUserRequestsForPrmPromiseCache = {};

	isGetModelFuncInitialized = false;

	constructor(private _apiService: ApiService, 
				private _userService: UserService, 
				private _declineReasonCodeService: DeclineReasonCodeService,
				private _prmModelService: PrmModelService,
				private _functionPromiseService: FunctionPromiseService,
				private _constants: Constants,
				private _events: Events) {


	}

	saveNew(prm, requestingMessage) {
		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			let url = environment.apiUrl + "/api/requests";

			if (requestingMessage === undefined)
				requestingMessage = '';

			let data =	"requestingUserId=" + user["id"] + "&requestedPromiseId=" + prm["id"] + "&requestingMessage=" + requestingMessage;
			
			let self = this;
			self._apiService.post(url, data).subscribe((obj) => {
				let model = self.changePromiseAttributeToPrm( JSON.parse(obj["_body"]) );
				self._events.publish('request:saved', {request: model});
				resolve(model);
			}, (err) => {
				reject(err);
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
			}, (err) => {
				reject(err);
			});
		});
	}

	/**
	 * This sets a function in the FunctionPromiseService. When a call to getModel() is made, getModel() calls the FunctionPromiseService,
	 *  which prevents this function from being called several times in a row in a given time period. It does this by allowing one call
	 *  in that time period; the other calls receive cached data.
	 *
	 */
	initGetModelFunc() {

		// This is the GET of request information.

		let self = this;
		self._functionPromiseService.initFunc(self._constants.FUNCTION_KEY_REQUESTS_BY_USER_AND_DIRECTION_GET, (data) => {
			return new Promise((resolve, reject) => {
				let userId = data["userId"];
				let direction = data["direction"];

				let url = environment.apiUrl + "/api/user/" + userId + "/requests/" + direction;
				
				self._apiService.get(url).subscribe((obj) => {
					let arr = JSON.parse(obj["_body"]);

					arr.forEach((request) => { 
						self.changePromiseAttributeToPrm(request); 

						this._prmModelService.setPrmImageOrientation(request.prm);
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
				}, (err) => {
					reject(err);
				});
			})
		});

		self.isGetModelFuncInitialized = true;
	}

	getModel(direction) {
		let self = this;

		if (!self.isGetModelFuncInitialized)
			self.initGetModelFunc();

		let data = {userId: self._userService.getCurrentUser()['id'], direction: direction};
		return self._functionPromiseService.get(data['userId']+direction, self._constants.FUNCTION_KEY_REQUESTS_BY_USER_AND_DIRECTION_GET, data);
	}

	// hack
	changePromiseAttributeToPrm(request) {
		if (request !== undefined) {
			request["prm"] = Object.assign({}, request["promise"]);
			delete request["promise"];					
		}

		return request;
	}

	getIncomingRequestsForCurrentUser() {
		return (this.getModel(this._constants.INCOMING));
	}

	getOutgoingRequestsForCurrentUser() {
		return (this.getModel(this._constants.OUTGOING));
	}

	setRequestStatusByUserIdAndDirection(request, status, direction) {

		// This is the POST of request information.

		return new Promise((resolve, reject) => {
			let user = this._userService.getCurrentUser();
			
			// TODO: How can this operation be made more secure?
			//  - one suggestion, use HTTPS
			let url = environment.apiUrl + "/api/user/" + user["id"] + "/requests/" + direction;

			let data =	"requestId=" + request["id"] + "&newStatus=" + status + "&requestAgainDelayCode=" + request["requestAgainDelayCode"] + "&declinedReasonCode=" + request["declinedReasonCode"];
			
			this._apiService.post(url, data).subscribe((obj) => {
				let model = undefined;
				
				if (obj["_body"] && obj["_body"].length > 0)
					model = JSON.parse(obj["_body"]);

				this._prmModelService.setPrmImageOrientation(model.promise).then((prm) => {
					this._events.publish('request:statusChanged', {request: this.changePromiseAttributeToPrm(model)});
					resolve(model);
				})

			}, (err) => {
				reject(err);
			});
		});
	}

	hideIncomingAndDeclinedRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_DECLINED_AND_HIDDEN, this._constants.INCOMING);	
	}

	acknowledgeDeclinedRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED, this._constants.OUTGOING);
	}

	acknowledgeCancelledRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_REQUESTOR_ACKNOWLEDGED, this._constants.OUTGOING);
	}

	declineIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_DECLINED, this._constants.INCOMING);
	}

	acceptIncomingRequest(request) {
		return this.setRequestStatusByUserIdAndDirection(request, this._constants.REQUEST_STATUS_ACCEPTED, this._constants.INCOMING);
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