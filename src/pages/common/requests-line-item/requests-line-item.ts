import { Component, Input } from '@angular/core';
import { ModalController, NavParams } from 'ionic-angular';

@Component({
  selector: 'requests-line-item',
  templateUrl: 'requests-line-item.html'
})

export class RequestsLineItem {

	@Input() request = undefined;

	constructor(navParams: NavParams, 
				private modalCtrl: ModalController) {
		this.request = navParams.get('request') || undefined;
	}

	ngOnInit() {

	}

	ionViewWillEnter() {

	}
}