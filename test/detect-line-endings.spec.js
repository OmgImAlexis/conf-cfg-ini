import test from 'ava';
import { detectLineEnding } from '../main';

test('windows style (\\r\\n)', t => {
    t.is(detectLineEnding("line1\r\nline2\r\n"), "\r\n");
});

test('*nix style (\\n)', t => {
    t.is(detectLineEnding("line1\nline2\n"), "\n");
});

test('osx style (\\r)', t => {
    t.is(detectLineEnding("line1\rline2\r"), "\r");
});

test('wtf style (\\n\\r)', t => {
    t.is(detectLineEnding("line1\n\rline2\n\r"), "\n\r");
});