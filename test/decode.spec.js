import test from 'ava';
import Config, { decode } from '../main';
import testData from './__fixtures__/test-data';

test('returns a object', t => {
    testData.forEach(data => {
        t.is(typeof decode(data), 'object');
    });
});

test('should handle attributes without section', t => {
    const result = decode("stray=foo\n[Section1]\na=b\n", {
        lineEnding: '\n'
    });
    t.true(Object.keys(result).includes('Section1'));
    t.true(Object.keys(result).includes('stray'));
    t.is(result.stray, 'foo');
});

test('should return object with same attributes', t => {
    const { decode } = new Config(";comment\n[SectionA]\nkey=value\n", {
        detectLineEnding: true
    });
    const result = decode();
    t.is(typeof result, 'object');
    t.is(typeof result.SectionA, 'object');
    t.is(result.SectionA.key, 'value');
});

test('decode>encode>decode>encode return should produce consistent results', t => {
    testData.forEach(data => {
        var config = new Config({
            detectLineEnding: true
        });
        const decoded1 = config.decode(data);
        const encoded1 = config.encode(decoded1);
        const decoded2 = config.decode(encoded1);
        const encoded2 = config.encode(decoded2);
        t.is(encoded1, encoded2);
        t.deepEqual(decoded1, decoded2);
    });
});

test('should be able to handle multiple comment identifier', t => {
    const result = decode(";comment1\n//comment2\n#comment3\n", {
        lineEnding: "\n",
        commentIdentifiers: [';', '//', '#']
    });
    t.deepEqual(result, {});
});

test('should be able to handle custom assign identifier', t => {
    const { Section } = decode("[Section]\nfoo:bar\n", {
        lineEnding: "\n",
        assignIdentifier: ":"
    });
    t.is(typeof Section, 'object');
    t.is(Section.foo, 'bar');
});