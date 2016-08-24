/**
 * Encode and decode ini/conf/cfg files
 * @author Rolf Loges
 * @licence MIT
 */
function Config(options){
    this.options = {
        lineEnding: "\r\n",
        sectionOpenIdentifier: '[',
        sectionCloseIdentifier: ']',
        defaultValue: true,
        assignIdentifier: "=",
        commentIdentifiers: [";"],
        trimLines: true
    }
    if(typeof options === 'object'){
        this.setOptions(options);
    }
}

/**
 * Decode a config-string
 * 
 * @param data {string}
 * @return object
 */
Config.prototype.decode = function(data){
    if(typeof data != 'string'){
        if(typeof data.toString === 'function'){
            data = data.toString();
        } else {
            throw new Error('expecting string but got '+typeof data);
        }
    }
    var result = {};
    var currentSection = undefined;
    var lines = data.split(this.options.lineEnding);
    for(var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(this.options.trimLines === true){
            line = line.trim();
        }
        if(line.length == 0 || stringBeginsWithOnOfTheseStrings(line,this.options.commentIdentifiers)){
            continue;
        }
        
        var sectionRegExp = new RegExp("^\\"+this.options.sectionOpenIdentifier+"(.*?)\\"+this.options.sectionCloseIdentifier+"$");
        var newSection = line.match(sectionRegExp);
        if(newSection !== null){
            currentSection = newSection[1];
            if(typeof result[currentSection] === 'undefined'){
                result[currentSection] = {};
            }
            continue;
        }

        var assignPosition = line.indexOf(this.options.assignIdentifier);
        var key = undefined;
        var value = undefined;
        if(assignPosition === -1){
            key = line;
            value = this.options.defaultValue;
        } else {
            key = line.substr(0,assignPosition);
            value = line.substr(assignPosition+this.options.assignIdentifier.length);
        }
        if(typeof currentSection === 'undefined'){
            result[key] = value;
        } else {
            result[currentSection][key] = value;
        }
    }
    return result;
}

/**
 * Encode a object
 * no nesting section supported!
 * 
 * @param object {object}
 * @return {string}
 */
Config.prototype.encode = function(object){
    var resultSections = "";
    var resultAttributesWithoutSection = "";
    var sections = Object.keys(object);
    for(var i = 0; i < sections.length; i++){
        if(typeof object[sections[i]] === 'object'){
            if(resultSections != ""){
                resultSections += this.options.lineEnding;
            }
            resultSections += this.options.sectionOpenIdentifier;
            resultSections += sections[i];
            resultSections += this.options.sectionCloseIdentifier;
            resultSections += this.options.lineEnding;
            var attributes = Object.keys(object[sections[i]]);
            for(var j = 0; j < attributes.length; j++){
                resultSections += attributes[j];
                resultSections += this.options.assignIdentifier;
                resultSections += object[sections[i]][attributes[j]];
                resultSections += this.options.lineEnding;
            }
        } else {
            resultAttributesWithoutSection += sections[i];
            resultAttributesWithoutSection += this.options.assignIdentifier;
            resultAttributesWithoutSection += object[sections[i]];
            resultAttributesWithoutSection += this.options.lineEnding;
        }
    }
    return resultAttributesWithoutSection+resultSections;
}

/**
 * Set Options
 */
Config.prototype.setOptions = function(options){
    if(typeof options !== 'object'){
        throw new Error('expecting object but got '+typeof options);
    }
    var option = Object.keys(options);
    for(var i = 0; i < option.length; i++){
        if(typeof options[option[i]] !== 'undefined'){
            this.options[option[i]] = options[option[i]];
        }
    }
}

/**
 * Try to detect the used line ending
 * (windows, unix, mac)
 * @return {string]
 */
Config.prototype.detectLineEnding = function(data){
    var hasCaridgeReturn = data.indexOf("\r") !== -1;
    var hasLineFeed = data.indexOf("\n") !== -1
    if(hasCaridgeReturn && hasLineFeed){
        if(data.indexOf("\r\n") !== -1){
            return "\r\n";
        } else if(data.indexOf("\n\r") !== -1){
            return "\n\r";
        } else {
            throw new Error('found multiple line endings');
        }
    } else if(hasLineFeed){
        return "\n";
    } else if(hasCaridgeReturn){
        return "\r";
    } else {
        return "\n";
    }
}

function stringBeginsWithOnOfTheseStrings(string, stringList){
    for(var i = 0; i < stringList.length; i++){
        if(string.indexOf(stringList[i]) === 0){
            return true;
        }
    }
    return false;
}

module.exports = Config;