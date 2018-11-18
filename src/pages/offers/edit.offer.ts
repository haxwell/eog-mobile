import { Component } from '@angular/core';

import { File } from '@ionic-native/file'

import { Events } from 'ionic-angular';
import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { RulePage } from './_pages/rule'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { ChoosePhotoSourcePage } from '../common/choose-photo-source/choose-photo-source'

import { OfferModelService } from '../../app/_services/offer-model.service'
import { UserService } from '../../app/_services/user.service';
import { PictureService } from '../../app/_services/picture.service';
import { EventSubscriberService } from '../../app/_services/event-subscriber.service';

import { Constants } from '../../_constants/constants';

@Component({
  selector: 'page-offer-edit',
  templateUrl: 'edit.offer.html'
})

export class OfferEditPage {

	model = {};
	callback = undefined;
	new = false;
	dirty = false;
	requestMsgs = undefined;
	newKeywords = [];
	loading = undefined;

	permitOnlyEditsToPoints = undefined;

	constructor(public navCtrl: NavController, 
				private _navParams: NavParams, 
				private modalCtrl: ModalController,
				private _alertCtrl: AlertController,
				private _offerModelService: OfferModelService,
				private _userService: UserService,
				private _pictureService: PictureService,
				private _eventSubscriberService: EventSubscriberService,
				private loadingCtrl: LoadingController,
				private _constants: Constants,
				private _file: File,
				private _events: Events) {

	}

	ngOnInit() {
		let tmp = this._navParams.get('offer');

		this.model = tmp || this._offerModelService.getDefaultModel();

		if (tmp === undefined) {
			this.new = true;
		} else {
			this._offerModelService.setOfferMetadata(tmp).then((offer) => {
				this.setModel(Object.assign({}, offer));
			});
		}

		this.model["keywords"].sort((a, b) => { let aText = a.text.toLowerCase(); let bText = b.text.toLowerCase(); if (aText > bText) return 1; else if (aText < bText) return -1; else return 0; })

		if (this.areRecommendationsRequired(this.model)) {
			this.model["requiredUserRecommendations"].forEach((rec) => {
				this._userService.getUser(rec["requiredRecommendUserId"]).then((user) => {
					rec["userObj"] = user;
				})
			});
		}

		this.callback = this._navParams.get('callback') || function() { return new Promise((resolve, reject) => { resolve(); }) };

		this.permitOnlyEditsToPoints = this._navParams.get('offerHasIncomingReqs') || false;
	}

	ionViewCanLeave() {
		let self = this;
		if (!this.isDirty()) {
			return new Promise((resolve, reject) => {resolve(true);})
		} else { 

			this._eventSubscriberService.subscribe("ios-edit-offer-exit", (data) => {
				data["clearDirtyFunc"]();
				self.navCtrl.pop();		
			});

			this._eventSubscriberService.subscribe("ios-edit-offer-save-then-exit", (data) => {
				self.onSaveBtnTap(false);
				data["clearDirtyFunc"]();
				self.navCtrl.pop();
			});

			this._eventSubscriberService.subscribe("ios-confirm-exit-on-edit-offer", (data) => {
				if (data["isSaveBtnEnabled"]) {
				    let confirmAlert = this._alertCtrl.create({
				      title: 'Save changes?',
				      message: "This offer is ready to go. Do you want to save it?",
				      buttons: [{
				        text: "No, don't save.",
				        role: 'cancel',
				        handler: () => {
				        	self._events.publish("ios-edit-offer-exit", data)
						}
				      }, {
				        text: 'Yes, save it!',
				        handler: () => {
				        	self._events.publish("ios-edit-offer-save-then-exit", data)
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
				        	// do nothing
						}
				      }, {
				        text: 'Yes, lose changes',
				        handler: () => {
				        	self._events.publish("ios-edit-offer-exit", data)
				        }
				      }]
				    });
				    confirmAlert.present();
				}
			})

			this._events.publish("ios-confirm-exit-on-edit-offer", {clearDirtyFunc: () => { this.setDirty(false); }, isSaveBtnEnabled: this.isSaveBtnEnabled()});
			return new Promise((resolve, reject) => {resolve(false);})
		}
	}

