import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';

import { RequestPage } from './_pages/request'
import { RulePage } from './_pages/rule'
import { DeleteThingPage } from './_pages/delete.thing'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { ThingService } from './_services/thing.service'
import { UserService } from '../../app/_services/user.service'

@Component({
  selector: 'page-thing-detail',
  templateUrl: 'things.html'
})

export class ThingPage {

	model = {};
	callback = undefined;
	new = false;
	dirty = false;
	readOnly = false;
	requestMsgs = undefined;
	requestable = false;
	newKeywords = [];

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _thingService: ThingService,
				private _userService: UserService) {

		let tmp = navParams.get('thing');

		if (tmp === undefined) {
			this.model = this._thingService.getDefaultModel();
			this.new = true;
		} else {
			this.model = Object.assign({}, tmp);
		}

		this.requestable = navParams.get('requestable') || false;
		this.requestMsgs = navParams.get('requestMsgs') || undefined;
		this.readOnly = navParams.get('readOnly') || false;
		this.callback = navParams.get('callback') || function() { };
	}

	ngOnInit() {
		let self = this;
		let arr = [];
		this.model["requiredUserRecommendations"].map((obj) => {
			if (!obj.hasOwnProperty("roles")) {
				self._userService.getUser(obj["requiredRecommendUserId"]).then((user) => {
					arr.push(user);
				});
			}
		});

		this.model["requiredUserRecommendations"] = arr;
	}

	isReadOnly() {
		return this.readOnly;
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	isNewObject() {
		return this.new;
	}

	isDeleteBtnVisible() {
		return !this.isNewObject() && !this.isReadOnly();
	}

	handleDescriptionChange() {
		this.setDirty(true);
	}

	handleTitleChange() {
		this.setDirty(true);
	}

	thingHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	isRequestMessageAvailable() {
		return this.requestMsgs !== undefined;
	}

	isAlreadyRequestedMessageAvailable() {
		return this.requestMsgs !== undefined && this.requestMsgs.some((obj) => { return obj["type"] === "alreadyRequested"});
	}

	isPointsRequestMessageAvailable() {
		return this.requestMsgs !== undefined && this.requestMsgs.some((obj) => { return obj["type"] === "points"});
	}

	isRecommendationsRequestMessageAvailable() {
		return this.requestMsgs !== undefined && this.requestMsgs.some((obj) => { return obj["type"] === "reqd"});
	}

	getRequestMessages() {
		return this.requestMsgs;
	}

	getAlreadyRequestedRequestMessages() {
		return this.requestMsgs.filter((obj) => { return obj["type"] === "alreadyRequested"});
	}

	getPointsRequestMessages() {
		return this.requestMsgs.filter((obj) => { return obj["type"] === "points"});
	}

	getRecommendationsRequestMessages() {
		return this.requestMsgs.filter((obj) => { return obj["type"] === "reqd"});
	}

	isRequestBtnVisible() {
		return this.isReadOnly() && this.requestable;
	}

	requestCallback = (_params) => {
		return new Promise((resolve, reject) => {
			if (this.callback !== undefined) 
				this.callback(_params).then(() => {
					resolve();
				});
			else
				resolve();
		});
	}

	onRequestBtnTap(evt) {
		let modal = this.modalCtrl.create(RequestPage, {thing: this.model, callback: this.requestCallback});
		modal.onDidDismiss(data => { this.navCtrl.pop(); });
		modal.present();
	}

	isSaveBtnVisible() {
		return !this.isReadOnly() && !this.isRequestBtnVisible();
	}

	isSaveBtnEnabled() {
		return !this.isReadOnly() && this.isDirty() && 
			(this.model["requiredPointsQuantity"] !== undefined && this.model["requiredPointsQuantity"] > 0) &&
			this.model["keywords"].length > 0 &&
			this.model["title"].length > 0 &&
			this.model["description"].length > 0;
	}

	onSaveBtnTap(evt) {
		let self = this;
		self.callback(this.isDirty()).then(() => {
			self._thingService.save(self.model).then((newObj) => {
				self.navCtrl.pop();
			})
		});
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
		let self = this;
		let modal = this.modalCtrl.create(KeywordEntryPage, {keywordModel: self.newKeywords});
		modal.onDidDismiss((data: Array<Object>) => { data.map((obj) => { self.setDirty(true); self.model["keywords"].push({id: undefined, text: obj}); }) } );
		modal.present();
	}

	onNewRuleBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(RulePage, {requiredPointsQuantity: self.model["requiredPointsQuantity"], requiredUserRecommendations: self.model["requiredUserRecommendations"]});
		
		modal.onDidDismiss(data => {
			self.model["requiredPointsQuantity"] = data["requiredPointsQuantity"];
			self.model["requiredUserRecommendations"] = data["requiredUserRecommendations"];
			this.setDirty(true);
		})
		
		modal.present();
	}

	onDeleteBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(DeleteThingPage, {thing: this.model});
		modal.onDidDismiss(data => { self.callback(data).then(() => { if (data === true) self.navCtrl.pop(); }) } );
		modal.present();
	}

	onCancelBtnTap(evt) {
		// TODO: Check for changes before popping.
		this.navCtrl.pop();
	}

	getRequiredUsers() {
		return this.model["requiredUserRecommendations"]; 
	}

	getRequiredPointsQuantity() {
		return this.model["requiredPointsQuantity"];
	}

	areRecommendationsRequired(thing) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}
}
