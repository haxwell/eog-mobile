import { Component, Input } from '@angular/core';
import { ModalController, NavController, NavParams, Events } from 'ionic-angular';

import { PrmPage } from '../../promises/promises'

import { Constants } from '../../../_constants/constants'

import { ProfilePictureService } from '../../../app/_services/profile-picture.service'
import { ProfileService } from '../_services/profile.service'
import { RequestsService } from '../../../app/_services/requests.service'
import { PrmMetadataService } from '../../../app/_services/prm-metadata.service';

@Component({
  selector: 'promise-line-item',
  templateUrl: 'promise-line-item.html'
})

export class PromiseLineItem {

	@Input() item = undefined;
	hasNecessaryRecommendations = undefined;
	isAlreadyRequested = undefined;
	hasSufficientTimePassed = undefined;
	arePrmRecommendationsRequired = undefined;
	hasBeenPreviouslyRequested	= undefined;
	hasSufficientPoints = undefined;
		
	constructor(navParams: NavParams, 
				private navCtrl: NavController,
				private modalCtrl: ModalController,
				private _constants: Constants,
				private _prmMetadataService: PrmMetadataService,
                _events: Events) {

	}

	ngOnInit() {

	}

	getNecessaryRecommendationsIconColor() {
		if (this.hasNecessaryRecommendations === undefined) {
			this.hasNecessaryRecommendations = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS).then((data) => {
				this.hasNecessaryRecommendations = data;
			})
		}

		return (this.hasNecessaryRecommendations === true) ? "green" : "red";
	}

	getAlreadyRequestedIconColor() {
		if (this.isAlreadyRequested === undefined) {
			this.isAlreadyRequested = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM).then((data) => {
				this.isAlreadyRequested = data;
			})
		}

		return (this.isAlreadyRequested === true) ? "red" : "green";
	}

	getSufficientTimeIconColor() {
		if (this.hasSufficientTimePassed === undefined) {
			this.hasSufficientTimePassed = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE).then((data) => {
				this.hasSufficientTimePassed = data;
			})
		}

		return (this.hasSufficientTimePassed === true) ? "green" : "red";
	}

	getSufficientPointsIconColor() {
		if (this.hasSufficientPoints === undefined) {
			this.hasSufficientPoints = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS).then((data) => {
				this.hasSufficientPoints = data;
			})
		}

		return (this.hasSufficientPoints === true) ? "green" : "red";
	}

	hasPrmBeenPreviouslyRequested() {
		if (this.hasBeenPreviouslyRequested === undefined) {
			this.hasBeenPreviouslyRequested = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM).then((data) => {
				this.hasBeenPreviouslyRequested = data;
			})
		}

		return this.hasBeenPreviouslyRequested;
	}

	areRecommendationsRequired() {
		if (this.arePrmRecommendationsRequired === undefined) {
			this.arePrmRecommendationsRequired = null;
			this._prmMetadataService.getMetadataValue(this.item, this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS).then((data) => {
				this.arePrmRecommendationsRequired = data;
			})
		}

		return this.arePrmRecommendationsRequired;
	}

	onViewPromise() {
      this.navCtrl.push(PrmPage, { prm: this.item, readOnly: true });
	}

	isPromiseImageAvailable() {
		return false;
	}

	getPromiseImageFilepath() {
		return undefined;
	}
}