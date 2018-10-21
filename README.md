# conf-cfg-ini

[![npm version](https://badge.fury.io/js/conf-cfg-ini.svg)](http://badge.fury.io/js/conf-cfg-ini)
[![Build Status](https://travis-ci.org/loge5/conf-cfg-ini.svg?branch=master)](https://travis-ci.org/loge5/conf-cfg-ini)
[![Dependencies](https://david-dm.org/loge5/conf-cfg-ini.svg)](https://david-dm.org/loge5/conf-cfg-ini) 
[![devDependency Status](https://david-dm.org/loge5/conf-cfg-ini/dev-status.svg)](https://david-dm.org/loge5/conf-cfg-ini#info=devDependencies)

**Encode and decode conf/cfg/ini-Files with Node.js**

loge5/conf-cfg-ini

There are already a lot of ini-parser on the npm repository. 
But none of these fits all my needs. 
So here is an attempt to create a very flexible but easy to use parser.

**Features**
- Linebreak detection (windows, unix, mac)
- Set custom identifiers for sections, comments and assignments
- line trim is optional
- quoting and unquoting attributes, keys and values is optional
- set default value
- tested with ava

### Installation ###
```shell
$ npm install conf-cfg-ini
```

### Usage ###
```javascript
import fs from 'fs';
import Config from 'conf-cfg-ini';

const raw = fs.readFileSync('./test.ini');

const config  = new Config(raw, {
  detectLineEnding: true
});

// decode to get a simple js object
const configObject = config.decode(options);

// encode to get a config-String
const configString = config.encode({
  SectionA: {
    a: 1,
    b: 2
  }
}, options);
```

Example Config:
```ini
[SectionA]
a=1
b=2

[SectionB]
bar=foo
```
will be decoded to:
```json
{
  "SectionA": {
    "a": "1",
    "b": "2"
  },
  "SectionB": {
    "bar": "foo"
  }
}
```

### Options ###
There are two ways to set options:
```javascript
// Set options at initialization
const config = new Config(options);

// or after initialization
config.options.lineEnding = "\n";
```

| Option                   | Default       | Description                              |
| ------------------------ | ------------- | ---------------------------------------- |
| lineEnding               | "\r\n"        | Line ending (break)                      |
| sectionOpenIdentifier    | "["           | First char of section line               |
| sectionCloseIdentifier   | "]"           | Last char of section line                |
| defaultValue             | true          | Default value for keys without value     |
| assignIdentifier         | "="           | String after key and before value        |
| commentIdentifiers       | [";"]         | List of commentIdentifiers (strings)     |
| unquoteAttributes        | false         | Remove surrounding quotes to attributes  |
| quoteAttributes          | false         | Add surrounding quotes to attributes     |
| unquoteKeys              | false         | Remove surrounding quotes to keys        |
| quoteKeys                | false         | Add surrounding quotes to keys           |
| unquoteValues            | false         | Remove surrounding quotes to values      |
| quoteValues              | false         | Add surrounding quotes to values         |
