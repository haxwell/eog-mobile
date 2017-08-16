import { Injectable } from '@angular/core';

import { UserService } from '../../../../app/_services/user.service';
import { ApiService } from '../../../../app/_services/api.service';

import { environment } from '../../../../_environments/environment';

@Injectable()
export class RuleService {
	
	constructor(private _apiService: ApiService, private _userService: UserService) { }

}