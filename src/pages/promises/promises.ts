import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

//import { RequestPage } from './_pages/request'
import { RulePage } from './_pages/rule'
//import { DeletePrmPage } from './_pages/delete.prm'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { PrmModelService } from './_services/prm.model.service'
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
	_isRequestBtnVisible = undefined;

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _prmModelService: PrmModelService,
				private _prmMetadataService: PrmMetadataService,
				private _prmDetailService: PrmDetailService,
				private _userService: UserService,
				private loadingCtrl: LoadingController,
				private _constants: Constants) {

		let tmp = navParams.get('prm');

		this.model = tmp || this._prmModelService.getDefaultModel();

		if (tmp === undefined) {
			this.new = true;
		} else {
			this._prmModelService.setPrmMetadata(tmp).then((prm) => {
				this.setModel(Object.assign({}, prm));
			});
		}

		this.model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })

        if (this.model["userId"] !== this._userService.getCurrentUser()["id"] && 
        	this.model["directionallyOppositeUser"] === undefined) {
		        let getUserPromise = this._userService.getUser(this.model["userId"]);
		        getUserPromise.then((user) => {
		            this.model["directionallyOppositeUser"] = user;
		            delete this.model["userId"];
		        });
        }

		if (this.areRecommendationsRequired(this.model)) {
			this.model["requiredUserRecommendations"].forEach((rec) => {
				this._userService.getUser(rec["requiredRecommendUserId"]).then((user) => {
					rec["userObj"] = user;
				})
			});
		}

		if (tmp !== undefined && tmp["userId"] !== this._userService.getCurrentUser()["id"] )
			this.requestMsgs = this._prmDetailService.getPrmDetailMessages(tmp);

		this.readOnly = navParams.get('readOnly') || false;
		this.callback = navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };
	}

	ngOnInit() {
		let self = this;
		self._prmMetadataService.init();

		self._prmMetadataService.getMetadataValue(self.model, self._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE).then((bool) => { 
			self._isRequestBtnVisible = bool && !self.isNewObject() && self.isReadOnly();
		});
	}

	setModel(m) {
		this.model = m;
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

	handleDescriptionChange() {
		this.setDirty(true);
	}

	handleTitleChange() {
		this.setDirty(true);
	}

	prmHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	getPrmOwnerName() {
		return this.model["directionallyOppositeUser"] !== undefined ? this.model["directionallyOppositeUser"]["realname"] : "";
	}

	getRequestMessages() {
		return this.requestMsgs;
	}

	isSaveBtnVisible() {
		// TODO: Delete this.. 
		return true; //!this.isReadOnly() && !this.isRequestBtnVisible();
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

		self.callback(self.isDirty(), self.model).then(() => {
			self._prmModelService.save(self.model).then((newObj) => {
				self.loading.dismiss();
				self.navCtrl.pop();
			})
		});
	}

	onIndividualKeywordPress(item) {
		if (!this.isReadOnly())
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
					self.model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })
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

	getRequiredPointsQuantityString() {
		let rtn = this.model["requiredPointsQuantity"] + " point";

		if (this.model["requiredPointsQuantity"] > 1)
			rtn += "s";

		return rtn;
	}

	areRecommendationsRequired(prm) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}

}
