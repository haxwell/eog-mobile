import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ProfileService } from '../../pages/common/_services/profile.service'
import { UserMetadataService } from '../../app/_services/user-metadata.service'
import { RecommendationService } from '../../app/_services/recommendation.service'
import { PointsService } from '../../app/_services/points.service'
import { UserService } from '../../app/_services/user.service'

import { ProfileEditPage } from './profile-edit'

import { Constants } from '../../_constants/constants'

import EXIF from 'exif-js';

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

	constructor(public navCtrl: NavController,
				navParams: NavParams, 
				public modalCtrl: ModalController,
				private _userService: UserService,
				private _profileService: ProfileService,
				private _userMetadataService: UserMetadataService,
				private _recommendationService: RecommendationService,
				private _pointsService: PointsService,
				private _events: Events,
				private _constants: Constants) {

		this.user = Object.assign({}, navParams.get('user'));

		this._userMetadataService.init();

		this._events.subscribe('profile:changedContactInfoWasSaved', (savedModel) => {
			this.model = savedModel;
		})
	}

	ngOnInit() {
		this._profileService.init(this.user);
		this.model = this._profileService.getModel(this.user);

		this.setCurrentUserCanSendPointToProfileUser();
		this.setCurrentUserCanSendRecommendationToProfileUser();
	}

	ionViewWillEnter() {
		this.ngOnInit();
	}

	isCurrentUsersProfile() {
		return this._userService.getCurrentUser()["id"] === this.user["id"];
	}

	isCurrentUserAllowedToSeeContactInfo() {
		return this._profileService.getModel(this.user)["currentUserCanSeeContactInfo"];
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
		return this._profileService.getModel(this.user)[name+"Url"] || "";
	}

	onEditProfileBtnClick() {
      this.navCtrl.push(ProfileEditPage, {user: this.user});
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
		let model = this._profileService.getModel(this.user) || {};
		return model[key];
	}

	isFromGallery() {
		return this._profileService.getModel(this.user)["imageFileSource"] == 'gallery';
	}

	isThumbnailImageAvailable() {
		return this._profileService.getModel(this.user)["imageFileURI"] !== undefined;
	}

	isThumbnailImageVisible() {
		return this.imageOrientation !== undefined;
	}

	getThumbnailImage() {
		if (this._profileService.getModel(this.user)["imageFileURI"] === undefined)
			return "assets/img/mushroom.jpg";
		else
			return this._profileService.getModel(this.user)["imageFileURI"];
	}

	onGoBackBtnTap(evt) {
		this.navCtrl.pop();
	}

	getAvatarCSSClassString() {
		if (this.imageOrientation === 8)
			return "rotate90Counterclockwise centered";
		else if (this.imageOrientation === 3)
			return "rotate180 centered";
		else if (this.imageOrientation === 6)
			return "rotate90Clockwise centered";
		else
			return "centered";
	}

	loaded(evt) {
		let self = this;
		EXIF.getData(evt.target, function() {
			self.imageOrientation = EXIF.getTag(this, "Orientation");
		});
	}
}
