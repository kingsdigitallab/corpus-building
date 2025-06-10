import { describe, test, expect } from 'vitest';
import { fuzzyMatch, levenshteinDistance } from './fuzzy';

describe('fuzzyMatch', () => {
	test('should return false for null or undefined inputs', () => {
		expect(fuzzyMatch(null, 'test')).toBe(false);
		expect(fuzzyMatch('test', null)).toBe(false);
		expect(fuzzyMatch(undefined, 'test')).toBe(false);
		expect(fuzzyMatch('test', undefined)).toBe(false);
		expect(fuzzyMatch('', 'test')).toBe(false);
		expect(fuzzyMatch('test', '')).toBe(false);
	});

	test('should match exact strings', () => {
		expect(fuzzyMatch('hello', 'hello')).toBe(true);
		expect(fuzzyMatch('Hello', 'hello')).toBe(true);
	});

	test('should match strings with small differences', () => {
		// 1 character difference for strings up to 4 characters
		expect(fuzzyMatch('cat', 'cats')).toBe(true);
		expect(fuzzyMatch('dog', 'dogs')).toBe(true);
		expect(fuzzyMatch('hat', 'hats')).toBe(true);

		// 2 characters difference for strings up to 8 characters
		expect(fuzzyMatch('kitten', 'kittens')).toBe(true);
		console.log('Testing puppies vs puppy');
		console.log('Distance:', levenshteinDistance('puppies', 'puppy'));
		console.log('Max allowed:', Math.min(3, Math.floor('puppies'.length / 3) || 1));
		expect(fuzzyMatch('puppies', 'puppy')).toBe(true);
		expect(fuzzyMatch('rabbit', 'rabbits')).toBe(true);

		// 3 characters difference for longer strings
		expect(fuzzyMatch('elephant', 'elephants')).toBe(true);
		expect(fuzzyMatch('giraffe', 'giraffes')).toBe(true);
		expect(fuzzyMatch('penguin', 'penguins')).toBe(true);
	});

	test('should not match strings with too many differences', () => {
		expect(fuzzyMatch('cat', 'dog')).toBe(false);
		expect(fuzzyMatch('hello', 'world')).toBe(false);
		expect(fuzzyMatch('elephant', 'giraffe')).toBe(false);
	});

	test('should handle special characters and spaces', () => {
		expect(fuzzyMatch('hello world', 'hello world!')).toBe(true);
		expect(fuzzyMatch('test-case', 'test case')).toBe(true);
		expect(fuzzyMatch('user@email', 'user@email.com')).toBe(false);
	});

	test('latin text', () => {
		expect(fuzzyMatch('man', 'manes')).toBe(false);
		expect(fuzzyMatch('mani', 'manes')).toBe(true);
		expect(fuzzyMatch('mans', 'manes')).toBe(true);
	});
});

describe('levenshteinDistance', () => {
	test('should return 0 for identical strings', () => {
		expect(levenshteinDistance('hello', 'hello')).toBe(0);
		expect(levenshteinDistance('', '')).toBe(0);
	});

	test('should return length of non-empty string when comparing with empty string', () => {
		expect(levenshteinDistance('hello', '')).toBe(5);
		expect(levenshteinDistance('', 'hello')).toBe(5);
	});

	test('should calculate correct distance for single character changes', () => {
		expect(levenshteinDistance('kitten', 'sitten')).toBe(1); // substitution
		expect(levenshteinDistance('kitten', 'kittens')).toBe(1); // insertion
		expect(levenshteinDistance('kittens', 'kitten')).toBe(1); // deletion
	});

	test('should calculate correct distance for multiple character changes', () => {
		expect(levenshteinDistance('kitten', 'sitting')).toBe(3); // substitution + insertion
		expect(levenshteinDistance('saturday', 'sunday')).toBe(3); // deletion + substitution
		expect(levenshteinDistance('book', 'back')).toBe(2); // substitution
	});

	test('should handle case sensitivity', () => {
		expect(levenshteinDistance('Hello', 'hello')).toBe(1);
		expect(levenshteinDistance('WORLD', 'world')).toBe(5);
	});

	test('should handle special characters and spaces', () => {
		expect(levenshteinDistance('hello world', 'hello-world')).toBe(1);
		expect(levenshteinDistance('test@email', 'test.email')).toBe(1);
		expect(levenshteinDistance('user name', 'username')).toBe(1);
	});
});