	ionViewDidLeave() {
		this._eventSubscriberService.reset("ios-confirm-exit-on-edit-offer");
		this._eventSubscriberService.reset("ios-edit-offer-save-then-exit");
		this._eventSubscriberService.reset("ios-edit-offer-exit");
	}

	setModel(m) {
		this.model = m;
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

	handleQuantityChange() {
		this.setDirty(true);
	}

	handleQuantityDescriptionChange() {
		this.setDirty(true);
	}

	isModelTitleEditable() {
		return this.permitOnlyEditsToPoints == false;
	}

	isModelQuantityEditable() {
		return this.permitOnlyEditsToPoints == false;
	}

	isModelQuantityDescEditable() {
		return this.permitOnlyEditsToPoints == false;
	}

	isModelDescriptionEditable() {
		return this.permitOnlyEditsToPoints == false;
	}

	offerHasNoKeywords() {
		return this.model["keywords"] === undefined || this.model["keywords"].length === 0;
	}

	getOfferOwnerName() {
		return this.model["directionallyOppositeUser"] !== undefined ? this.model["directionallyOppositeUser"]["realname"] : "";
	}

	isSaveBtnEnabled() {
		return this.isDirty() && 
			(this.model["requiredPointsQuantity"] !== undefined && this.model["requiredPointsQuantity"] > 0) &&
			this.model["keywords"].length > 0 &&
			this.model["title"].length > 0 &&
			this.model["description"].length > 0 &&
			(this.model["quantity"] !== undefined && this.model["quantity"] > 0) &&
			this.model["quantityDescription"].length > 0;
	}

	onSaveBtnTap(shouldCallNavCtrlPop) {
		let self = this;

		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();


		let func = (obj) => {
			return new Promise((resolve, reject) => {
				if (self.isImageChanged(self.model)) {
					self._pictureService.save(self._constants.PHOTO_TYPE_OFFER, obj["id"], self.model["imageFileURI"]).then((data) => {
						console.log("offer " + obj["id"] + " picture is saved...");
						resolve();
					})
				} else {
					resolve();
				}
			})
		}

		// call to save the model, and then the offerModelService will call func(). This order is important, because this may
		//  be a new object, and to save the image associated with it, we need an ID. So save, get an ID, then save the offer image
		//  via the callback.
		
		self._offerModelService.save(self.model, func).then((newObj) => {

			self.callback(self.model).then(() => {
				self.setDirty(false);
				self.loading.dismiss();

				self._pictureService.reset(self._constants.PHOTO_TYPE_PROFILE, newObj["id"]);

				if (shouldCallNavCtrlPop)
					self.navCtrl.pop();
			}).catch((err) => {
				console.log("Error calling edit offer callback");
				console.log(JSON.stringify(err));
			})

		}).catch((err) => {
			console.log("Error calling offerModelService::save()")
			console.log(JSON.stringify(err))
		})
	}

	isImageChanged(model) {
		let rtn = this.model["imageFileURI_OriginalValue"] != model["imageFileURI"];
		console.log("edit-offer::isImageChanged() returning " + rtn);
		return rtn;
	}

	onIndividualKeywordPress(item) {
		return this.onAddKeywordBtnTap(item);
	}

	onAddKeywordBtnTap(evt) {
		if (this.permitOnlyEditsToPoints !== true) {
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
	}

	onNewRuleBtnTap(evt) {
		let self = this;
		let modal = this.modalCtrl.create(RulePage, {requiredPointsQuantity: self.model["requiredPointsQuantity"], requiredUserRecommendations: self.model["requiredUserRecommendations"], permitOnlyEditsToPoints: this.permitOnlyEditsToPoints });
		
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

	areRecommendationsRequired(offer) {
		return (this.model["requiredUserRecommendations"] && this.model["requiredUserRecommendations"].length > 0);
	}

	isThumbnailImageAvailable() {
		return this.model["imageFileURI"] !== undefined;
	}

	getThumbnailImage() {
		if (this.model["imageFileURI"] !== undefined && this.model["imageOrientation"] !== undefined)
			return this.model["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getAvatarCSSClassString() {
		return this._pictureService.getOrientationCSS(this.model, "editOfferImage");
	}

	onThumbnailClick($event) {
		let self = this;
		let model = this.model;
		let modal = this.modalCtrl.create(ChoosePhotoSourcePage, {fileURI: this.model["imageFileURI"], fileSource: this.model["imageFileSource"]});
		
		modal.onDidDismiss((offer) => {
			if (offer) {
				offer.then((uriAndSource) => { 
					if (uriAndSource === undefined) {
						uriAndSource = {};
					}


					if (model["imageFileURI"] !== undefined && model["imageFileSource"] == 'camera') {
						let lastSlash = model["imageFileURI"].lastIndexOf('/');
						let path = model["imageFileURI"].substring(0,lastSlash+1);
						let filename = model["imageFileURI"].substring(lastSlash+1);

						self._file.removeFile(path, filename).then((data) => {
							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_OFFER, model["id"], uriAndSource["imageFileURI"]);

							console.log("User saved a new offer image. [" + model["imageFileURI"] + "] is no longer the image to use, so it has been removed." );
							console.log("setting offer model to [" + uriAndSource["imageFileURI"] + "]");

							model["imageFileURI"] = uriAndSource["imageFileURI"];
							model["imageFileSource"] = uriAndSource["imageFileSource"];
							model["imageOrientation"] = uriAndSource["exif"]["Orientation"];

							self.setDirty(true);						
						})
					} else {
						console.log("no previous image was set on the model, so skipping the 'delete previous image' step...")

						self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_OFFER, model["id"], uriAndSource["imageFileURI"]);

						model["imageFileURI"] = uriAndSource["imageFileURI"];
						model["imageFileSource"] = uriAndSource["imageFileSource"];
						model["imageOrientation"] = uriAndSource["exif"]["Orientation"];

						self.setDirty(true);
					}

				});
			}
		});
		
		modal.present();
	}

	onThumbnailPress($event) {
		let self = this;

		let alert = this._alertCtrl.create({
			title: 'Delete Photo?',
			message: 'Do you want to DELETE the picture on this offer?',
			buttons: [
				{
					text: 'No', role: 'cancel', handler: () => {
						// do nothing
					},
				}, {
					text: 'Yes', handler: () => {
						//let self = this;

						let func = () => {
							//let model = self._profileService.getModel(self.user["id"]);

							self.model["imageFileURI"] = undefined;
							self.model["imageFileSource"] = undefined;

							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_OFFER, self.model["id"], self.model["imageFileURI"]);
						}

						console.log('deleting photo ' + self.model["id"]);

						self._pictureService.delete(self._constants.PHOTO_TYPE_PROFILE, self.model["id"]).then(() => { 

							let model = self._offerModelService.get(self.model["id"]);

							if (model["imageFileSource"] === 'camera' || model["imageFileSource"] === 'eog') {
								
								console.log("This image came from the camera, or the api.. deleting off the phone now. path=" + model['imageFileURI'] + "]")

								let lastSlash = model["imageFileURI"].lastIndexOf('/');
								let path = model["imageFileURI"].substring(0,lastSlash+1);
								let filename = model["imageFileURI"].substring(lastSlash+1);

								self._file.removeFile(path, filename).then((data) => {
									console.log("Call to pictureService to DELETE photo for "+model['id']+" successful! Image was from camera or the eog api, so it was removed from phone.");

									func();
									
								}).catch(() => {
									console.log("Caught error trying to remove file from phone");

									func();
								});
							} else {
								console.log("Call to pictureService to DELETE photo for "+model['id']+" successful! Image was from phone's gallery, so did not try to remove it.");

								func();								
							}

						}).catch(() => {
							console.log("An error occurred deleting the image from the server. Probably, it didn't exist there. Noting it, in case things look wonky..")

							func();
						});
					},
				}
			]
		});

		alert.present();
	}
}
