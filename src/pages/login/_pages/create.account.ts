import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';

import { UserService } from '../../../app/_services/user.service';

@Component({
  selector: 'page-login-create-account',
  templateUrl: 'create.account.html'
})
export class CreateAccountPage {

	user = {email: '', name: '', password: ''};

	referringUsername = '';

	constructor(public navCtrl: NavController, 
				public params: NavParams,
				private _userService: UserService) {

	}

	isSaveBtnEnabled() {
		return this.user["email"].length > 3 && this.user["name"].length > 2 && this.user["password"].length > 5;
	}

	onSaveBtnTap(evt) {
		if (this.referringUsername !== undefined && this.referringUsername.length > 0)
			this.user["referringUsername"] = this.referringUsername;
		else
			delete this.user["referringUsername"];

		this._userService.save(this.user).then((data) => {
			this.navCtrl.pop();
		});
	}

	onCancelBtnTap(evt) {
		this.navCtrl.pop();
	}
}
