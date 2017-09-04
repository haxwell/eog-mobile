import { Component } from '@angular/core';
import { NavController, ModalController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { ProfileService } from './_services/profile.service'
import { NotificationService } from './_services/notification.service'

import { ThingPage } from '../things/things'
import { DreamPage } from '../dreams/dreams'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})

export class ProfilePage {

	model = {};
	user = undefined;
	dirty = true;
	readOnly = false;

	constructor(public navCtrl: NavController,
				navParams: NavParams, 
				public modalCtrl: ModalController,
				private _profileService: ProfileService,
				private _notificationService: NotificationService,
				private _events: Events) {

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
	}

	ngOnInit() {
		if (this.isDirty()) {
			this._profileService.init();
			this.model = this._profileService.getModel(this.user, this.readOnly);
		}

		this.setDirty(false);
	}

	ionViewWillEnter() {
		if (this.isDirty()) 
			this.ngOnInit();
	}

	isReadOnly() {
		return this.readOnly;
	}

	thingAndDreamCallback = (_params) => {
		return new Promise((resolve, reject) => {
			this.setDirty(_params === true);
			resolve();
		});
	}

	onNewThingBtnTap(evt) {
		this.navCtrl.push(ThingPage, { thing: undefined, callback: this.thingAndDreamCallback });
	}

	onThingBtnTap(item) { 
		if (!this.isReadOnly())
			this.navCtrl.push(ThingPage, { thing: item, callback:  this.thingAndDreamCallback });
	}

	onNewDreamBtnTap(evt) {
		this.navCtrl.push(DreamPage, { dream: undefined, callback: this.thingAndDreamCallback });
	}

	onDreamBtnTap(item) { 
		if (!this.isReadOnly())
			this.navCtrl.push(DreamPage, { dream: item, callback: this.thingAndDreamCallback });
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
		this._profileService.save(this.model).then(() => {
			this.navCtrl.pop();
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

	userHasNoThings() {
		return this.model["things"] === undefined || this.model["things"].length === 0;
	}

	userHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	userHasNoNotifications() { 
		return this.model["notifications"] === undefined || this.model["notifications"].length ==0;
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

	onNameChange() {
		this.setDirty(true);
	}

	onEmailChange() {
		this.setDirty(true);
	}

	onPhoneChange() {
		this.setDirty(true);
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

	getThingsCardClass() {
		return (this.model["things"] === undefined) ? "darkerWhileLoading" : "";
	}

	getDreamsCardClass() {
		return (this.model["dreams"] === undefined) ? "darkerWhileLoading" : "";
	}

	getKeywordsCardClass() {
		return (this.model["keywords"] === undefined) ? "darkerWhileLoading" : "";
	}


}
