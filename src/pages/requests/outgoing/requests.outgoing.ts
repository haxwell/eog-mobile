import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

@Component({
  selector: 'page-requests-outgoing',
  templateUrl: 'requests.outgoing.html'
})

export class RequestsOutgoingPage {

	model = undefined;
	
	constructor(public navCtrl: NavController, private _requestsService: RequestsService) {

	}

	ngOnInit() {
		var self = this;
		this._requestsService.getModelForOutgoing().then((data) => {
			self.model = data;
		});
	}
}
