import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import { NavController, ViewController } from 'ionic-angular';

import { RequestsService } 	from '../../../app/_services/requests.service';
import { DreamService } 	from '../../../app/_services/dream.service'

@Component({
  selector: 'page-search-request',
  templateUrl: 'request.html'
})
export class RequestPage {

	dreams = undefined;
	selectedDream: string = "";
	
	constructor(public navCtrl: NavController, 
				private viewCtrl: ViewController, 
				private _requestsService: RequestsService,
				private _dreamService: DreamService) {

	}

	ngOnInit() {
		this._dreamService.getDreamsForCurrentUser().then((data) => {
			this.dreams = data;
		})
	}

	isSaveBtnEnabled() {
		return true;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss({ });
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss();
	}
}
