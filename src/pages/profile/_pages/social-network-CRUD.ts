import { Component } from '@angular/core';

import { ViewController, NavParams } from 'ionic-angular';

//
// I think this can be deleted, considering the update to profile editing and such.
//

@Component({
  selector: 'page-social-network-crud',
  templateUrl: 'social-network-CRUD.html'
})
export class SocialNetworkCRUDPage {

	name = undefined;
	value = undefined;
	originalValue = undefined;
	dirty = false;
	readOnly = false;

	constructor(private viewCtrl: ViewController,
				navParams: NavParams) {
		this.name = navParams.get('name');
		this.value = navParams.get('value');
		this.readOnly = navParams.get('readOnly');

		this.originalValue = this.value;
	}

	isDirty() {
		return this.dirty === true;
	}

	isReadOnly() {
		return this.readOnly;
	}

	setDirty(b) {
		this.dirty = b;
	}

	getValue() {
		return this.value; 
	}

	onValueChange(evt) {
		this.value = evt._value;
	}

	onCancelBtnTap(evt) {
		this.viewCtrl.dismiss(this.originalValue);	
	}

	isSaveBtnEnabled() {
		return this.value != undefined && this.value.length > 1;
	}

	onSaveBtnTap(evt) {
		this.viewCtrl.dismiss(this.value);
	}

	getImageSrc() {
		return "assets/img/" + this.name + "-logo-active.png";
	}
}
