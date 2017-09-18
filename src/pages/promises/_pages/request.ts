import { Component } from '@angular/core';

import { NavController, NavParams, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../app/_services/requests.service';
import { DreamService } 	from '../../../app/_services/dream.service'
import { UserService } 		from '../../../app/_services/user.service'

@Component({
  selector: 'page-search-request',
  templateUrl: 'request.html'
})
export class RequestPage {

	prm = undefined;
	dreams = undefined;
	callback = undefined;
	selectedDreamId: string = undefined;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _dreamService: DreamService,
				private _userService: UserService) {
		this.prm = params.get('prm');
		this.callback = params.get('callback') || undefined;
	}

	ngOnInit() {
		this._dreamService.getDreamsForCurrentUser().then((data) => {
			this.dreams = data;
		})
	}

	requiredUserRecommendationsAsUserObjects = undefined;
	getRequiredUserRecommendations() {
		if (this.requiredUserRecommendationsAsUserObjects === undefined) {
			this.requiredUserRecommendationsAsUserObjects = null;
			this.initRequiredUserRecommendationsAsUserObjects();
		}

		return this.requiredUserRecommendationsAsUserObjects;
	}

	initRequiredUserRecommendationsAsUserObjects() {
		let self = this;
		self.prm["requiredUserRecommendations"].map((obj) => {
			self._userService.getUser(obj["requiredRecommendUserId"]).then((user) => {
				if (self.requiredUserRecommendationsAsUserObjects === null) 
					self.requiredUserRecommendationsAsUserObjects = [];

				self.requiredUserRecommendationsAsUserObjects.push(user);
			})
		})
	}

	isSaveBtnEnabled() {
		return this.selectedDreamId != undefined;
	}

	onSaveBtnTap(evt) {
		let dream = this.dreams.find((obj) => { return obj.id === this.selectedDreamId});
		this._requestsService.saveNew(dream, this.prm).then((data) => {
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
