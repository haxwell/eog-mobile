import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
//import { LoadingController } from 'ionic-angular';

import { PrmPage } from './promises'
import { RequestPage } from './_pages/request'
//import { RulePage } from './_pages/rule'
import { DeletePrmPage } from './_pages/delete.prm'
//import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { PrmModelService } from './_services/prm.model.service'
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { PrmDetailService } from '../../app/_services/prm-detail.service';
import { UserService } from '../../app/_services/user.service';
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

	constructor(public navCtrl: NavController, 
				navParams: NavParams, 
				private modalCtrl: ModalController,
				private _prmModelService: PrmModelService,
				private _prmMetadataService: PrmMetadataService,
				private _prmDetailService: PrmDetailService,
				private _userService: UserService,
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
		return self._prmMetadataService.getMetadataValue(self.model, self._constants.FUNCTION_KEY_PRM_IS_REQUESTABLE).then((bool) => { 
			self._isRequestBtnVisible = bool;
		});
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
		this.navCtrl.push(PrmPage, {prm: this.model});
	}

}
