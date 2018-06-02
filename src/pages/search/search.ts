import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { Constants } from '../../_constants/constants'

import { PrmDisplayPage } from '../promises/display.prm'
import { ProfilePage } from '../profile/profile'

import { SearchService } from '../../app/_services/search.service';
import { ProfileService } from '../common/_services/profile.service';
import { ProfilePictureService } from '../../app/_services/profile-picture.service';
import { PointsService } from '../../app/_services/points.service';
import { PrmMetadataService } from '../../app/_services/prm-metadata.service';
import { UserService } from '../../app/_services/user.service';
import { RecommendationService } from '../../app/_services/recommendation.service';

@Component({
  selector: 'page-search',
  templateUrl: 'search.html'
})
export class SearchPage {
	searchString = '';
	prmResults = undefined;
	usersResults = undefined;
	dirty = false;
	loading = undefined;

	requestsPromise = undefined;

	hasNecessaryRecommendations = [];
	isAlreadyRequested = [];
	hasSufficientTimePassed = [];
	arePrmRecommendationsRequired = [];
	hasBeenPreviouslyRequested	= [];
	hasSufficientPoints = [];

	constructor(navParams: NavParams,
				public navCtrl: NavController,
				private _searchService: SearchService,
				private _pointsService: PointsService,
				private _profileService: ProfileService,
				private _profilePictureService: ProfilePictureService,
				private _userService: UserService,
				private _recommendationService: RecommendationService,
				private _prmMetadataService: PrmMetadataService,
				private loadingCtrl: LoadingController,
				private _constants: Constants,
				_events: Events) {

		this.searchString = navParams.get('searchString') || '';

		let func = (data) => {
			let prm = data["request"]["prm"];
			
			this.hasNecessaryRecommendations[prm["id"]] = undefined;
			this.arePrmRecommendationsRequired[prm["id"]] = undefined;
			this.isAlreadyRequested[prm["id"]] = undefined;
			this.hasSufficientPoints[prm["id"]] = undefined;
			this.hasSufficientTimePassed[prm["id"]] = undefined;
			this.hasBeenPreviouslyRequested[prm["id"]] = undefined;

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

		this.setDirty(false);

		if (this.searchString !== '')
			this.onSearchBtnTap();
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

		this.usersResults = undefined;
		this.prmResults = undefined;

		this._searchService.searchPrms(this.searchString).then((data: Array<Object>) => {
			//self.ngOnInit();

			if (data.length === 0) {
				self.prmResults = data;

				if (self.usersResults !== undefined)
					self.loading.dismiss();
			} else {
				data.map((obj) => {
					self._userService.getUser(obj["userId"]).then((user) => {
						obj["directionallyOppositeUser"] = user;
						delete obj["userId"];

						if (!data.some((obj) => { return obj["userId"] != undefined; })) {
							self.prmResults = data;
							
							if (self.usersResults !== undefined)
								self.loading.dismiss();
						}
					});
				});
			}
		});

		this._searchService.searchUsers(this.searchString).then((data: Array<Object>) => {
			//self.ngOnInit();

			self.usersResults = data;

			if (self.prmResults !== undefined) {
				self.loading.dismiss();
			}
		});
	}

	getSearchQuery() {
		return this.searchString;
	}

	onQueryChanged(event) {
		this.searchString = event._value;
	}

	getPromiseResults() {
		return this.prmResults;
	}

	getUsersResults() {
		if (this.usersResults !== undefined) {
			let currentUser = this._userService.getCurrentUser();
			return this.usersResults.filter((o) => { return o["id"] !== currentUser["id"]; });
		} else {
			return this.usersResults;
		}
	}

	profileImageFilepath = [];
	getProfileImageFilepath(user) {
		return this.profileImageFilepath[user["id"]];
	}

	isProfileImageAvailable(user) {
		let rtn = this.profileImageFilepath[user["id"]] !== undefined && this.profileImageFilepath[user["id"]] !== null;

		let self = this;
		if (this.profileImageFilepath[user["id"]] === undefined) {

			this.profileImageFilepath[user["id"]] = null;

			let path = self._profileService.getMostProbableProfilePhotoPath(user["id"]);

			console.log("No Profile Image loaded for user Id " + user["id"] + ". Trying to find one... " + path);			
			
			self._profilePictureService.get(user["id"], path).then((path) => {
				if (path !== undefined)
					self.profileImageFilepath[user["id"]] = path;
			});
		}

		return rtn; 
	}

	isPromiseImageAvailable(prm) {
		return false;
	}

	getPromiseImageFilepath(prm) {
		return undefined;
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

	onViewUser(user) {
		this.navCtrl.push(ProfilePage, {user: user});
	}

	/** Delete these?? **/
	getTrackPrm(prm) {
		return "prm";
	}

	getTrackUser(user) {
		return "user";
	}

}
