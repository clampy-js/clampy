/**
 * Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the content inside is too long.
 *
 * @export
 * @param {HTMLElement} element The HTMLElement that should be clamped.
 * @param {IClampOptions} [options] The Clamp options
 * @returns {IClampResponse} The Clamp response
 */
export declare function clamp(element: HTMLElement, options?: IClampOptions): IClampResponse;
/**
 * Clamp options
 *
 * @export
 * @interface IClampOptions
 */
export interface IClampOptions {
    /**
     * This controls where and when to clamp the text of an element. Submitting a number(as a string) controls the number of lines that
     * should be displayed. Second, you can submit a CSS value (in px or em) that controls the height of the element as a string.
     * Finally, you can submit the word 'auto' as a string. Auto will try to fill up the available space with the content and then
     * automatically clamp once content no longer fits. This last option should only be set if a static height is being set on the
     * element elsewhere (such as through CSS) otherwise no clamping will be done.
     *
     * @type {(string | 'auto')}
     * @memberof IClampOptions
     */
    clamp?: string | 'auto';
    /**
     * The character to insert at the end of the HTML element after truncation is performed. This defaults to an ellipsis (…).
     *
     * @type {string}
     * @memberof IClampOptions
     */
    truncationChar?: string;
    /**
     * A string of HTML to insert before the truncation character. This is useful if you'd like to add a "Read more" link or some
     * such thing at the end of your clamped node.
     *
     * @type {string}
     * @memberof IClampOptions
     */
    truncationHTML?: string;
    /**
     * Determines what characters to use to chunk an element into smaller pieces. Version 0.1 of Clamp.js would always remove each
     * individual character to check for fit. With v0.2, you now have an option to pass a list of characters it can use. For example,
     * it you pass an array of ['.', ',', ' '] then it will first remove sentences, then remove comma-phrases, and remove words, and
     * finally remove individual characters to try and find the correct height. This will lead to increased performance and less looping
     * when removing larger pieces of text (such as in paragraphs). The default is set to remove sentences (periods), hypens, en-dashes,
     * em-dashes, and finally words (spaces). Removing by character is always enabled as the last attempt no matter what is submitted in
     * the array.
     *
     * @type {string[]}
     * @memberof IClampOptions
     */
    splitOnChars?: string[];
}
/**
 * The result of the clamp operation.
 *
 * @export
 * @interface IClampResponse
 */
export interface IClampResponse {
    /**
     * The original string that was clamped.
     *
     * @type {string}
     * @memberof IClampResponse
     */
    original: string;
    /**
     * The clamped string.
     *
     * @type {string}
     * @memberof IClampResponse
     */
    clamped: string;
}
