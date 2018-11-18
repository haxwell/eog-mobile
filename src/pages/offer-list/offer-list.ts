import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';

import { OfferEditPage } from '../offers/edit.offer'
import { OfferDisplayPage } from '../offers/display.offer'

import { OfferCollectionService } from '../../app/_services/offer-collection.service'
import { PictureService } from '../../app/_services/picture.service'

@Component({
  selector: 'offer-list',
  templateUrl: 'offer-list.html'
})

/**
 *
 * Displays a list of offers owned by the current user.
 *  
 */
export class OfferListPage {

	model = {};
	dirty = undefined;

	constructor(private _offerCollectionService : OfferCollectionService,
				private _pictureService : PictureService,
				private navCtrl : NavController,
				private _events: Events
	) {
		this.setDirty(true);

		let func = () => {
			this.setDirty(true);
			this.ngOnInit()
		}

		this._events.subscribe('offer:saved', func);
		this._events.subscribe('offer:deleted', func);
	}

	ngOnInit() {
		if (this.isDirty()) {
			this.setDirty(false);
			this._offerCollectionService.resetModel();
			this.model = this._offerCollectionService.getModel();
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

	OfferCallback = (_params) => {
		return new Promise((resolve, reject) => {
			this.setDirty(_params === true);
			resolve();
		});
	}

	getOffers() {
		return this.model["offers"];
	}

	onNewOfferBtnTap() {
		this.navCtrl.push(OfferEditPage, { offer: undefined, callback: this.OfferCallback });
	}

	onOfferBtnTap(item) { 
		this.navCtrl.push(OfferDisplayPage, { offer: item, callback: this.OfferCallback });
	}

	userHasAnActiveOffer() {
		return this.model["offers"] !== undefined && this.model["offers"].length > 0;
	}

	getPointRecommendationCountPhrase(offer) {
		let str = offer.requiredPointsQuantity + " point";

		if (offer.requiredPointsQuantity > 1)
			str += "s";

		if (offer.requiredUserRecommendations.length > 0) {
			str += ", ";
			str += offer.requiredUserRecommendations.length;
			str += " recommendation";

			if (offer.requiredUserRecommendations.length > 1)
				str += "s";
		}

		return str;
	}

	getThumbnailImage(offer) {
		if (offer["imageFileURI"] !== undefined && offer["imageOrientation"] !== undefined)
			return offer["imageFileURI"];
		else
			return "assets/img/mushroom.jpg";
	}

	getAvatarCSSClassString(offer) {
        return this._pictureService.getOrientationCSS(offer);
	}
}
