import { Component } from '@angular/core';
import { NavController, ModalController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { PrmPage } from '../promises/promises'
import { PrmDisplayPage } from '../promises/display.prm'
import { DeletePrmPage } from '../promises/_pages/delete.prm'

import { PrmCollectionService } from '../../app/_services/prm-collection.service'


@Component({
  selector: 'promise-list',
  templateUrl: 'promise-list.html'
})

export class PromiseListPage {

	model = {};
	dirty = undefined;

	constructor(private _prmcService : PrmCollectionService,
				private navCtrl : NavController,
				private modalCtrl : ModalController,
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
		this.dirty = b || true;
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
		this.navCtrl.push(PrmPage, { prm: undefined, callback: this.PrmCallback });
	}

	onPromiseBtnTap(item) { 
		this.navCtrl.push(PrmDisplayPage, { prm: item, callback: this.PrmCallback });
	}

	onDeletePromise(prm) {
		let modal = this.modalCtrl.create(DeletePrmPage, {prm: prm});
		modal.onDidDismiss(data => { if (data === true) console.log("TODO: Update The UI when Promise is deleted by a swipe left"); } );
		modal.present();
	}

	userHasAnActivePromise() {
		return this.model["prms"] !== undefined && this.model["prms"].length > 0;
	}

	getPromiseAvatarImage(prm) {
		return "assets/img/mushroom.jpg";
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
}