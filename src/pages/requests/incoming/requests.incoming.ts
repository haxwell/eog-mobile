import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { NavController } from 'ionic-angular';

import { RequestsService } from '../../../app/_services/requests.service'

@Component({
  selector: 'page-requests-incoming',
  templateUrl: 'requests.incoming.html'
})

export class RequestsIncomingPage {

	model = undefined;
	
	constructor(public navCtrl: NavController, private _requestsService: RequestsService) {

	}

	ngOnInit() {
		var self = this;
		this._requestsService.getModelForIncoming().then((data) => {
			self.model = data;
		});
	}
}
