import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import { SearchService } from '../../app/_services/search.service';
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

	constructor(public navCtrl: NavController, 
				private _searchService: SearchService,
				private _pointsService: PointsService,
				private _userService: UserService,
				private _recommendationService: RecommendationService,
				private _prmMetadataService: PrmMetadataService,
				private loadingCtrl: LoadingController,
				_events: Events) {

		let func = (data) => {
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
		let currentUser = this._userService.getCurrentUser();
		return this.usersResults.filter((o) => { return o["id"] !== currentUser["id"]; });
	}

	areUsersResultsAvailable() {
		return this.usersResults !== undefined && this.usersResults.length > 0;
	}

	arePromiseResultsAvailable() {
		return this.prmResults !== undefined && this.prmResults.length > 0;
	}	
}
