import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { PrmEditPage } from '../promises/edit.prm'
import { PrmDisplayPage } from '../promises/display.prm'

import { PrmCollectionService } from '../../app/_services/prm-collection.service'

import EXIF from 'exif-js';

@Component({
  selector: 'promise-list',
  templateUrl: 'promise-list.html'
})

/**
 *
 * Displays a list of promises owned by the current user.
 *  
 */
export class PromiseListPage {

	model = {};
	dirty = undefined;

	constructor(private _prmcService : PrmCollectionService,
				private navCtrl : NavController,
				private _events: Events
	) {
		this.setDirty(true);

		let func = () => {
			this.setDirty(true);
			this.ngOnInit()
		}

		this._events.subscribe('promise:saved', func);
		this._events.subscribe('promise:deleted', func);
	}

	ngOnInit() {
		if (this.isDirty()) {
			this.setDirty(false);
			this._prmcService.resetModel();
			this.model = this._prmcService.getModel();
		}
	}

	ionViewWillEnter() {
		this.ngOnInit();
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	PrmCallback = (_params) => {
		return new Promise((resolve, reject) => {
			this.setDirty(_params === true);
			resolve();
		});
	}

	getPromises() {
		return this.model["prms"];
	}

	onNewPromiseBtnTap() {
		this.navCtrl.push(PrmEditPage, { prm: undefined, callback: this.PrmCallback });
	}

	onPromiseBtnTap(item) { 
		this.navCtrl.push(PrmDisplayPage, { prm: item, callback: this.PrmCallback });
	}

	userHasAnActivePromise() {
		return this.model["prms"] !== undefined && this.model["prms"].length > 0;
	}

	getPointRecommendationCountPhrase(prm) {
		let str = prm.requiredPointsQuantity + " point";

		if (prm.requiredPointsQuantity > 1)
			str += "s";

		if (prm.requiredUserRecommendations.length > 0) {
			str += ", ";
			str += prm.requiredUserRecommendations.length;
			str += " recommendation";

			if (prm.requiredUserRecommendations.length > 1)
				str += "s";
		}

		return str;
	}

	getThumbnailImage(prm) {
		if (prm["imageFileURI"] !== undefined && prm["imageOrientation"] !== undefined)
			return prm["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getAvatarCSSClassString(prm) {
		if (prm["imageOrientation"] === 8)
			return "rotate90Counterclockwise centered";
		else if (prm["imageOrientation"] === 3)
			return "rotate180 centered";
		else if (prm["imageOrientation"] === 6)
			return "rotate90Clockwise centered";
		else
			return "centered";
	}
}