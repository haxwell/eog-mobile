import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { ProfileService } from '../../pages/common/_services/profile.service'
import { NotificationService } from './_services/notification.service'
import { UserMetadataService } from '../../app/_services/user-metadata.service'
import { RecommendationService } from '../../app/_services/recommendation.service'
import { PointsService } from '../../app/_services/points.service'

import { ProfileHeader } from '../../pages/common/profile-header/profile-header'

import { PrmPage } from '../promises/promises'
import { DreamPage } from '../dreams/dreams'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'

import { Constants } from '../../_constants/constants'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

	model = {};
	user = undefined;
	dirty = true;
	readOnly = false;
	loading = undefined;
	isExiting = false;

	constructor(public navCtrl: NavController,
				navParams: NavParams, 
				public modalCtrl: ModalController,
				private _profileService: ProfileService,
				private _notificationService: NotificationService,
				private _userMetadataService: UserMetadataService,
				private _recommendationService: RecommendationService,
				private _pointsService: PointsService,
				private _events: Events,
				private loadingCtrl: LoadingController,
				private alertCtrl: AlertController,
				private _constants: Constants) {

		this.user = Object.assign({}, navParams.get('user'));
		this.readOnly = navParams.get('readOnly') || false;

		let func = (data) => {
			this.model["notifications"].push({id: -1, message: data["message"], userId: data["request"]["directionallyOppositeUser"]["id"], timestamp: new Date().getTime(), howLongAgo: "Just Now"});
		}

		this._events.subscribe('request:received', func);
		this._events.subscribe('request:accepted', func);
		this._events.subscribe('request:declined', func);
		this._events.subscribe('request:completed', func);
		this._events.subscribe('request:completedAndApproved', func);
		this._events.subscribe('request:cancelled', func);

		let func2 = (data) => {
			this.model["realname"] = data["realname"];
			this.model["phone"] = data["phone"];
			this.model["email"] = data["email"];

			this.setDirty(true);
		};
		this._events.subscribe('profile:changedContactInfo', func2);

		this._userMetadataService.init();
	}

	ngOnInit() {
		if (this.isDirty()) {
			this._profileService.init(this.user);
			this.model = this._profileService.getModel(this.user);
		}

		this.setDirty(false);
	}

	ionViewWillEnter() {
		if (this.isDirty()) 
			this.ngOnInit();
	}

	ionViewCanLeave() {
		if (this.isDirty()) {
			let self = this;

			let alert = this.alertCtrl.create({
				title: 'Save Changes?',
				message: 'Do you want to save your  profile changes?',
				buttons: [
					{
						text: 'No', role: 'cancel', handler: () => {
							// do nothing
						},
					}, {
						text: 'Yes', handler: () => {
							self.onSaveBtnTap();
						},

					}
				]
			});
			self.isExiting = true;
			alert.present();
		}
	}

	isReadOnly() {
		return this.readOnly;
	}

	PrmAndDreamCallback = (_params) => {
		return new Promise((resolve, reject) => {
			this.setDirty(_params === true);
			resolve();
		});
	}

	onNewPromiseBtnTap(evt) {
		this.navCtrl.push(PrmPage, { prm: undefined, callback: this.PrmAndDreamCallback });
	}

	onPromiseBtnTap(item) { 
		if (!this.isReadOnly())
			this.navCtrl.push(PrmPage, { prm: item, callback:  this.PrmAndDreamCallback });
	}

	onNewDreamBtnTap(evt) {
		this.navCtrl.push(DreamPage, { dream: undefined, callback: this.PrmAndDreamCallback });
	}

	onDreamBtnTap(item) { 
		if (!this.isReadOnly())
			this.navCtrl.push(DreamPage, { dream: item, callback: this.PrmAndDreamCallback });
	}

	onSendRecommendationBtnTap() {
		this._recommendationService.sendARecommendationToAUser(this.user["id"]);
	}

	onSendPointBtnTap() {
		this._pointsService.sendAPointToAUser(this.user["id"]);
	}

	isSendRecommendBtnAvailable() {
		return this._userMetadataService.getMetadataValue(this.user, this._constants.FUNCTION_KEY_CAN_SEND_RECOMMENDATION_TO_USER);
	}

	isSendPointBtnAvailable() {
		return this._userMetadataService.getMetadataValue(this.user, this._constants.FUNCTION_KEY_CAN_SEND_POINT_TO_USER);
	}

	onIndividualKeywordPress(item) {
		if (!this.isReadOnly()) {
			this.model["keywords"] = this.model["keywords"].filter((obj) => {
				return obj["text"] !== item["text"];
			});

			this.setDirty(true);
		}
	}

	onAddKeywordBtnTap(evt) {
		if (!this.isReadOnly()) {
			let self = this;
			let modal = this.modalCtrl.create(KeywordEntryPage);
			
			modal.onDidDismiss((data: Array<Object>) => { 
				if (data) {
					data.map((obj) => {
						self.setDirty(true);
						self.model["keywords"].push({id: undefined, text: obj}); 
					});
					self.model["keywords"].sort((a, b) => { 
						let aText = a.text.toLowerCase(); 
						let bText = b.text.toLowerCase(); 
						if (aText > bText) return 1; 
						else if (aText < bText) return -1; 
						else return 0; 
					});
				}
			});
			
			modal.present();
		}
	}

	onCancelBtnTap() {
		this.navCtrl.pop();
	}

	onSaveBtnTap() {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		this._profileService.save(this.model).then(() => {
			self.loading.dismiss();
			
			if (!self.isExiting)
				self.navCtrl.pop();
		})
	}

	isSaveBtnEnabled() {
		return this.isDirty();
	}

	getAvailableIncomingRecommendations() {
		return this.model["availableIncomingRecommendations"];
	}

	getRealName(item) {
		let rtn = undefined;
		
		if (item["userInfo"]) {
			rtn = item["userInfo"]["realname"];
		}

		return rtn
	}

	userHasNoDreams() {
		return this.model["dreams"] === undefined || this.model["dreams"].length === 0;
	}

	userHasNoPromises() {
		return this.model["prms"] === undefined || this.model["prms"].length === 0;
	}

	userHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	userHasNoNotifications() { 
		return this.model["notifications"] === undefined || this.model["notifications"].length ==0;
	}

	getNotifications() {
		if (!this.model || !this.model["notifications"])
			return [];
		else
			return this.model["notifications"];	
	}

	onNotificationPress(item) {
		this._notificationService.delete(item).then(() => {
			this.model["notifications"] = this.model["notifications"].filter((obj) => {
				return obj["id"] !== item["id"];
			});
		});
	}

	onNotificationClearAllBtnPress() {
		this._notificationService.deleteAll().then(() => {
			this.model["notifications"] = undefined;
		});
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	getNotificationsCardClass() {
		return (this.model["notifications"] === undefined) ? "darkerWhileLoading" : "";
	}

	getPointsCardClass() {
		return (this.model["points"] === undefined) ? "darkerWhileLoading" : "";
	}

	getRecommendationsCardClass() {
		return (this.model["incomingRecommendations"] === undefined) ? "darkerWhileLoading" : "";
	}

	getPromisesCardClass() {
		return (this.model["prms"] === undefined) ? "darkerWhileLoading" : "";
	}

	getDreamsCardClass() {
		return (this.model["dreams"] === undefined) ? "darkerWhileLoading" : "";
	}

	getKeywordsCardClass() {
		return (this.model["keywords"] === undefined) ? "darkerWhileLoading" : "";
	}

	getUser() {
		return this.user;
	}
}
