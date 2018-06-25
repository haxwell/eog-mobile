import { Component } from '@angular/core';

import { File } from '@ionic-native/file'

import { NavController, NavParams } from 'ionic-angular';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';
import { AlertController } from 'ionic-angular';

import { RulePage } from './_pages/rule'
import { KeywordEntryPage } from '../keyword.entry/keyword.entry'
import { ChoosePhotoSourcePage } from '../common/choose-photo-source/choose-photo-source'

import { PrmModelService } from '../../app/_services/prm-model.service'
import { PrmDetailService } from '../../app/_services/prm-detail.service';
import { UserService } from '../../app/_services/user.service';
import { PictureService } from '../../app/_services/picture.service';

import { Constants } from '../../_constants/constants';

import EXIF from 'exif-js'

@Component({
  selector: 'page-prm-edit',
  templateUrl: 'edit.prm.html'
})

export class PrmEditPage {

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
				private _pictureService: PictureService,
				private loadingCtrl: LoadingController,
				private _constants: Constants,
				private _file: File) {

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

/*
//		This should never be the case. You can't edit another user's prm

        if (this.model["userId"] !== this._userService.getCurrentUser()["id"] && 
        	this.model["directionallyOppositeUser"] === undefined) {
		        let getUserPromise = this._userService.getUser(this.model["userId"]);
		        getUserPromise.then((user) => {
		            this.model["directionallyOppositeUser"] = user;
		            delete this.model["userId"];
		        });
        }
*/

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


		let func = (obj) => {
			return new Promise((resolve, reject) => {
				if (self.isImageChanged(self.model)) {
					self._pictureService.save(self._constants.PHOTO_TYPE_PRM, obj["id"], self.model["imageFileURI"]).then((data) => {
						console.log("prm " + obj["id"] + " picture is saved...");
						resolve();
					})
				} else {
					resolve();
				}
			})
		}

		// call to save the model, and then the prmModelService will call func(). This order is important, because this may
		//  be a new object, and to save the image associated with it, we need an ID. So save, get an ID, then save the prm image
		//  via the callback.
		
		self._prmModelService.save(self.model, func).then((newObj) => {

			self.callback(self.model).then(() => {
				self.setDirty(false);
				self.loading.dismiss();

				self._pictureService.reset(self._constants.PHOTO_TYPE_PROFILE, newObj["id"]);

				if (shouldCallNavCtrlPop)
					self.navCtrl.pop();
			})
		})
	}

	isImageChanged(model) {
		let rtn = this.model["imageFileURI_OriginalValue"] != model["imageFileURI"];
		console.log("edit-prm::isImageChanged() returning " + rtn);
		return rtn;
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

	isThumbnailImageAvailable() {
		return this.model["imageFileURI"] !== undefined;
	}

	getThumbnailImage() {
		if (this.model["imageFileURI"] !== undefined)
			return this.model["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	isThumbnailImageVisible() {
		return this.model["imageOrientation"] !== undefined;
	}

	getAvatarCSSClassString() {
		if (this.model["imageOrientation"] === 8)
			return "rotate90Counterclockwise editPrmImage centered";
		else if (this.model["imageOrientation"] === 3)
			return "rotate180 editPrmImage centered";
		else if (this.model["imageOrientation"] === 6)
			return "rotate90Clockwise editPrmImage centered";
		else
			return "editPrmImage centered";
	}

	onThumbnailClick($event) {
		let self = this;
		let model = this.model;
		let modal = this.modalCtrl.create(ChoosePhotoSourcePage, {fileURI: this.model["imageFileURI"], fileSource: this.model["imageFileSource"]});
		
		modal.onDidDismiss((promise) => {
			if (promise) {
				promise.then((uriAndSource) => { 
					if (uriAndSource === undefined) {
						uriAndSource = {};
					}


					if (model["imageFileURI"] !== undefined && model["imageFileSource"] == 'camera') {
						let lastSlash = model["imageFileURI"].lastIndexOf('/');
						let path = model["imageFileURI"].substring(0,lastSlash+1);
						let filename = model["imageFileURI"].substring(lastSlash+1);

						self._file.removeFile(path, filename).then((data) => {
							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PRM, model["id"], uriAndSource["imageFileURI"]);

							console.log("User saved a new prm image. [" + model["imageFileURI"] + "] is no longer the image to use, so it has been removed." );
							console.log("setting prm model to [" + uriAndSource["imageFileURI"] + "]");

							model["imageFileURI"] = uriAndSource["imageFileURI"];
							model["imageFileSource"] = uriAndSource["imageFileSource"];
							model["imageOrientation"] = uriAndSource["exif"]["Orientation"];

							self.setDirty(true);						
						})
					} else {
						console.log("no previous image was set on the model, so skipping the 'delete previous image' step...")

						self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PRM, model["id"], uriAndSource["imageFileURI"]);

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
			message: 'Do you want to DELETE the picture on this promise?',
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

							self._pictureService.setMostProbablePhotoPath(self._constants.PHOTO_TYPE_PRM, self.model["id"], self.model["imageFileURI"]);
						}

						console.log('deleting photo ' + self.model["id"]);

						self._pictureService.delete(self._constants.PHOTO_TYPE_PROFILE, self.model["id"]).then(() => { 

							let model = self._prmModelService.get(self.model["id"]);

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
