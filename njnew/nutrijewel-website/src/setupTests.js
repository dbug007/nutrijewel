// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(window, 'scrollTo', {
	value: jest.fn(),
	writable: true,
});

// jsdom doesn't implement these, and components that animate or measure need them
// (Shelf width sync, motion scroll reveals, prefers-reduced-motion checks).
if (!window.matchMedia) {
	window.matchMedia = (query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(),
		removeListener: jest.fn(),
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	});
}

if (!window.ResizeObserver) {
	window.ResizeObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

if (!window.IntersectionObserver) {
	window.IntersectionObserver = class {
		observe() {}
		unobserve() {}
		disconnect() {}
		takeRecords() { return []; }
	};
}

Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || jest.fn();
