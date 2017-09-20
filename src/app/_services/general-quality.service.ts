import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'

import 'rxjs/add/operator/map'; 
import 'rxjs/add/observable/of';
import {Observable} from 'rxjs/Observable';

@Injectable()

/*
	This class contains a set of functions, that are keyed by constants. Each function takes a Request,
	and returns something about it in relation to a user. So, if the user has sufficient points it will 
	return true. If the user has requested it in the past, it may return false. Etc.

	It works by having a list of functions, keyed by constants. Then an object keyed by User Id, which
	contains a value that is the promise which will return the value of the function. Then a third list
	contains a value that is the promise which will return the value of the function. Then a third list
	which is the return value of the promise in the aforementioned list.

	I think this could be powerful, an object and a list of functions which return some attribute about it,
	stored in memory. Updated as changes happen. etc. Carry on.
*/

export class GeneralQualityService {
	
	constructor(protected _userService: UserService,
				protected _constants: Constants) {

	}

	mapp = {}
	mapUserToQualityResults = {};
	mapPropertyKeyToCalcFunction: Array<Object> = [];

	init() {
		// TODO: do something a little more graceful than destory it all
		this.mapp = {};
		this.mapUserToQualityResults = {};
	}

	addQualityCalculationFunction(functionKey, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: functionKey, func: _func}); 
	}

	getQualityValueResult(_domainObj, functionKey): Object {
		let rtn = undefined;
		let user = this._userService.getCurrentUser();

		if (this.mapUserToQualityResults[user["id"]] === undefined) 
			this.mapUserToQualityResults[user["id"]] = [];

		let obj = this.mapUserToQualityResults[user["id"]].find((result) => {
			return result["domainObj"]["id"] === _domainObj["id"] && result["property"] === functionKey; 
		});

		if (obj === undefined) {
			let calcFunctionObject = this.getCalcFunctionObject(functionKey);
			let calcFunc: (Any) => Observable<any> = calcFunctionObject["func"];
			//if (calcFunctionObject["func"].hasOwnProperty('then'))

			obj = {domainObj: _domainObj, property: functionKey, value: calcFunc(_domainObj)};
			this.mapUserToQualityResults[user["id"]].push(obj);
		}

		rtn = obj["value"];

		return rtn;
	}

	getCalcFunctionObject(functionKey) {
		return this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			});
	}

	getQualityValue(_domainObj, functionKey) {
		let user = this._userService.getCurrentUser();
		if (this.mapp[user["id"]] === undefined) {
			this.mapp[user["id"]] = [];
		}

		let obj = this.mapp[user["id"]].find((obj) => { return obj["domainObj"]["id"] === _domainObj["id"] && obj["property"] === functionKey; });

		if (obj === undefined) {
			let rtn : any = this.getQualityValueResult(_domainObj, functionKey);

			if ( typeof rtn.then == 'function' )
				 rtn.then((data) => {
					obj = {domainObj: _domainObj, property: functionKey, value: data};
					this.mapp[user["id"]].push(obj);
				});
			else {
				obj = {domainObj: _domainObj, property: functionKey, value: rtn};
				this.mapp[user["id"]].push(obj);
			}
		}

		return obj ? obj["value"] : undefined;
	}

}

