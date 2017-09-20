import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'

@Injectable()

/*
	This class contains a set of functions, that are keyed by constants. Each function takes a Request,
	and returns something about it in relation to a user. So, if the user has sufficient points it will 
	return true. If the user has requested it in the past, it may return false. Etc.

	It works by having a list of functions, keyed by constants. Then an object keyed by User Id, which
	contains a value that is the promise which will return the value of the function. Then a third list
	which is the return value of the promise in the aforementioned list.

	I think this could be powerful, an object and a list of functions which return some attribute about it,
	stored in memory. Updated as changes happen. etc. Carry on.
*/

export class RequestQualityService {
	
	constructor(private _userService: UserService,
				private _constants: Constants) {

	}

	mapp = {}
	mapUserToRequestQualityResults = {};
	mapPropertyKeyToCalcFunction: Array<Object> = [];

	init() {
		this.initRequestQualityCalculationFunctions();

		// TODO: do something a little more graceful than destory it all
		this.mapp = {};
		this.mapUserToRequestQualityResults = {};
	}

	initRequestQualityCalculationFunctions() {
		let self = this;
		self.mapUserToRequestQualityResults = {};
		self.mapPropertyKeyToCalcFunction = []; 

		self.defineRequestQualityCalculationFunction(
			self._constants.FUNCTION_KEY_REQUEST_IS_IN_PROGRESS, 
			(request) => {
					return request["deliveringStatusId"] === self._constants.REQUEST_STATUS_ACCEPTED;
			});
	}

	getQualityValueResult(_request, functionKey) {
		let rtn = undefined;
		let user = this._userService.getCurrentUser();

		if (this.mapUserToRequestQualityResults[user["id"]] === undefined) 
			this.mapUserToRequestQualityResults[user["id"]] = [];

		let obj = this.mapUserToRequestQualityResults[user["id"]].find((result) => {
			return result["request"]["id"] === _request["id"] && result["property"] === functionKey; 
		});

		if (obj === undefined) {
			let calcFunctionObject = this.getCalcFunctionObject(functionKey);
			let calcFunc: (Any) => Object = calcFunctionObject["func"];

			obj = {request: _request, property: functionKey, value: calcFunc(_request)};
			this.mapUserToRequestQualityResults[user["id"]].push(obj);
		}

		rtn = obj["value"];

		return rtn;
	}

	defineRequestQualityCalculationFunction(key, _func) {
		this.mapPropertyKeyToCalcFunction.push({property: key, func: _func});
	}

	getCalcFunctionObject(functionKey) {
		return this.mapPropertyKeyToCalcFunction.find((propKeyToFunctionObj) => {
				return (functionKey === propKeyToFunctionObj["property"]);
			});
	}

	getQualityValue(_request, functionKey) {
		let user = this._userService.getCurrentUser();
		if (this.mapp[user["id"]] === undefined) {
			this.mapp[user["id"]] = [];
		}

		let obj = this.mapp[user["id"]].find((obj) => { return obj["request"]["id"] === _request["id"] && obj["property"] === functionKey; });

		if (obj === undefined) {
			let rtn = this.getQualityValueResult(_request, functionKey);

			if ( typeof rtn.then == 'function' )
				 rtn.then((data) => {
					obj = {request: _request, property: functionKey, value: data};
					this.mapp[user["id"]].push(obj);
				});
			else {
				obj = {request: _request, property: functionKey, value: rtn};
				this.mapp[user["id"]].push(obj);
			}
		}

		return obj ? obj["value"] : undefined;
	}

}