import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { PrmPage } from '../promises/promises'

import { SearchService } from '../../app/_services/search.service';
import { PointsService } from '../../app/_services/points.service';
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { UserService } from '../../app/_services/user.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

import { Constants } from '../../_constants/constants';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = 'denv';
	resultList = undefined;
	dirty = false;
	loading = undefined;

	requestsPromise = undefined;

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private _pointsService: PointsService,
				private _userService: UserService,
				private _recommendationService: RecommendationService,
				private _prmMetadataService: PrmMetadataService,
				private loadingCtrl: LoadingController,
				_events: Events,
				private _constants: Constants) {

		let func = (data) => {
			// a declined event means points that were escrowed have become available,
			//  so that means the state rules, (sufficient points, already requested, necessary recommends)
			//  need to be recalculated. So init everything.
			this.ngOnInit(); 
		};

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

		this.setDirty(false);
	}

	ionViewWillEnter() {
		if (this.isDirty()) 
			this.ngOnInit();
	}

	isDirty() {
		return this.dirty;
	}

	setDirty(b) {
		this.dirty = b;
	}

	onSearchBtnTap(evt?) {
		let self = this;
		self.loading = self.loadingCtrl.create({
			content: 'Please wait...'
		})

		self.loading.present();

		this._searchService.searchPrms(this.searchString).then((data: Array<Object>) => {
			self.ngOnInit();

			data.map((obj) => {
				self._userService.getUser(obj["userId"]).then((user) => {
					obj["directionallyOppositeUser"] = user;
					delete obj["userId"];

					if (!data.some((obj) => { return obj["userId"] != undefined; })) {
						self.resultList = data;
						self.loading.dismiss();
					}
				});
			});
		});
	}

	getNecessaryRecommendationsIconColor(prm) {
		if (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_NECESSARY_RECOMMENDATIONS) === true)
			return "green";
		else
			return "red";
	}

	getAlreadyRequestedIconColor(prm) {
		if (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_CURRENTLY_REQUESTED_PRM) === false)
			return "green";
		else
			return "red";
	}

	getSufficientTimeIconColor(prm) {
		if (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_IS_PAST_REQUEST_AGAIN_DATE) === true)
			return "green";
		else
			return "red";
	}

	getSufficientPointsIconColor(prm) {
		if (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_SUFFICIENT_POINTS) === true)
			return "green";
		else
			return "red";
	}

	hasPrmBeenPreviouslyRequested(prm) {
		return (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_USER_HAS_PREVIOUSLY_REQUESTED_PRM) === true);
	}

	areRecommendationsRequired(prm) {
		return (this._prmMetadataService.getMetadataValue(prm, this._constants.FUNCTION_KEY_PRM_REQUIRES_RECOMMENDATIONS) === true);	
	}

	prmCallback = (_params) => {
		return new Promise((resolve, reject) => {
			//this.onSearchBtnTap();
			this.setDirty(true);
			resolve();
		});
	}

	showPromiseDetail(prm) {
		this.navCtrl.push(PrmPage, { prm: prm, readOnly: true, callback: this.prmCallback });
	}
}
