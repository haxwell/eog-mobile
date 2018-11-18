
export class UserServiceMock {
	public getCurrentUser(): any { 
	    return {id:1,name:"eogadmin",realname:"Eog A. Admin",email:"admin@eog.com",phone:"(303) 555-1212",enabled:1};
	};
}

export class ApiServiceMock {
	
}

export class PictureServiceMock {
	
}

export class OfferCollectionServiceMock {

	public resetModel(): any {

	}

	public getModel(): any {
		return {};
	}
}

export class OfferModelServiceMock {
	public setOfferImageOrientation(offer) : any {

	}
}