/**
 * External dependencies
 */
import { castArray } from 'lodash';

/**
 * WordPress dependencies
 */
import { renderToString, getTextElements } from '@wordpress/element';

/**
 * Internal dependencies
 */
import * as node from './node';

/**
 * A representation of a block's rich text value.
 *
 * @typedef {WPBlockChild[]} WPBlockChildren
 */

/**
 * Given a block node, returns a serialize-capable WordPress element.
 *
 * @param {WPBlockChildren} children Block node to convert.
 *
 * @return {WPElement} A serialize-capable element.
 */
export function getSerializeCapableElement( children ) {
	// The fact that a block node is compatible with the element serializer is
	// merely an implementation detail that currently serves to be true, but
	// should not be mistaken as being a guarantee on the external API. The
	// public API only offers guarantees to work with strings (toHTML) and DOM
	// elements (fromDOM), and should provide utilities to manipulate the value
	// rather than expect consumers to inspect or construct its shape (concat).
	return children;
}

/**
 * Given two or more block nodes, returns a new block node representing a
 * concatenation of its values.
 *
 * @param {...WPBlockChildren} blockNodes Block nodes to concatenate.
 *
 * @return {WPBlockChildren} Concatenated block node.
 */
export function concat( ...blockNodes ) {
	const result = [];
	for ( let i = 0; i < blockNodes.length; i++ ) {
		const blockNode = castArray( blockNodes[ i ] );
		for ( let j = 0; j < blockNode.length; j++ ) {
			const child = blockNode[ j ];
			const canConcatToPreviousString = (
				typeof child === 'string' &&
				typeof result[ result.length - 1 ] === 'string'
			);

			if ( canConcatToPreviousString ) {
				result[ result.length - 1 ] += child;
			} else {
				result.push( child );
			}
		}
	}

	return result;
}

/**
 * Given an iterable set of DOM nodes, returns equivalent block children.
 * Ignores any non-element/text nodes included in set.
 *
 * @param {Iterable.<Node>} domNodes Iterable set of DOM nodes to convert.
 *
 * @return {WPBlockChildren} Block children equivalent to DOM nodes.
 */
export function fromDOM( domNodes ) {
	const result = [];
	for ( let i = 0; i < domNodes.length; i++ ) {
		try {
			result.push( node.fromDOM( domNodes[ i ] ) );
		} catch ( error ) {
			// Simply ignore if DOM node could not be converted.
		}
	}

	return result;
}

/**
 * Given a block node, returns its HTML string representation.
 *
 * @param {WPBlockChildren} children Block node(s) to convert to string.
 *
 * @return {string} String HTML representation of block node.
 */
export function toHTML( children ) {
	const element = getSerializeCapableElement( children );

	return renderToString( element );
}

/**
 * Given a block node, returns its text content.
 *
 * @param {WPBlockChildren} children Block node(s) to convert to text string.
 *
 * @return {string} String with the text content of a block node.
 */
export function toText( children ) {
	const element = getSerializeCapableElement( children );

	return getTextElements( element ).join( '' );
}

/**
 * Given a selector, returns an hpq matcher generating a WPBlockChildren value
 * matching the selector result.
 *
 * @param {string} selector DOM selector.
 *
 * @return {Function} hpq matcher.
 */
export function matcher( selector ) {
	return ( domNode ) => {
		let match = domNode;

		if ( selector ) {
			match = domNode.querySelector( selector );
		}

		if ( match ) {
			return fromDOM( match.childNodes );
		}

		return [];
	};
}

export default {
	concat,
	fromDOM,
	toHTML,
	matcher,
	toText,
};
