import { NgModule, Component } from '@angular/core';

import { DomainObjectMetadataService } from './domain-object-metadata.service';

@Component({
  selector: 'domainobjectmetadataservicecomponent',
  template: `<div></div>`
})
export class DomainObjectMetadataServiceComponent {
	constructor(private srvc: DomainObjectMetadataService) {

	}

	getService(): DomainObjectMetadataService {
		return this.srvc;
	}
}

@NgModule({
	declarations: [ DomainObjectMetadataServiceComponent ],
	providers: [ DomainObjectMetadataService ]
})
class DomainObjectMetadataServiceComponentModule { }