import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { RequestPage } from './_pages/request'
import { RulePage } from './_pages/rule'
import { DeletePrmPage } from './_pages/delete.prm'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { PrmService } from './_services/prm.service'
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { PrmDetailService } from '../../app/_services/prm-detail.service';
import { UserService } from '../../app/_services/user.service';
import { Constants } from '../../_constants/constants';


@Component({
  selector: 'page-prm-detail',
  templateUrl: 'promises.html'
})

export class PrmPage {

	model = {};
	callback = undefined;
	new = false;
	dirty = false;
	readOnly = false;
	requestMsgs = undefined;
	newKeywords = [];
	loading = undefined;

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _prmService: PrmService,
				private _prmMetadataService: PrmMetadataService,
				private _prmDetailService: PrmDetailService,
				private _userService: UserService,
				private loadingCtrl: LoadingController,
				private _constants: Constants) {

		let tmp = navParams.get('prm');

		if (tmp === undefined) {
			this.model = this._prmService.getDefaultModel();
			this.new = true;
		} else {
			this.model = Object.assign({}, tmp);
		}

		if (this.areRecommendationsRequired(this.model)) {
			this.model["requiredUserRecommendations"].forEach((rec) => {
				this._userService.getUser(rec["requiredRecommendUserId"]).then((user) => {
					rec["userObj"] = user;
				})
			});
		}

		this.requestMsgs = this._prmDetailService.getPrmDetailMessages(tmp);
		this.readOnly = navParams.get('readOnly') || false;
		this.callback = navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };
	}

	ngOnInit() {

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

	prmHasNoKeywords() {
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

	isStillMoreTimeLeftMessageAvailable() {
		return this.requestMsgs !== undefined && this.requestMsgs.some((obj) => { return obj["type"] === "timeRemaining"});
	}

	getRequestMessages() {
		return this.requestMsgs;
	}

	getStillMoreTimeLeftMessages() {
		return this.requestMsgs.filter((obj) => { return obj["type"] === "timeRemaining"});
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
		return this.isReadOnly() && this._prmMetadataService.getMetadataValue(this.model, this._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE);
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
		let modal = this.modalCtrl.create(RequestPage, {prm: this.model, callback: this.requestCallback});
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

		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		self.callback(this.isDirty()).then(() => {
			self._prmService.save(self.model).then((newObj) => {
				self.loading.dismiss();
				self.navCtrl.pop();
			})
		});
	}

	onIndividualKeywordPress(item) {
		return this.onAddKeywordBtnTap(item);
	}

	onAddKeywordBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(KeywordEntryPage, { keywordArray: self.model["keywords"] });
		modal.onDidDismiss(
			(data: Array<Object>) => { 
				if (data) {
					self.setDirty(true); 
					self.model["keywords"] = data;
				} 
			}
		);
		modal.present();
	}

	onNewRuleBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(RulePage, {requiredPointsQuantity: self.model["requiredPointsQuantity"], requiredUserRecommendations: self.model["requiredUserRecommendations"]});
		
		modal.onDidDismiss(data => {
			if (data) {
				self.model["requiredPointsQuantity"] = data["requiredPointsQuantity"];
				self.model["requiredUserRecommendations"] = data["requiredUserRecommendations"];
				this.setDirty(true);
			}
		})
		
		modal.present();
	}

	onDeleteBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(DeletePrmPage, {prm: this.model});
		modal.onDidDismiss(data => { self.callback(data).then(() => { if (data === true) self.navCtrl.pop(); }) } );
		modal.present();
	}

	onCancelBtnTap(evt) {
		// TODO: Check for changes before popping.
		this.navCtrl.pop();
	}

	getRequiredUserRecommendations() {
		if (this.model["requiredUserRecommendations"] !== undefined && !this.model["requiredUserRecommendations"].some((rec) => { return rec["userObj"] === undefined; })) {
			return this.model["requiredUserRecommendations"];
		} else {
			return [];
		}
	}

	getRequiredPointsQuantity() {
		return this.model["requiredPointsQuantity"];
	}

	areRecommendationsRequired(prm) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}
}
