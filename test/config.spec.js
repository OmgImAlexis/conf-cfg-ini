import test from 'ava';
import Config, { defaults, encode, decode, detectLineEnding, stringBeginsWithOneOfTheseStrings } from '../main';

test('is defined', t => {
    t.is(typeof Config, 'function');
    t.is(typeof defaults, 'object');
    t.is(typeof encode, 'function');
    t.is(typeof decode, 'function');
    t.is(typeof detectLineEnding, 'function');
    t.is(typeof stringBeginsWithOneOfTheseStrings, 'function');
});

test('can override options', t => {
    const config = new Config({
        lineEnding: 'WRONG_LINE_ENDING',
        trimLines: 'WRONG_TRIM_LINES'
    });
    config.options.lineEnding = "\n";
    config.options.trimLines = true;
    t.is(config.options.lineEnding, "\n");
    t.true(config.options.trimLines);
});