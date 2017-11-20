import { TestBed } from '@angular/core/testing';
//import { IonicModule } from 'ionic-angular';

import { DomainObjectMetadataServiceComponent } from './domain-object-metadata.service.component';
import { DomainObjectMetadataService } from './domain-object-metadata.service';

import { Constants } from '../../_constants/constants';

import { UserService } from '../../app/_services/user.service'
import { UserServiceMock } from '../../../test-config/mocks-easyah'

describe('DomainObjectMetadata Service', () => {

	let fixture;
	let component;

	let domainObject1 = {id: 1, text: "one"};
	let domainObject2 = {id: 2, text: "two"};

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


  it('should return undefined if called before setting any functions', () => {
    let service = component.getService();
    let prm = service.getMetadataValue(domainObject1, "a_fake_function_key");
    expect(prm).toBe(undefined);
  })

  it('should return undefined if called with a function key that has not been defined', () => {
    let service = component.getService();
    let functionKey = "funcKey";

  	service.addMetadataCalculationFunction(functionKey, jasmine.createSpy("func"));

    let prm = service.getMetadataValue(domainObject1, "a_fake_function_key");
    expect(prm).toBe(undefined);
  })

  it('should return valid Promise if called with a function key that has been defined', () => {
    let service = component.getService();
    let functionKey = "funcKey";

  	service.addMetadataCalculationFunction(functionKey, (domainObject) => {
		    return new Promise((resolve, reject) => { domainObject["text"] += "happy"; resolve(domainObject); });
	  });

    let oldValue = domainObject1["text"];
    let prm = service.getMetadataValue(domainObject1, functionKey);
    expect(prm).not.toBe(undefined);
    expect(prm instanceof Promise).toBe(true);
    prm.then((domainObject) => { expect(domainObject["text"]).toBe(oldValue + "happy"); });
  })

  let _func1 = (len, func) => {
	    // given
      let service = component.getService();

	    let spy = jasmine.createSpy("foo");
	    let functionKey = "funcKey";

	  	service.addMetadataCalculationFunction(functionKey, spy);
	  	service.setCachedValueValidityDuration(len);
	  	expect(spy.calls.count()).toEqual(0);

	    // when
      service.getMetadataValue(domainObject1, functionKey);

	    // then
	    // wait, then execute our function
	    setTimeout(() => {
	    	service.getMetadataValue(domainObject1, functionKey);
	    	func(spy);
	    }, 2000);
	}

  it('should call the metadata function again if its cached data has existed longer than the cache validity duration', () => {
  		_func1(750, (spy) => {
	    	expect(spy.calls.count()).toBeGreaterThan(1);
	    });
  })

  it('should not call the metadata function again if its cached data has not existed longer than the cache validity duration', () => {
  		_func1(15000, (spy) => {
    		expect(spy.calls.count()).toEqual(1);
    	});
  })

  it('should reset its data, but not its functions when init() is called', () => {
    let service = component.getService();

  	let spy = jasmine.createSpy("foo")
  	let functionKey = "funcKey";

  	service.addMetadataCalculationFunction(functionKey, spy);

    let prm = service.getMetadataValue(domainObject1, functionKey);
    expect(spy).toHaveBeenCalled();
    expect(prm).not.toBe(undefined);
    expect(prm instanceof Promise).toBe(true);

    service.init();

    spy.calls.reset();

    prm = service.getMetadataValue(domainObject1, functionKey);
    expect(spy).toHaveBeenCalled();
    expect(prm).not.toBe(undefined); // this would be undefined if the function did not exist, as a previous test confirms
    expect(prm instanceof Promise).toBe(true);
  })

  it('should reset a single object when markDirty() is called', () => {
    let service = component.getService();

  	let spy = jasmine.createSpy("foo")
  	let functionKey = "funcKey";

  	service.addMetadataCalculationFunction(functionKey, spy);

    let prm = service.getMetadataValue(domainObject1, functionKey);
    expect(spy).toHaveBeenCalled();
    expect(prm).not.toBe(undefined);
    expect(prm instanceof Promise).toBe(true);

    prm = service.getMetadataValue(domainObject2, functionKey);
    expect(spy).toHaveBeenCalled();
    expect(prm).not.toBe(undefined);
    expect(prm instanceof Promise).toBe(true);

    service.markDirty({ domainObject: domainObject1 });

    spy.calls.reset();

    prm = service.getMetadataValue(domainObject1, functionKey);
    expect(spy).toHaveBeenCalled();

	spy.calls.reset();

	prm = service.getMetadataValue(domainObject2, functionKey);
    expect(spy).not.toHaveBeenCalled();
  })

});
