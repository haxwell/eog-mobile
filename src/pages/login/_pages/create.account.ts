import { Component } from '@angular/core';

import { LoadingController } from 'ionic-angular';
import { NavController, NavParams, ModalController, AlertController } from 'ionic-angular';

import { UserService } from '../../../app/_services/user.service';

import { NewAccountTutorialPage } from './new-account-tutorial-page'

@Component({
  selector: 'page-login-create-account',
  templateUrl: 'create.account.html'
})
export class CreateAccountPage {

	user = {realname: '', email: '', name: '', password: '', phone: ''};
	loading = undefined;

	referringUsername = '';
	codeAlreadySent = false;

	constructor(public navCtrl: NavController, 
				private _alertCtrl: AlertController,
				private _modalCtrl: ModalController,
				private _loadingCtrl: LoadingController,
				public params: NavParams,
				private _userService: UserService) {

	}

	ngOnInit() {

	}

	ionViewWillEnter() {
        let self = this;

        let modal = self._modalCtrl.create(NewAccountTutorialPage, { });
      
        modal.present();
    }

	setChangedAttr(key, value) {
		this.user[key] = value;
	}

	onRealNameChange(event) {
		this.setChangedAttr("realname", event._value);
	}

	onNameChange(event) {
		this.setChangedAttr("name", event._value);
	}

	onEmailChange(event) {
		this.setChangedAttr("email", event._value);
	}

	onPhoneChange(event) {
		this.setChangedAttr("phone", event._value);	
	}

	onPasswordChange(event) {
		this.setChangedAttr("password", event._value);	
	}

	onReferringUsernameChange(event) {
		this.referringUsername = event._value;
	}

	getReferringUsername() {
		return this.referringUsername;
	}

	getModelAttr(key) {
		return this.user[key];
	}

	isValidEmail(email) {
    	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    	return re.test(email);
	}

	isSaveBtnEnabled() {
		return 	this.user["email"].length > 5 && 
				this.user["realname"].length > 2 && 
				this.user["name"].length > 2 && 
				this.user["password"].length > 5 &&
				this.user["phone"].length === 10 &&
				this.isValidEmail(this.user["email"]);
	}

	onOKBtnTap(evt) {
		let self = this;

		if (this.user["name"].lastIndexOf(' ') > -1) {
			let alert = this._alertCtrl.create({
				title: 'Doh!',
				message: "Usernames cannot have spaces in them.",
				buttons: [
					{
						text: 'OK', role: 'cancel', handler: () => {
							// do nothing
						}
					}
				]
			})

			alert.present();
			return;			
		}

		self._userService.isUserInformationUnique(self.user).then((userInfo) => {
			if (userInfo == true) {
				if (!self.codeAlreadySent) {
					let alert = this._alertCtrl.create({
						title: 'Ready for a text?',
						message: "We're gonna send a text to your phone at " + self.user["phone"] + ". Okay?",
						buttons: [
							{
								text: 'No', role: 'cancel', handler: () => {
									// do nothing
								},
							}, {
								text: 'Yes', handler: () => {
			           				self._userService.sendCodeToPhoneNumber(self.user["phone"]);
				            		self.codeAlreadySent = true;
				            		self.onOKBtnTap2(evt);
				            	}
				            }]
				        });

			        alert.present();
				} else {
					self.onOKBtnTap2(evt);
				}
			} else {
				let alert = this._alertCtrl.create({
					title: 'Doh!',
					message: "Sorry, that " + userInfo + " is already taken :(",
					buttons: [
						{
							text: 'OK', role: 'cancel', handler: () => {
								// do nothing
							}
						}
					]
				})

				alert.present();
			}
		})
	}


	onOKBtnTap2(evt) {
		let self = this;

        let alert = self._alertCtrl.create({
	      title: "What's in the text?",
	      inputs: [{
	      	name: 'code',
	      	placeholder: '..code from text msg..',
	      	type: 'number'
	      }],
	      buttons: [{
	        text: 'Cancel',
	        role: 'cancel'
	      }, {
	      	text: 'Send Txt Again',
	      	handler: () => {
				self._userService.sendCodeToPhoneNumber(self.user["phone"]);
				self.codeAlreadySent = true;
	      	}
	      }, {
	        text: 'Got it!',
	        handler: (data) => {
	            if (data.code !== undefined && data.code.length > 0) {
	            	self.loading = self._loadingCtrl.create({
	            		content: 'Please wait...'
	            	});

	            	self.loading.present();

	            	self._userService.isAValidSMSChallengeCode(self.user["phone"], data.code).then((b) => {
	            		if (b) {
							if (self.referringUsername !== undefined && self.referringUsername.length > 0)
								self.user["referringUsername"] = self.referringUsername;
							else
								delete self.user["referringUsername"];

							self._userService.save(self.user, data.code).then(() => {

								let okAlert = self._alertCtrl.create({
		            				title: 'Alright!',
		            				message: "Account Created.<br/>user: " + self.user["name"] + "<br/>pw: ..." + self.user["password"].substring(self.user["password"].length - 5) + "<br/><br/>Click OK to sign in.",
		            				buttons: [{
		            					text: 'OK',
		            					handler: () => {
											self.codeAlreadySent = false;
											self.loading.dismiss();
											self.navCtrl.pop();
		            					}
		            				}]
		            			})

		            			okAlert.present();
							});
	            		} else {
	            			let err = self._alertCtrl.create({
	            				title: 'Aargh...',
	            				message: "That wasn't a valid code.......",
	            				buttons: [{
	            					text: 'Grr.',
	            					handler: () => {
	            						self.loading.dismiss();
	            					}
	            				}]
	            			})
	            			
	            			err.present();
	            		}
	            	})
	            }
	        }
	      }]
        });
        
        alert.present();

	}

	onCancelBtnTap(evt) {
		this.navCtrl.pop();
	}
}
