import test from 'ava';
import { encode, decode } from '../main';

test('returns a string', t => {
    t.is(typeof encode({ 'Section': { 'a': 1 } }), 'string');
    t.is(typeof encode({ 'a': 1 }), 'string');
    t.is(typeof encode({}), 'string');
});

test('should handle attributes without section', t => {
    const lineEnding = "\n";
    const encoded = encode({ stray: 'foo', 'SectionA': { 'a': 1 } }, { lineEnding });
    const decoded = decode(encoded, { lineEnding });

    t.is(decoded.stray, "foo");
});