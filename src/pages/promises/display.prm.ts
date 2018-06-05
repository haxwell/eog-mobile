import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
//import { LoadingController } from 'ionic-angular';

import { PrmPage } from './promises'
import { RequestPage } from './_pages/request'
//import { RulePage } from './_pages/rule'
import { DeletePrmPage } from './_pages/delete.prm'
import { OutgoingRequestMadeTutorialPage } from './_pages/outgoing-request-made-tutorial'
//import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { PrmModelService } from './_services/prm.model.service'
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { PrmDetailService } from '../../app/_services/prm-detail.service';
import { UserService } from '../../app/_services/user.service';
import { UserPreferencesService } from '../../app/_services/user-preferences.service';
import { Constants } from '../../_constants/constants';

import Moment from 'moment'

@Component({
  selector: 'page-display-prm',
  templateUrl: 'display.prm.html'
})

export class PrmDisplayPage {

	model = undefined;
	requestMsgs = undefined;
	_isRequestBtnVisible = undefined;
	callback = undefined; // TODO: necessary?
	requiredUserObjectsLoadedCount = 0; 
	showTutorialAfterOutgoingRequestMade = true;

	dirty = false;

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _prmModelService: PrmModelService,
				private _prmMetadataService: PrmMetadataService,
				private _prmDetailService: PrmDetailService,
				private _userService: UserService,
				private _userPreferencesService: UserPreferencesService,
				//private loadingCtrl: LoadingController,
				private _constants: Constants) {

		this.model = navParams.get('prm');

		this._prmModelService.setPrmMetadata(this.model).then((prm) => {
			this.setModel(Object.assign({}, prm));
		});

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
					this.requiredUserObjectsLoadedCount++;
				})
			});
		}

		this.requestMsgs = this._prmDetailService.getPrmDetailMessages(this.model);

		this.callback = navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };
	}

	ngOnInit() {
		let self = this;
		self._prmMetadataService.getMetadataValue(self.model, self._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE).then((bool) => { 
			self._isRequestBtnVisible = bool;
		});

		self._userPreferencesService.getPreference("showTutorialAfterOutgoingRequestMade", true).then((data) => {
			self.showTutorialAfterOutgoingRequestMade = data["pref"];
		})

	}

	setModel(m) {
		this.model = m;
	}

	getModel() {
		return this.model;
	}

	isRequestMessageAvailable() {
		return this.requestMsgs !== undefined && this.requestMsgs.length > 0;
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

	getRequiredPointsQuantityString() {
		let rtn = this.model["requiredPointsQuantity"] + " point";

		if (this.model["requiredPointsQuantity"] > 1)
			rtn += "s";

		return rtn;
	}

	getRequiredRecommendationUserObjects() {
		let rtn = undefined;

		if (this.requiredUserObjectsLoadedCount === this.model["requiredUserRecommendations"].length) {
			rtn = [];

			this.model["requiredUserRecommendations"].forEach((req) => {
				rtn.push(req["userObj"]);
			})
		}

		return rtn;
	}

	hasStatistics() {
		return this.model["fulfillment_dates"] !== undefined && this.model["fulfillment_dates"].length > 0;
	}

	getFirstFulfilledText() {
		if (this.model["fulfillment_dates"] !== undefined && this.model["fulfillment_dates"].length > 0) 
			return "First fullfilled " + Moment(this.model["fulfillment_dates"][0]).fromNow();
		else
			return "Never been fulfilled.";
	}

	getNumberOfComplaints() {
		if (this.model["num_of_complaints"] !== undefined) 
			return this.model["num_of_complaints"] + " complaints.";
		else
			return "No complaints about this promise.";
	}

	getTotalPointsEarned() {
		if (this.model["total_points_earned"] !== undefined) 
			return "Earned " + this.model["total_points_earned"] + " points over its lifetime.";
		else
			return "No points earned yet.";
	}

	isDeleteBtnVisible() {
		return this.model["userId"] === this._userService.getCurrentUser()["id"]
	}

	isRequestBtnVisible() {
		return this._isRequestBtnVisible;
	}

	onDeleteBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(DeletePrmPage, {prm: this.model});
		modal.onDidDismiss(data => { self.callback(data).then(() => { if (data === true) self.navCtrl.pop(); }) } );
		modal.present();
	}

	// this callback calls back the callback that was passed into this page initially.
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
		let self = this;
		let modal = self.modalCtrl.create(RequestPage, {prm: self.model, callback: self.requestCallback});
		modal.onDidDismiss(data => { 
			if (data !== undefined) {
				if (self.showTutorialAfterOutgoingRequestMade) {
					let modal = self.modalCtrl.create(OutgoingRequestMadeTutorialPage, { });

					modal.onDidDismiss((data) => {
						self.navCtrl.pop();
					});

					modal.present();
				} else {
					self.navCtrl.pop();
				}
			} else {
				self.navCtrl.pop();
			}
		});
		modal.present();
	}

	onGoBackBtnTap(evt) {
		this.navCtrl.pop();
	}

	areRecommendationsRequired(prm) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}

	isCurrentUsersPromise() {
		return this.model["userId"] === this._userService.getCurrentUser()["id"];
	}

	onEditPromiseBtnClick() {
		let self = this;

		let editPromiseCallback = (isDirty, prmModel) => {
			return new Promise((resolve, reject) => {
				self.model = prmModel;
				resolve();
			})
		}

		self.navCtrl.push(PrmPage, {prm: self.model, callback: editPromiseCallback});
	}
}
