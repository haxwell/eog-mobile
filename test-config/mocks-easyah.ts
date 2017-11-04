//import { StatusBar } from '@ionic-native/status-bar';

export class UserServiceMock {

public getCurrentUser(): any { 
    return {id:1,name:"eogadmin",realname:"Eog A. Admin",email:"admin@eog.com",phone:"(303) 555-1212",enabled:1};
};

}
