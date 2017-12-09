import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

import { Constants } from '../../../_constants/constants'

@Component({
  selector: 'requests-incoming-view',
  templateUrl: 'requests-incoming.html'
})

export class RequestsIncomingView {

	model = undefined;
	dirty = false;
	theOtherUser = undefined;
	
	constructor(public navCtrl: NavController,
				private _requestsService: RequestsService,
				private _constants: Constants,
				_events: Events) {
		
		let func = (data) => {
			this.replaceModelElement(data["request"]);
		};

		_events.subscribe('request:received', func);
		_events.subscribe('request:cancelled', func);
		_events.subscribe('request:completedAndApproved', func);
		_events.subscribe('request:isInDispute', func);
		_events.subscribe('request:inamicablyResolved', func);

		_events.subscribe('prm:deletedByCurrentUser', () => { 
			this.ngOnInit();
		});
	}

	getDirection() { return "incoming"; }

	replaceModelElement(request) {
		let temp = this.model.filter((obj) => { return obj["id"] !== request["id"]; });
		temp.push(request);
		this.model = temp;
	}

	ngOnInit() {
		var self = this;
		this._requestsService.getIncomingRequestsForCurrentUser().then((data: Array<Object>) => {
			self.model = data;
			self.dirty = false;
		});
	};

	isRequestModelEmpty() {
		let rtn = this.model === undefined || this.model.length === 0;

		let len = 0;
		if (!rtn) {
			len = this.model.length;
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_CANCELLED && obj["requestingStatusId"] === null;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_COMPLETED;
					});
			len -= this.getNumberOfMatchingElements((obj) => { 
						return obj["deliveringStatusId"] === this._constants.REQUEST_STATUS_RESOLVED_BUT_DISPUTED && obj["requestingStatusId"] === this._constants.REQUEST_STATUS_NOT_COMPLETED;
					});

			rtn = len <= 0;
		}

		return rtn;
	}

	getAcceptedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_ACCEPTED);
	}

	getDeclinedRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_DECLINED);
	}

	getPendingRequests() {
		return this.filterModelByDeliveringStatus(this._constants.REQUEST_STATUS_PENDING);
	}

	getCompletedPendingApprovalRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] !== self._constants.REQUEST_STATUS_NOT_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	getDisputedCompletedRequests() {
		let self = this;

		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === self._constants.REQUEST_STATUS_COMPLETED && obj["requestingStatusId"] === self._constants.REQUEST_STATUS_NOT_COMPLETED; });
			return rtn.length > 0 ? rtn : undefined			
		}

		return undefined;
	}

	filterModelByDeliveringStatus(status) {
		if (this.model) {
			let rtn = this.model.filter((obj) => { return obj["deliveringStatusId"] === status; });
			return rtn.length > 0 ? rtn : undefined
		}
		else
			return undefined;
	}

	getNumberOfMatchingElements(func) {
		if (this.model === undefined)
			return 0;

		let count = 0;
		this.model.map((obj) => { if (func(obj)) count++; });

		return count;
	}

}