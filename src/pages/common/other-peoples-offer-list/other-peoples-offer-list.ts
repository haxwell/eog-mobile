import { Component, Input } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { OfferDisplayPage } from '../../offers/display.offer'

import { Constants } from '../../../_constants/constants'

import { OfferMetadataService } from '../../../app/_services/offer-metadata.service';
import { PointsService } from '../../../app/_services/points.service';
import { PictureService } from '../../../app/_services/picture.service';
import { RecommendationService } from '../../../app/_services/recommendation.service';

@Component({
  selector: 'other-peoples-offer-list',
  templateUrl: 'other-peoples-offer-list.html'
})

export class OtherPeoplesOfferList {

	@Input() offers = undefined;

	hasNecessaryRecommendations = [];
	isAlreadyRequested = [];
	hasSufficientTimePassed = [];
	areOfferRecommendationsRequired = [];
	hasBeenPreviouslyRequested	= [];
	hasSufficientPoints = [];

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private _constants: Constants,
				private _offerMetadataService: OfferMetadataService,
				private _pointsService: PointsService,
				private _pictureService: PictureService,
				private _recommendationService: RecommendationService,
                _events: Events) {

		let func = (data) => {
			let offer = data["request"]["offer"];
			
			this.hasNecessaryRecommendations[offer["id"]] = undefined;
			this.areOfferRecommendationsRequired[offer["id"]] = undefined;
			this.isAlreadyRequested[offer["id"]] = undefined;
			this.hasSufficientPoints[offer["id"]] = undefined;
			this.hasSufficientTimePassed[offer["id"]] = undefined;
			this.hasBeenPreviouslyRequested[offer["id"]] = undefined;

			this._offerMetadataService.markDirty({domainObject: offer});

			this.ngOnInit(); 
		};

		_events.subscribe('request:saved', func);
		_events.subscribe('request:declined', func);
		_events.subscribe('request:deleted', func);
		_events.subscribe('request:completedAndAccepted', func);
		_events.subscribe('recommendation:received', func);
		_events.subscribe('points:received', func);
	}

	ngOnInit() {
		this._recommendationService.init();
		this._pointsService.init();
		this._offerMetadataService.init();
	}

	getListOfOffers() {
		return this.offers;
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

	getAlreadyRequestedIconColor(offer) {
		if (this.isAlreadyRequested[offer["id"]] === undefined) {
			this.isAlreadyRequested[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_OFFER).then((data) => {
				this.isAlreadyRequested[offer["id"]] = data;
			})
		}

		return (this.isAlreadyRequested[offer["id"]] === true) ? "red" : "green";
	}

	getSufficientTimeIconColor(offer) {
		if (this.hasSufficientTimePassed[offer["id"]] === undefined) {
			this.hasSufficientTimePassed[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE).then((data) => {
				this.hasSufficientTimePassed[offer["id"]] = data;
			})
		}

		return (this.hasSufficientTimePassed[offer["id"]] === true) ? "green" : "red";
	}

	getSufficientPointsIconColor(offer) {
		if (this.hasSufficientPoints[offer["id"]] === undefined) {
			this.hasSufficientPoints[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS).then((data) => {
				this.hasSufficientPoints[offer["id"]] = data;
			})
		}

		return (this.hasSufficientPoints[offer["id"]] === true) ? "green" : "red";
	}

	hasOfferBeenPreviouslyRequested(offer) {
		if (this.hasBeenPreviouslyRequested[offer["id"]] === undefined) {
			this.hasBeenPreviouslyRequested[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_OFFER).then((data) => {
				this.hasBeenPreviouslyRequested[offer["id"]] = data;
			})
		}

		return this.hasBeenPreviouslyRequested[offer["id"]];
	}

	areRecommendationsRequired(offer) {
		if (this.areOfferRecommendationsRequired[offer["id"]] === undefined) {
			this.areOfferRecommendationsRequired[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_OFFER_REQUIRES_RECOMMENDATIONS).then((data) => {
				this.areOfferRecommendationsRequired[offer["id"]] = data;
			})
		}

		return this.areOfferRecommendationsRequired[offer["id"]];
	}

	getNecessaryRecommendationsIconColor(offer) {
		if (this.hasNecessaryRecommendations[offer["id"]] === undefined) {
			this.hasNecessaryRecommendations[offer["id"]] = null;
			this._offerMetadataService.getMetadataValue(offer, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS).then((data) => {
				this.hasNecessaryRecommendations[offer["id"]] = data;
			})
		}

		return (this.hasNecessaryRecommendations[offer["id"]] === true) ? "green" : "red";
	}

	onViewOffer(_offer) {
      this.navCtrl.push(OfferDisplayPage, { offer: _offer });
	}
}