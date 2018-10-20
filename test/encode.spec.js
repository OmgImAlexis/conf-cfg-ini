import test from 'ava';
import { encode, decode } from '../main';

test('returns a string', t => {
    t.is(typeof encode({ 'Section': { 'a': 1 } }), 'string');
    t.is(typeof encode({ 'a': 1 }), 'string');
    t.is(typeof encode({}), 'string');
});

test('handles attributes without section', t => {
    const lineEnding = "\n";
    const encoded = encode({ stray: 'foo', 'SectionA': { 'a': 1 } }, { lineEnding });
    const decoded = decode(encoded, { lineEnding });

    t.is(decoded.stray, "foo");
});

test('handles attributes with quotes', t => {
    t.snapshot(encode({ 'SectionA': { 'a': 1 } }, {
        lineEnding: '\n',
        quoteAttributes: true
    }));
});

test('handles keys with quotes', t => {
    t.snapshot(encode({ 'SectionA': { 'a': 1 } }, {
        lineEnding: '\n',
        quoteKeys: true
    }));
});

test('handles values with quotes', t => {
    t.snapshot(encode({ 'SectionA': { 'a': 1 } }, {
        lineEnding: '\n',
        quoteValues: true
    }));
});

test('handles attributes, keys and values with quotes', t => {
    t.snapshot(encode({ 'SectionA': { 'a': 1 } }, {
        lineEnding: '\n',
        quoteAttributes: true,
        quoteKeys: true,
        quoteValues: true
    }));
});