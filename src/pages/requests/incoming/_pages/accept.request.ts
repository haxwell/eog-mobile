import { Component } from '@angular/core';

import { NavController, NavParams, ModalController, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../../app/_services/requests.service';
import { UserPreferencesService } 	from '../../../../app/_services/user-preferences.service';

import { AcceptRequestTutorialPage } from './accept.request.tutorial';

@Component({
  selector: 'page-requests-incoming-accept',
  templateUrl: 'accept.request.html'
})
export class AcceptRequestPage {

	request = undefined;
	showTutorialAfterRequestAccepted = true;
	
	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private viewCtrl: ViewController, 
				private _modalCtrl: ModalController,
				private _requestsService: RequestsService,
				private _userPreferencesService: UserPreferencesService) {
		this.request = params.get('request');
	}

	ngOnInit() {
		var self = this;
		self._userPreferencesService.getPreference("showTutorialAfterRequestAccepted", true).then((data) => {
			self.showTutorialAfterRequestAccepted = data["pref"];
		})
	}

	onSaveBtnTap(evt) {
		var self = this;
		self._requestsService.acceptIncomingRequest(self.request).then((obj) => {
			console.log(obj);

			if (self.showTutorialAfterRequestAccepted) {
				let modal = self._modalCtrl.create(AcceptRequestTutorialPage, { });
                  
                modal.onDidDismiss((data) => { 
					self.viewCtrl.dismiss();
				});

				modal.present();			
			} else {
				self.viewCtrl.dismiss();
			}
		})
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}

}
