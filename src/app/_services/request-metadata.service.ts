import { Injectable } from '@angular/core';

import { UserService } from './user.service';

import { Constants } from '../../_constants/constants'
import { DomainObjectMetadataService } from './domain-object-metadata.service'

@Injectable()
export class RequestMetadataService extends DomainObjectMetadataService {
	
	constructor(protected _userService: UserService,
				protected _constants: Constants) {

		super(_userService, _constants);				
	}

	getMetadataValue(_domainObj, functionKey): any {
		return super.getMetadataValue(_domainObj, functionKey); // can I avoid doing this? Why isn't the parent method just called automagically?
	}

	init() {
		let self = this;
		self.addMetadataCalculationFunction(
			self._constants.FUNCTION_KEY_REQUEST_IS_IN_PROGRESS, 
			(request) => {
					return request["deliveringStatusId"] === self._constants.REQUEST_STATUS_ACCEPTED;
			});
	}

}