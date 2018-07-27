import { Component } from '@angular/core';
import { NavController, ModalController, NavParams, AlertController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ProfileService } from '../../pages/common/_services/profile.service'
import { UserMetadataService } from '../../app/_services/user-metadata.service'
import { RecommendationService } from '../../app/_services/recommendation.service'
import { PointsService } from '../../app/_services/points.service'
import { PictureService } from '../../app/_services/picture.service'
import { UserService } from '../../app/_services/user.service'
import { ContactInfoVisibilityService } from './_services/contact-info-visibility.service'

import { ProfileEditPage } from './profile-edit'

import { Constants } from '../../_constants/constants'

import EXIF from 'exif-js';
import Moment from 'moment';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

	model = {};
	user = undefined;
	dirty = true;
	isExiting = false;

	_currentUserCanSendRecommendationToProfileUser = undefined;
	_currentUserCanSendPointToProfileUser = undefined;

	imageOrientation = undefined;

	contactInfoVisibilityId = undefined;

	constructor(public navCtrl: NavController,
				navParams: NavParams, 
				public modalCtrl: ModalController,
				private _alertCtrl: AlertController,
				private _userService: UserService,
				private _profileService: ProfileService,
				private _userMetadataService: UserMetadataService,
				private _recommendationService: RecommendationService,
				private _pointsService: PointsService,
				private _pictureService: PictureService,
				private _contactInfoVisibilityService: ContactInfoVisibilityService,
				private _events: Events,
				private _constants: Constants) {

		this.user = Object.assign({}, navParams.get('user'));

		this._userMetadataService.init();

		this._events.subscribe('profile:changedContactInfoWasSaved', (savedModel) => {
			this.model = savedModel;
		})

		this._events.subscribe('request:accepted', (data) => {
			if (data["request"]["directionallyOppositeUser"]["id"] === this.user["id"])
				this.ngOnInit();
		})
	}

	ngOnInit() {
		this._profileService.init(this.user["id"]);
		this.model = this._profileService.getModel(this.user["id"]);

		this.setCurrentUserCanSendPointToProfileUser();
		this.setCurrentUserCanSendRecommendationToProfileUser();

		let self = this;
		this._contactInfoVisibilityService.getContactInfoVisibilityId(this.user["id"]).then((visId: number) => {
			self.contactInfoVisibilityId = visId;
		})
	}

	ionViewWillEnter() {
		this.ngOnInit();
	}

	isCurrentUsersProfile() {
		return this._userService.getCurrentUser()["id"] === this.user["id"];
	}

	isCurrentUserAllowedToSeeEmailInfo() {
		return this._profileService.getModel(this.user["id"])["currentUserCanSeeEmailInfo"];
	}

	isCurrentUserAllowedToSeePhoneInfo() {
		return this._profileService.getModel(this.user["id"])["currentUserCanSeePhoneInfo"];
	}

	onSendRecommendationBtnTap() {
		let self = this;
		self._recommendationService.sendARecommendationToAUser(this.user["id"]).then((data) => {
			self.setCurrentUserCanSendRecommendationToProfileUser();
		})
	}

	onSendPointBtnTap() {
		let self = this;
		self._pointsService.sendAPointToAUser(this.user["id"]).then((data) => {
			self.setCurrentUserCanSendPointToProfileUser();
		});
	}

	isSendRecommendBtnAvailable() {
		return this._currentUserCanSendRecommendationToProfileUser;
	}

	isSendPointBtnAvailable() {
		return this._currentUserCanSendPointToProfileUser;
	}

	getSocialMediaURL(name) {
		return this._profileService.getModel(this.user["id"])[name+"Url"] || "";
	}

	onEditProfileBtnClick() {
      this.navCtrl.push(ProfileEditPage, {user: this.user}); // TODO: Is it enough just to pass the ID?
	}

	setCurrentUserCanSendPointToProfileUser() {
		this._userMetadataService.getMetadataValue(this.user, this._constants.FUNCTION_KEY_CAN_SEND_POINT_TO_USER).then((bool) => {
			this._currentUserCanSendPointToProfileUser = bool;
		})
	}

	setCurrentUserCanSendRecommendationToProfileUser() {
		this._userMetadataService.getMetadataValue(this.user, this._constants.FUNCTION_KEY_CAN_SEND_RECOMMENDATION_TO_USER).then((bool) => {
			this._currentUserCanSendRecommendationToProfileUser = bool;
		})
	}

	getModelAttr(key) {
		let model = this._profileService.getModel(this.user["id"]) || {};
		return model[key];
	}

	isFromGallery() {
		return this._profileService.getModel(this.user["id"])["imageFileSource"] == 'gallery';
	}

	isThumbnailImageAvailable() {
		return this._profileService.getModel(this.user["id"])["imageFileURI"] !== undefined;
	}

	isThumbnailImageVisible() {
		return this.imageOrientation !== undefined;
	}

	getThumbnailImage() {
		if (this._profileService.getModel(this.user["id"])["imageFileURI"] === undefined)
			return "assets/img/mushroom.jpg";
		else
			return this._profileService.getModel(this.user["id"])["imageFileURI"];
	}

	onGoBackBtnTap(evt) {
		this.navCtrl.pop();
	}

	getAvatarCSSClassString() {
		return this._pictureService.getOrientationCSS(this);
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}

	getAllTimePointCount() {
		let val = this._profileService.getModel(this.user["id"])["allTimePointCount"];
		if (val === undefined) 
			return 0;
		else
			return val;
	}

	getSuccessfulRequestPercentageAsString() {
		
		let drc = this._profileService.getModel(this.user["id"])["disputedRequestCount"];
		let rc = this._profileService.getModel(this.user["id"])["requestCount"];

		if (drc === undefined || rc === undefined || rc === 0)
			return "--";
		else if (drc === 0)
			return "100%";
		else
			return "" + (100 - ((drc / rc) * 100)) + "%";
	}

	getHowLongAgoForMostRecentDisputedRequest() {
		let val = this._profileService.getModel(this.user["id"])["mostRecentDisputedRequestTimestamp"]
		if (val === undefined)
			return "None!";
		else
			return Moment(val).fromNow();
	}

	getContactInfoVisibilityDisplayString() {
		let self = this;
		let visObj = self._contactInfoVisibilityService.getContactInfoVisibilityChoices().find(
			(obj) => { return obj["id"] === self.contactInfoVisibilityId; });

		if (visObj)
			return visObj["text"];
	}

	onChangePasswordBtnClick(event) {
	    let self = this;
	    let cpwAlert = self._alertCtrl.create({
	            title: '',
	            subTitle: "Enter your current password...",
		        inputs: [{
		        	name: 'currentPassword',
		        	placeholder: '..current password..'
		        }],
	            buttons: [{
	            	text: "Cancel",
	            	role: 'cancel'
	            }, {
	            	text: 'OK',
	             	handler: (data) => {
	                	let cu = this._userService.getCurrentUser();
	                	if (cu["password"] == data.currentPassword)
	                		this.onChangePasswordBtnClick2(data.currentPassword);
	                	else {
				         	let okAlert = self._alertCtrl.create({
				                	title: 'Sad face..',
				                	subTitle: "Incorrect password",
				                	buttons: [{
				                    	text: 'OK',
				                    	handler: () => { }
				                  	}]
				                })

				        	okAlert.present();
				        }
	            	}
	            }]
	        })

	    cpwAlert.present();
	}

	onChangePasswordBtnClick2(currentPassword) {
		let self = this;
          let pwAlert = self._alertCtrl.create({
            title: "Enter Your New Password",
            inputs: [{
              name: 'pw1',
              placeholder: '..new password..'
            }, {
              name: 'pw2',
              placeholder: '..verify password..'
            }],
            buttons: [{
              text: 'Cancel',
              role: 'cancel'
            }, {
				text: 'OK',
            	handler: (data2) => {
                	if (data2.pw1 && data2.pw1.length > 5 && data2.pw1 == data2.pw2) {
	                  		let cu = self._userService.getCurrentUser();

	                  		self._userService.changeCurrentPassword(currentPassword, data2.pw2).then((response) => {

			                if (response) {
			                    let done = self._alertCtrl.create({
			                      title: 'Yay!',
			                      message: "Your password has been changed.",
			                      buttons: [{
			                        text: 'OK',
			                        handler: () => {
		                        		cu["password"] = data2.pw2;
		                        		self._events.publish("app:currentUserPasswordChanged", cu)
			                        }
			                      }]
			                    })
			                    
			                    done.present();
			                } else {
			                    let done = self._alertCtrl.create({
			                      title: 'Hmmm...!',
			                      message: "Could not change your password... Try again.",
			                      buttons: [{
			                        text: 'OK',
			                        handler: () => {

			                        }
			                      }]
			                    })
			                    
			                    done.present();
			                }

	                    }, (err) => {
	                      
	                      let errr = self._alertCtrl.create({
	                        title: 'Arggh!',
	                        message: "Something bad happened on the server. We hate when that happens. Please email us at info@easyah.io and let us know.",
	                        buttons: [{
	                          text: 'OK',
	                          handler: () => {
	                            
	                          }
	                        }]
	                      })
	                      
	                      errr.present();
	                    })
	                } else {
	                	return false; // pw data is invalid.. don't let the OK button be active
	                }
            	}
            }]
        })

        pwAlert.present();
	}

}
