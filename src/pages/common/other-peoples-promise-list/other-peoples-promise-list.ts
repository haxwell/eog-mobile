import { Component, Input } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import { PrmDisplayPage } from '../../promises/display.prm'

import { Constants } from '../../../_constants/constants'

import { PrmMetadataService } from '../../../app/_services/prm-metadata.service';
import { PointsService } from '../../../app/_services/points.service';
import { RecommendationService } from '../../../app/_services/recommendation.service';

@Component({
  selector: 'other-peoples-promise-list',
  templateUrl: 'other-peoples-promise-list.html'
})

export class OtherPeoplesPromiseList {

	@Input() prms = undefined;

	hasNecessaryRecommendations = [];
	isAlreadyRequested = [];
	hasSufficientTimePassed = [];
	arePrmRecommendationsRequired = [];
	hasBeenPreviouslyRequested	= [];
	hasSufficientPoints = [];

	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private _constants: Constants,
				private _prmMetadataService: PrmMetadataService,
				private _pointsService: PointsService,
				private _recommendationService: RecommendationService,
                _events: Events) {

		let func = (data) => {
			let prm = data["request"]["prm"];
			
			this.hasNecessaryRecommendations[prm["id"]] = undefined;
			this.arePrmRecommendationsRequired[prm["id"]] = undefined;
			this.isAlreadyRequested[prm["id"]] = undefined;
			this.hasSufficientPoints[prm["id"]] = undefined;
			this.hasSufficientTimePassed[prm["id"]] = undefined;
			this.hasBeenPreviouslyRequested[prm["id"]] = undefined;

			this._prmMetadataService.markDirty({domainObject: prm});

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
		this._prmMetadataService.init();
	}

	getListOfPromises() {
		return this.prms;
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

	getAlreadyRequestedIconColor(prm) {
		if (this.isAlreadyRequested[prm["id"]] === undefined) {
			this.isAlreadyRequested[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM).then((data) => {
				this.isAlreadyRequested[prm["id"]] = data;
			})
		}

		return (this.isAlreadyRequested[prm["id"]] === true) ? "red" : "green";
	}

	getSufficientTimeIconColor(prm) {
		if (this.hasSufficientTimePassed[prm["id"]] === undefined) {
			this.hasSufficientTimePassed[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE).then((data) => {
				this.hasSufficientTimePassed[prm["id"]] = data;
			})
		}

		return (this.hasSufficientTimePassed[prm["id"]] === true) ? "green" : "red";
	}

	getSufficientPointsIconColor(prm) {
		if (this.hasSufficientPoints[prm["id"]] === undefined) {
			this.hasSufficientPoints[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS).then((data) => {
				this.hasSufficientPoints[prm["id"]] = data;
			})
		}

		return (this.hasSufficientPoints[prm["id"]] === true) ? "green" : "red";
	}

	hasPrmBeenPreviouslyRequested(prm) {
		if (this.hasBeenPreviouslyRequested[prm["id"]] === undefined) {
			this.hasBeenPreviouslyRequested[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM).then((data) => {
				this.hasBeenPreviouslyRequested[prm["id"]] = data;
			})
		}

		return this.hasBeenPreviouslyRequested[prm["id"]];
	}

	areRecommendationsRequired(prm) {
		if (this.arePrmRecommendationsRequired[prm["id"]] === undefined) {
			this.arePrmRecommendationsRequired[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS).then((data) => {
				this.arePrmRecommendationsRequired[prm["id"]] = data;
			})
		}

		return this.arePrmRecommendationsRequired[prm["id"]];
	}

	getNecessaryRecommendationsIconColor(prm) {
		if (this.hasNecessaryRecommendations[prm["id"]] === undefined) {
			this.hasNecessaryRecommendations[prm["id"]] = null;
			this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS).then((data) => {
				this.hasNecessaryRecommendations[prm["id"]] = data;
			})
		}

		return (this.hasNecessaryRecommendations[prm["id"]] === true) ? "green" : "red";
	}

	onViewPromise(prm) {
      this.navCtrl.push(PrmDisplayPage, { prm: prm });
	}
}