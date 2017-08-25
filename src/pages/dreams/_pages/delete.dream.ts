import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { DreamService } 	from '../../../app/_services/dream.service';
import { RequestsService } 	from '../../../app/_services/requests.service';

@Component({
  selector: 'page-dream-detail-delete',
  templateUrl: 'delete.dream.html'
})
export class DeleteDreamPage {

	REQUEST_STATUS_DECLINED = 2;	
	REQUEST_STATUS_ACCEPTED = 3;
	REQUEST_STATUS_COMPLETED = 4;
	REQUEST_STATUS_CANCELLED = 5;	
	REQUEST_STATUS_NOT_COMPLETED = 6;		

	dream = undefined;
	dreamRequests = undefined;
	dreamRequestsInProgress = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _dreamService: DreamService,
				private _requestsService: RequestsService) {
		this.dream = params.get('dream');
	}

	ngOnInit() {
		let self = this;

		this._requestsService.getModelForOutgoing().then((model: Array<Object>) => {
			self.dreamRequests = model.filter((obj) => {
				return obj["dream"]["id"] === self.dream["id"]; });

			self.dreamRequestsInProgress = self.dreamRequests.filter((obj) => { 
				return obj["deliveringStatusId"] === self.REQUEST_STATUS_ACCEPTED; });
		});
	}

	getDreamRequests() {
		return this.dreamRequests;
	}

	getDreamRequestsInProgress() {
		return this.dreamRequestsInProgress;
	}

	isDreamAttachedToARequest() {
		return this.dreamRequests && this.dreamRequests.length > 0;
	}

	isDreamAttachedToAnInProgressRequest() {
		return this.dreamRequestsInProgress && this.dreamRequestsInProgress.length > 0;
	}

	isDeleteBtnEnabled() {
		return !this.isDreamAttachedToAnInProgressRequest();
	}

	onDeleteBtnTap(evt) {
		this._dreamService.delete(this.dream).then(() => {
			this.viewCtrl.dismiss(true);
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}
