import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../app/_services/requests.service';
import { DreamService } 	from '../../../app/_services/dream.service'

@Component({
  selector: 'page-search-request',
  templateUrl: 'request.html'
})
export class RequestPage {

	thing = undefined;
	dreams = undefined;
	callback = undefined;
	selectedDreamId: string = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _dreamService: DreamService) {
		this.thing = params.get('thing');
		this.callback = params.get('callback') || undefined;
	}

	ngOnInit() {
		this._dreamService.getDreamsForCurrentUser().then((data) => {
			this.dreams = data;
		})
	}

	getRequiredUserRecommendations() {
		if (this.thing["requiredUserRecommendations"].length > 0)
			return this.thing["requiredUserRecommendations"];
		else
			return undefined;
	}

	isSaveBtnEnabled() {
		return this.selectedDreamId != undefined;
	}

	onSaveBtnTap(evt) {
		let dream = this.dreams.find((obj) => { return obj.id === this.selectedDreamId});
		this._requestsService.saveNew(dream, this.thing).then((data) => {
			if (this.callback)
				this.callback(true).then(() => {
					this.viewCtrl.dismiss({ });
				});
		});
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}
