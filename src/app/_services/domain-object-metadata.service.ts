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

	mapp = {}
	mapUserToMetadataResults = {};
	mapPropertyKeyToCalcFunction: Array<Object> = [];

	init() {
		this.mapp = {};
		this.mapUserToMetadataResults = {};
	}

	markDirty(params) {
		let user = params["user"] || this._userService.getCurrentUser()
		let domainObject = params["domainObject"];
		
		if (domainObject !== undefined && this.mapUserToMetadataResults[user["id"]] !== undefined ) {
			let filteredMap = this.mapUserToMetadataResults[user["id"]].filter((result) => { return result["domainObj"]["id"] !== domainObject["id"]; });
			this.mapUserToMetadataResults[user["id"]] = filteredMap;

			filteredMap = this.mapp[user["id"]].filter((result) => { return result["domainObj"]["id"] !== domainObject["id"]; });
			this.mapp[user["id"]] = filteredMap;
		}
	}

	addMetadataCalculationFunction(functionKey, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: functionKey, func: _func}); 
	}

	getMetadataValueResult(_domainObj, functionKey): Object {
		if (_domainObj === undefined) {
			console.log("ERROR: _domainObj cannot be undefined.");
			return undefined; // TODO Handle this error better
		}

		let rtn = undefined;
		let user = this._userService.getCurrentUser();

		if (this.mapUserToMetadataResults[user["id"]] === undefined) 
			this.mapUserToMetadataResults[user["id"]] = [];

		let obj = this.mapUserToMetadataResults[user["id"]].find((result) => {
			return result["domainObj"]["id"] === _domainObj["id"] && result["property"] === functionKey; 
		});

		if (obj === undefined) {
			let calcFunctionObject = this.getCalcFunctionObject(functionKey);
			let calcFunc: (Any) => Observable<any> = calcFunctionObject["func"];
			//if (calcFunctionObject["func"].hasOwnProperty('then'))

			obj = {domainObj: _domainObj, property: functionKey, value: calcFunc(_domainObj)};
			this.mapUserToMetadataResults[user["id"]].push(obj);
		}

		rtn = obj["value"];

		return rtn;
	}

	getCalcFunctionObject(functionKey) {
		return this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			});
	}

	getMetadataValue(_domainObj, functionKey) {
		if (this.mapPropertyKeyToCalcFunction.length === 0) {
			console.log("ERROR: MetadataService not initialized.");
			return undefined; // TODO: handle this error better
		}

		let user = this._userService.getCurrentUser();
		if (this.mapp[user["id"]] === undefined) {
			this.mapp[user["id"]] = [];
		}

		let obj = this.mapp[user["id"]].find((obj) => { 
			return 	(obj["domainObj"] === undefined && _domainObj === undefined) || 
					(obj["domainObj"]["id"] === _domainObj["id"] && obj["property"] === functionKey); 
		});

		if (obj === undefined) {
			let rtn : any = this.getMetadataValueResult(_domainObj, functionKey);

			if ( rtn !== undefined && typeof rtn.then == 'function' )
				 rtn.then((data) => {
					obj = {domainObj: _domainObj, property: functionKey, value: data};
					
					let oldObj = this.mapp[user["id"]].find((o) => { 
						return o["domainObj"]["id"] === _domainObj["id"] && o["property"] === functionKey; 
					})

					if (oldObj !== undefined)
						oldObj["value"] = data;
					else
						this.mapp[user["id"]].push(obj);
				});
			else {
				obj = {domainObj: _domainObj, property: functionKey, value: rtn};

				let oldObj = this.mapp[user["id"]].find((o) => { 
					return o["domainObj"]["id"] === _domainObj["id"] && o["property"] === functionKey; 
				})

				if (oldObj !== undefined)
					oldObj["value"] = rtn;
				else
					this.mapp[user["id"]].push(obj);
			}
		}

		return obj ? obj["value"] : undefined;
	}

}

