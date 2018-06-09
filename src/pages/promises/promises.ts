import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { RulePage } from './_pages/rule'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { PrmModelService } from './_services/prm.model.service'
import { PrmDetailService } from '../../app/_services/prm-detail.service';
import { UserService } from '../../app/_services/user.service';

@Component({
  selector: 'page-prm-detail',
  templateUrl: 'promises.html'
})

export class PrmPage {

	model = {};
	callback = undefined;
	new = false;
	dirty = false;
	requestMsgs = undefined;
	newKeywords = [];
	loading = undefined;
	shouldPopOnReturnToThisView = false;

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _alertCtrl: AlertController,
				private _prmModelService: PrmModelService,
				private _prmDetailService: PrmDetailService,
				private _userService: UserService,
				private loadingCtrl: LoadingController) {

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

		this.callback = navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };
	}

	ngOnInit() {

	}

	ionViewDidEnter() {
		if (this.shouldPopOnReturnToThisView) {
			this.navCtrl.pop();
		}
	}

	ionViewCanLeave() {
		let self = this;
		
		return new Promise((resolve, reject) => { 
			if (self.isDirty()) {
				if (self.isSaveBtnEnabled()) {
				    let confirmAlert = this._alertCtrl.create({
				      title: 'Save changes?',
				      message: "This promise is ready to go. Do you want to save it?",
				      buttons: [{
				        text: "No, don't save.",
				        role: 'cancel',
				        handler: () => {
							self.setDirty(false);
							self.setShouldPopOnReturnToThisView();
							resolve();
						}
				      }, {
				        text: 'Yes, save it!',
				        handler: () => {
							self.setDirty(false);
				          	self.onSaveBtnTap(false);
				          	self.setShouldPopOnReturnToThisView();
							resolve();
				        }
				      }]
				    });
				    confirmAlert.present();
				} else {
				    let confirmAlert = this._alertCtrl.create({
				      title: 'Save changes?',
				      message: "You'll lose the changes you made. Exit anyway?",
				      buttons: [{
				        text: "No, don't exit!",
				        role: 'cancel',
				        handler: () => {
				        	reject();
						}
				      }, {
				        text: 'Yes, lose changes',
				        handler: () => {
							self.setDirty(false);
							self.setShouldPopOnReturnToThisView();
							resolve();
				        }
				      }]
				    });
				    confirmAlert.present();
				}
			} else {
				self.setShouldPopOnReturnToThisView();
				resolve();
			}
		})
	}

	setModel(m) {
		this.model = m;
	}

	isDirty() {
		return this.dirty;
	}

	setShouldPopOnReturnToThisView() {
		this.shouldPopOnReturnToThisView = true;
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

	isSaveBtnEnabled() {
		return this.isDirty() && 
			(this.model["requiredPointsQuantity"] !== undefined && this.model["requiredPointsQuantity"] > 0) &&
			this.model["keywords"].length > 0 &&
			this.model["title"].length > 0 &&
			this.model["description"].length > 0;
	}

	onSaveBtnTap(shouldCallNavCtrlPop) {
		let self = this;

		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		self.callback(self.isDirty(), self.model).then(() => {
			self._prmModelService.save(self.model).then((newObj) => {
				self.setDirty(false);			
				self.loading.dismiss();
				
				if (shouldCallNavCtrlPop)
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
