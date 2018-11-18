import { Component } from '@angular/core';

import { NavController, NavParams } from 'ionic-angular';
import { ModalController, AlertController } from 'ionic-angular';

import { OfferEditPage } from './edit.offer'
import { RequestPage } from './_pages/request'
import { DeleteOfferPage } from './_pages/delete.offer'
import { OutgoingRequestMadeTutorialPage } from './_pages/outgoing-request-made-tutorial'
import { OfferModelService } from '../../app/_services/offer-model.service';
import { OfferMetadataService } from '../../app/_services/offer-metadata.service';
import { OfferDetailService } from '../../app/_services/offer-detail.service';
import { UserService } from '../../app/_services/user.service';
import { UserPreferencesService } from '../../app/_services/user-preferences.service';
import { PictureService } from '../../app/_services/picture.service';
import { RequestsService } from '../../app/_services/requests.service';

import { Constants } from '../../_constants/constants';

import Moment from 'moment'

@Component({
  selector: 'page-display-offer',
  templateUrl: 'display.offer.html'
})

export class OfferDisplayPage {

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
				private alertCtrl: AlertController,
				private _offerModelService: OfferModelService,
				private _offerMetadataService: OfferMetadataService,
				private _offerDetailService: OfferDetailService,
				private _userService: UserService,
				private _pictureService: PictureService,
				private _requestsService: RequestsService,
				private _userPreferencesService: UserPreferencesService,
				private _constants: Constants) {

		this.model = navParams.get('offer');

		this._offerModelService.setOfferMetadata(this.model).then((offer) => {
			this.setModel(Object.assign({}, offer));
		});

		this.model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })

        if (this.model["userId"] !== this._userService.getCurrentUser()["id"] && 
        	this.model["directionallyOppositeUser"] === undefined) {
		        let getUserOffer = this._userService.getUser(this.model["userId"]);
		        getUserOffer.then((user) => {
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

		this.requestMsgs = this._offerDetailService.getOfferDetailMessages(this.model);

		this.callback = navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };
	}

	ngOnInit() {
		let self = this;

		self._offerMetadataService.init();

		self._offerMetadataService.getMetadataValue(self.model, self._constants.FUNCTION_KEY_OFFER_IS_REQUESTABLE).then((bool) => { 
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
		let rtn = (this.model["fulfillment_dates"] !== undefined && this.model["fulfillment_dates"].length > 0) ||
				(this.model["num_of_complaints"] !== undefined && this.model["num_of_complaints"] > 0) ||
				(this.model["total_points_earned"] != undefined && this.model["total_points_earned"] > 0);

		return rtn;
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
			return "No complaints about this offer.";
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
		let modal = this.modalCtrl.create(DeleteOfferPage, {offer: this.model});
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
		let modal = self.modalCtrl.create(RequestPage, {offer: self.model, callback: self.requestCallback});
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

	areRecommendationsRequired(offer) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}

	isCurrentUsersOffer() {
		return this.model["userId"] === this._userService.getCurrentUser()["id"];
	}

	onEditOfferBtnClick() {
		let self = this;

		let editOfferCallback = (offerModel) => {
			return new Promise((resolve, reject) => {
				self.model = offerModel;
				console.log("Display.OFFER editOfferCallback called with: " + JSON.stringify(self.model)) // expect that this should have the image path on it

				if (this.callback !== undefined) 
					this.callback(true).then(() => {
						resolve();
					});
				else 
					resolve();
			})
		}

		self._requestsService.getIncomingRequestsForCurrentUser().then((data: Array<Object>) => {
			let reqsForThisOffer = data.filter((obj) => { return obj["offer"]["id"] === self.model["id"]; });
			reqsForThisOffer = reqsForThisOffer.filter((obj) => { return obj["deliveringStatusId"] !== this._constants.REQUEST_STATUS_DECLINED_AND_HIDDEN && obj["deliveringStatusId"] !== this._constants.REQUEST_STATUS_DECLINED; })

			if (reqsForThisOffer !== undefined && reqsForThisOffer.length > 0) {
				// this offer has outstanding requests (pending and/or in-progress)
				//  the user can only change the picture, and number of points required

				let okAlert = self.alertCtrl.create({
				      title: 'Just FYI',
				      subTitle: "This offer has requests that are pending or in-progress.<br/><br/>You will only be able to edit the picture, and the number of points that it requires. Edits to points will only apply to future requests.",
				      buttons: [{
				        text: 'OK',
				        handler: () => {
							self.navCtrl.push(OfferEditPage, {offer: Object.assign({}, self.model), callback: editOfferCallback, offerHasIncomingReqs: true});
				        }
					}]
				})

				okAlert.present();

			} else {
				self.navCtrl.push(OfferEditPage, {offer: Object.assign({}, self.model), callback: editOfferCallback});
			}
		})
	}

	getThumbnailImage() {
		let rtn = undefined;
		
		if (this.model["imageFileURI"] !== undefined && this.model["imageOrientation"] !== undefined)
			rtn = this.model["imageFileURI"];
		else
			rtn = "assets/img/logo.jpg";

		return rtn;
	}

	getAvatarCSSClassString() {
		return this._pictureService.getOrientationCSS(this.model);
	}
}
