import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'
import { GeneralQualityService } from './general-quality.service'

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

export class RequestQualityService extends GeneralQualityService {
	
	constructor(protected _userService: UserService,
				protected _constants: Constants) {

		super(_userService, _constants);				
	}

	getQualityValue(_domainObj, functionKey): any {
		return super.getQualityValue(_domainObj, functionKey); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	init() {
		let self = this;
		self.addQualityCalculationFunction(
			self._constants.FUNCTION_KEY_REQUEST_IS_IN_PROGRESS, 
			(request) => {
					return request["deliveringStatusId"] === self._constants.REQUEST_STATUS_ACCEPTED;
			});
	}

}