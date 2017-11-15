
// The point of this class is to allow calling a function, getting a promise, 
//  and saving it. Then using the promise over and over, rather than making 
//  a new promise and new api call.

// It takes an ID, the result ID, and maps it to a promise, which is the result
// of a function.

// So for instance the result ID could be the user ID, and the function, a call
// to download a file and return the local filename. You could call that function
// over and over, and only call the API once.

export class FunctionPromiseService { 
	
	results = {};
	funcs = {};

	constructor() {

	}

	reset(resultKey) {
		this.results[resultKey] = undefined;
	}

	initFunc(funcKey, func) {
		this.funcs[funcKey] = func;
	}

	get(resultKey, funcKey, data) {
		if (this.results[resultKey] !== undefined) {
			console.log("FPS: resultKey " + resultKey +" already had results. Returning.");
			return this.results[resultKey];
		}

		let func = this.funcs[funcKey];

		if (func !== undefined) {
			console.log("FPS: resultKey " + resultKey +" calling the func, and saving its result.");
			this.results[resultKey] = func(resultKey, data);
		}

		console.log("FPS: resultKey " + resultKey +" returning the result.");
		return this.results[resultKey];
	}

	// TODO: Do we want a put method? Or should we just reset, and call get() again?
	put(resultKey, value) {
		console.log("FPS: resultKey " + resultKey +" Oh look.. this is actually used..");
		this.results[resultKey] = new Promise((resolve, reject) => {
			resolve(value);
		})
	}
}


