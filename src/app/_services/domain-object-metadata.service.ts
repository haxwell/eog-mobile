import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'

import 'rxjs/add/operator/map'; 
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';

@Injectable()

/*
	Provides metadata about a domain object, as it relates to another domain object, in this case, a user.

	Metadata is provided by a function, which is associated with a unique key. When a call is made for that
	bit of metadata in association with a given domain object, the function is called, and its return value
	is returned to the caller.

	To implement, a service should extend this class. The extending class should initialize this class with
	the functions that provide the metadata it uses. To do this, in the init() method, call addMetadataCalculationFunction(functionKey, func).

	Then, to get a metadata value, call getMetadata(domainObject, functionKey).
*/

export class DomainObjectMetadataService {
	
	constructor(protected _userService: UserService,
				protected _constants: Constants) {

	}

	cachedValueValidityDuration = 15000;
	
	mapUserIdToCachedCalculationResultObjects = {}
	mapUserIdToInProgressCalculationObjects = {};
	mapPropertyKeyToCalcFunction: Array<Object> = [];

	init() {
		this.mapUserIdToCachedCalculationResultObjects = {};
		this.mapUserIdToInProgressCalculationObjects = {};
	}

	addMetadataCalculationFunction(functionKey, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: functionKey, func: _func}); 
	}

	getMetadataValue(_domainObject, functionKey) {
		let self = this;
		if (this.mapPropertyKeyToCalcFunction.length === 0) {
			console.log("ERROR: MetadataService not initialized.");
			return undefined; // TODO: handle this error better
		}

		if (!this.mapPropertyKeyToCalcFunction.some((obj) => { return obj["property"] === functionKey; })) {
			console.log("ERROR: Called MetadataService for a function key which is not defined.");
			return undefined;
		}

		let user = self._userService.getCurrentUser();
		if (self.mapUserIdToCachedCalculationResultObjects[user["id"]] === undefined) {
			self.mapUserIdToCachedCalculationResultObjects[user["id"]] = [];
		}

		// get the calculated value we saved the last time we came through here
		let obj = self.mapUserIdToCachedCalculationResultObjects[user["id"]].find((obj) => { 
			return self.isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(obj, _domainObject, functionKey);
		});

		// check if this calculated value from the last time has expired.. if so, refresh it.
		let time = new Date().getTime();
		if (obj != undefined && obj["expirationTime"] < time) {
			let coll = self.mapUserIdToCachedCalculationResultObjects[user["id"]].filter((obj) => {
				return !self.isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(obj, _domainObject, functionKey);
			})

			self.mapUserIdToCachedCalculationResultObjects[user["id"]] = coll;
			obj = undefined;
		}

		// if there is no calculated value from the last time
		if (obj === undefined) {

			let rtn = new Promise((resolve, reject) => {

				// then do the calculation
				let mvr : any = this.getMetadataValueResult(_domainObject, functionKey);

				// the result of the calculation will be either a Javascript Promise...
				if ( mvr !== undefined && typeof mvr.then == 'function' )
					 mvr.then((data) => {
					 	self.setValueForCachedCalculationResultObject(user, data, _domainObject, functionKey);
					 	resolve(data);
					});
				else { // the result of the calculation is an actual value, or object.
					self.setValueForCachedCalculationResultObject(user, mvr, _domainObject, functionKey);
					resolve(mvr);
				}
			});

			return rtn;
		}

		// return the calculated value from last time
		return new Promise((resolve, reject) => { resolve(obj["value"]); });
	}

	getMetadataValueResult(_domainObject, functionKey): Object {
		let self = this;
		if (_domainObject === undefined) {
			console.log("ERROR: _domainObject cannot be undefined.");
			return undefined; // TODO Handle this error better
		}

		let user = self._userService.getCurrentUser();
		if (self.mapUserIdToInProgressCalculationObjects[user["id"]] === undefined) 
			self.mapUserIdToInProgressCalculationObjects[user["id"]] = [];

		let obj = self.mapUserIdToInProgressCalculationObjects[user["id"]].find((result) => {
			return self.isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(result, _domainObject, functionKey);
		});

		// check if this calculated value from the last time has expired.. if so, refresh it.
		let time = new Date().getTime();
		if (obj != undefined && obj["expirationTime"] < time) {
			let coll = self.mapUserIdToInProgressCalculationObjects[user["id"]].filter((obj) => {
				return !self.isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(obj, _domainObject, functionKey);
			})

			self.mapUserIdToInProgressCalculationObjects[user["id"]] = coll;
			obj = undefined;
		}

		if (obj === undefined) {
			let calcFunctionObject = self.getCalcFunctionObject(functionKey);
			let calcFunc: (Any) => Observable<any> = calcFunctionObject["func"];

			obj = self.createDomainObjectMetadataCalculationObject(calcFunc(_domainObject), _domainObject, functionKey );
			self.mapUserIdToInProgressCalculationObjects[user["id"]].push(obj);
		}

		return obj["value"];
	}

	getCalcFunctionObject(functionKey) {
		return this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			});
	}

	setCachedValueValidityDuration(millis) {
		this.cachedValueValidityDuration = millis;
	}

	createDomainObjectMetadataCalculationObject(val, _domainObject, functionKey) {
		return {domainObject: _domainObject, property: functionKey, value: val, expirationTime: new Date().getTime() + this.cachedValueValidityDuration};
	}

	isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(calculationResultObject, domainObject, functionKey) {
		return 	calculationResultObject["domainObject"]["id"] === domainObject["id"] &&
				calculationResultObject["property"] === functionKey; 	
	}

	setValueForCachedCalculationResultObject(user, data, _domainObject, functionKey) {
		let self = this;
		
		let currentlyCachedCalculationResultObject = 
			self.mapUserIdToCachedCalculationResultObjects[user["id"]].find((o) => { 
				return self.isObjectTheResultOfTheGivenDomainObjectAndFunctionKey(o, _domainObject, functionKey);
			})

		if (currentlyCachedCalculationResultObject !== undefined) {
			currentlyCachedCalculationResultObject["value"] = data;
		}
		else {
			let obj = self.createDomainObjectMetadataCalculationObject(data, _domainObject, functionKey);
			self.mapUserIdToCachedCalculationResultObjects[user["id"]].push(obj);
		}
	}

	markDirty(params) {
		let user = params["user"] || this._userService.getCurrentUser()
		let domainObject = params["domainObject"];
		
		if (domainObject !== undefined && this.mapUserIdToInProgressCalculationObjects[user["id"]] !== undefined ) {
			let filteredMap = this.mapUserIdToInProgressCalculationObjects[user["id"]].filter((result) => { return result["domainObject"]["id"] !== domainObject["id"]; });
			this.mapUserIdToInProgressCalculationObjects[user["id"]] = filteredMap;

			filteredMap = this.mapUserIdToCachedCalculationResultObjects[user["id"]].filter((result) => { return result["domainObject"]["id"] !== domainObject["id"]; });
			this.mapUserIdToCachedCalculationResultObjects[user["id"]] = filteredMap;
		}
	}
}

