import autoBind from 'auto-bind';
import unquote from 'unquote';

/**
 * Default options
 * 
 * @namespace
 * @property {Boolean} detectLineEnding Detect line ending
 * @property {Boolean} LineEnding Line ending (break)
 * @property {String} sectionOpenIdentifier First char of section line
 * @property {String} sectionCloseIdentifier Last char of section line
 * @property {*} defaultValue Default value for keys without value
 * @property {String} assignIdentifier Character after key and before value
 * @property {Array} commentIdentifiers Array of commentIdentifier strings
 * @property {Boolean} trimLines Should lines be trimmed
 * @property {Boolean} unquoteAttributes Remove surrounding quotes to attributes
 * @property {Boolean} quoteAttributes Add surrounding quotes to attributes
 * @property {Boolean} unquoteKeys Remove surrounding quotes to keys
 * @property {Boolean} quoteKeys Add surrounding quotes to keys
 * @property {Boolean} unquoteValues Remove surrounding quotes to values
 * @property {Boolean} quoteValues Add surrounding quotes to values
 */
export const defaults = {
	detectLineEnding: false,
	lineEnding: "\r\n",
	sectionOpenIdentifier: '[',
	sectionCloseIdentifier: ']',
	defaultValue: true,
	assignIdentifier: "=",
	commentIdentifiers: [";"],
	trimLines: true,
	unquoteAttributes: false,
	quoteAttributes: false,
	unquoteKeys: false,
	quoteKeys: false,
	unquoteValues: false,
	quoteValues: false
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
	const { unquoteAttributes, unquoteKeys, unquoteValues } = options;
	const lineEnding = options.detectLineEnding ? detectLineEnding(data) : options.lineEnding;

	let result = {};
	let currentSection = undefined;
	const lines = data.split(lineEnding);
	for (let i = 0; i < lines.length; i++) {
		const line = trimLines ? lines[i].trim() : lines[i];

		if (line.length == 0 || stringBeginsWithOneOfTheseStrings(line, commentIdentifiers)) {
			continue;
		}

		const sectionRegExp = new RegExp("^\\" + sectionOpenIdentifier + "(.*?)\\" + sectionCloseIdentifier + "$");
		const newSection = line.match(sectionRegExp);
		if (newSection !== null) {
			// Unquote attribute
			currentSection = unquoteAttributes ? unquote(newSection[1]) : newSection[1];

			if (typeof result[currentSection] === 'undefined') {
				result[currentSection] = {};
			}
			continue;
		}

		const assignPosition = line.indexOf(assignIdentifier);
		let key = assignPosition === -1 ? line : line.substr(0, assignPosition);
		let value = assignPosition === -1 ? defaultValue : line.substr(assignPosition + assignIdentifier.length);

		// Unquote key and value
		key = unquoteKeys ? unquote(key) : key;
		value = unquoteValues ? unquote(value) : value;

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
	const { sectionCloseIdentifier, sectionOpenIdentifier, assignIdentifier, quoteAttributes, quoteKeys, quoteValues } = options;
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
			resultSections += quoteAttributes ? `"${sections[i]}"` : sections[i];
			resultSections += sectionCloseIdentifier;
			resultSections += lineEnding;
			const attributes = Object.keys(object[sections[i]]);
			for (let j = 0; j < attributes.length; j++) {
				resultSections += quoteKeys ? `"${attributes[j]}"` : attributes[j];
				resultSections += assignIdentifier;
				resultSections += quoteValues ? `"${object[sections[i]][attributes[j]]}"` : object[sections[i]][attributes[j]];
				resultSections += lineEnding;
			}
		} else {
			resultAttributesWithoutSection += quoteKeys ? `"${sections[i]}"` : sections[i];
			resultAttributesWithoutSection += assignIdentifier;
			resultAttributesWithoutSection += quoteValues ? `"${object[sections[i]]}"` : object[sections[i]];
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
