//import { beforeEach, beforeEachProviders, describe, 
//			expect, it, inject, injectAsync } from 'angular2/testing';

import { TestBed } from '@angular/core/testing';
import { IonicModule } from 'ionic-angular';

import { DomainObjectMetadataServiceComponent } from './domain-object-metadata.service.component';
import { DomainObjectMetadataService } from './domain-object-metadata.service';

import { Constants } from '../../_constants/constants';

import { UserService } from '../../app/_services/user.service'
import { UserServiceMock } from '../../../test-config/mocks-easyah'

describe('DomainObjectMetadata Service', () => {

	let fixture;
	let component;

	let mockUserService: UserServiceMock;

  	beforeEach(() => {
  		mockUserService = new UserServiceMock();

  		TestBed.configureTestingModule({
  		declarations: [
  			DomainObjectMetadataServiceComponent
  		],
  		providers: [
  			DomainObjectMetadataService,
  			Constants,
  			{ provide: UserService, useValue: mockUserService }
  		]});

  		fixture = TestBed.createComponent(DomainObjectMetadataServiceComponent);
		component = fixture.componentInstance;
	});

  it('should be created', () => {
    expect(component instanceof DomainObjectMetadataServiceComponent).toBe(true);

    let service = component.getService();
    expect(service instanceof DomainObjectMetadataService).toBe(true);
  });

});
