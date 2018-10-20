import autoBind from 'auto-bind';

/**
 * Default options
 */
export const defaults = {
	detectLineEnding: false,
	lineEnding: "\r\n",
	sectionOpenIdentifier: '[',
	sectionCloseIdentifier: ']',
	defaultValue: true,
	assignIdentifier: "=",
	commentIdentifiers: [";"],
	trimLines: true
};

/**
 * @param {string} string
 * @param {string[]} stringList
 * @return {boolean}
 */
export const stringBeginsWithOneOfTheseStrings = (string, stringList) => {
	return Boolean(stringList.filter(_ => _).filter(str => string.startsWith(str)).length);
};

/**
 * Try to detect the used line ending
 * (windows, unix, mac)
 * @param {string} data
 * @return {string}
 */
export const detectLineEnding = data => {
	const hasCaridgeReturn = data.indexOf("\r") !== -1;
	const hasLineFeed = data.indexOf("\n") !== -1

	if (hasCaridgeReturn && hasLineFeed) {
		if (data.indexOf("\r\n") !== -1) {
			return "\r\n";
		} else if (data.indexOf("\n\r") !== -1) {
			return "\n\r";
		} else {
			throw new Error('Found multiple line endings');
		}
	} else if (hasLineFeed) {
		return "\n";
	} else if (hasCaridgeReturn) {
		return "\r";
	} else {
		return "\n";
	}
};

/**
 * Decode a config-string
 * 
 * @param {string} data
 * @return {{}}
 */
export const decode = (data, options = {}) => {
	if (typeof data != 'string') {
		if (typeof data.toString === 'function') {
			data = data.toString();
		} else {
			throw new Error(`Expecting string but got ${typeof data}`);
		}
	}

	// Set defaults
	options = {
		...defaults,
		...options
	};

	const { trimLines, commentIdentifiers, sectionOpenIdentifier, sectionCloseIdentifier, assignIdentifier, defaultValue } = options;
	const lineEnding = options.detectLineEnding ? detectLineEnding(data) : options.lineEnding;

	let result = {};
	let currentSection = undefined;
	const lines = data.split(lineEnding);
	for (var i = 0; i < lines.length; i++) {
		const line = trimLines ? lines[i].trim() : lines[i];

		if (line.length == 0 || stringBeginsWithOneOfTheseStrings(line, commentIdentifiers)) {
			continue;
		}

		var sectionRegExp = new RegExp("^\\" + sectionOpenIdentifier + "(.*?)\\" + sectionCloseIdentifier + "$");
		var newSection = line.match(sectionRegExp);
		if (newSection !== null) {
			currentSection = newSection[1];
			if (typeof result[currentSection] === 'undefined') {
				result[currentSection] = {};
			}
			continue;
		}

		var assignPosition = line.indexOf(assignIdentifier);
		var key = undefined;
		var value = undefined;
		if (assignPosition === -1) {
			key = line;
			value = defaultValue;
		} else {
			key = line.substr(0, assignPosition);
			value = line.substr(assignPosition + assignIdentifier.length);
		}
		if (typeof currentSection === 'undefined') {
			result[key] = value;
		} else {
			result[currentSection][key] = value;
		}
	}
	return result;
};

/**
 * Encode a object
 * no nesting section supported!
 * 
 * @param {{}} object
 * @return {string}
 */
export const encode = (object, options = {}) => {
	// Set defaults
	options = {
		...defaults,
		...options
	};
	const { sectionCloseIdentifier, sectionOpenIdentifier, assignIdentifier } = options;
	const lineEnding = options.detectLineEnding ? detectLineEnding(options.lineEnding) : options.lineEnding;

	let resultSections = "";
	let resultAttributesWithoutSection = "";

	const sections = Object.keys(object);
	for (let i = 0; i < sections.length; i++) {
		if (typeof object[sections[i]] === 'object') {
			if (resultSections != "") {
				resultSections += lineEnding;
			}
			resultSections += sectionOpenIdentifier;
			resultSections += sections[i];
			resultSections += sectionCloseIdentifier;
			resultSections += lineEnding;
			const attributes = Object.keys(object[sections[i]]);
			for (let j = 0; j < attributes.length; j++) {
				resultSections += attributes[j];
				resultSections += assignIdentifier;
				resultSections += object[sections[i]][attributes[j]];
				resultSections += lineEnding;
			}
		} else {
			resultAttributesWithoutSection += sections[i];
			resultAttributesWithoutSection += assignIdentifier;
			resultAttributesWithoutSection += object[sections[i]];
			resultAttributesWithoutSection += lineEnding;
		}
	}
	return resultAttributesWithoutSection + resultSections;
};

/**
 * Encode and decode ini/conf/cfg files
 * @author Rolf Loges
 * @licence MIT
 */
export default class Config {
	/**
	 * Creates an instance of Config.
	 * @param {String} raw Raw config string
	 * @param {Object} options Options
	 * @param {String} options.lineEnding
	 * @param {String} options.sectionOpenIdentifier
	 * @param {String} options.sectionCloseIdentifier
	 * @param {Boolean} options.defaultValue
	 * @param {String} options.assignIdentifier
	 * @param {Array} options.commentIdentifiers
	 * @param {Boolean} options.trimLines
	 * @memberof Config
	 */
	constructor(raw, options = {}) {
		// Allow first arg to be options
		if (typeof raw === 'object') {
			options = raw;
			raw = '';
		}

		this.options = {
			...defaults,
			...options
		};
		this.data = raw;

		// Bind all class methods
		autoBind(this);
	}

	decode(data, options) {
		return decode(data || this.data, options || this.options);
	}

	encode(data, options) {
		return encode(data || this.data, options || this.options);
	}
};
