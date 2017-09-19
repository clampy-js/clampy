import { IClampOptions } from './clampOptions';
import { IClampResponse } from './clampResponse';

/**
 * Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the content inside is too long.
 * 
 * @export
 * @param {HTMLElement} element The HTMLElement that should be clamped.
 * @param {IClampOptions} [options] The Clamp options
 * @returns {IClampResponse} The Clamp response
 */
export function clamp(element: HTMLElement, options?: IClampOptions): IClampResponse {
  let win = window;

  if (!options) {
    options = {
      clamp: 'auto',
      truncationChar: '…',
      splitOnChars: ['.', '-', '–', '—', ' ']
    };

  }

  let opt = {
    clamp: options.clamp || 'auto',
    splitOnChars: options.splitOnChars ||
    ['.', '-', '–', '—', ' '],  // Split on sentences (periods), hypens, en-dashes, em-dashes, and words (spaces).
    truncationChar: options.truncationChar || '…',
    truncationHTML: options.truncationHTML
  }

  let splitOnChars: string[] = opt.splitOnChars.slice(0);
  let splitChar: string = splitOnChars[0];
  let chunks: any;
  let lastChunk: any;
  let sty = element.style
  let originalText = element.innerHTML
  let clampValue = opt.clamp;
  let isCSSValue = clampValue.indexOf && (clampValue.indexOf('px') > -1 || clampValue.indexOf('em') > -1);
  let truncationHTMLContainer: any;

  if (opt.truncationHTML) {
    truncationHTMLContainer = document.createElement('span');
    truncationHTMLContainer.innerHTML = opt.truncationHTML;
  }


  // UTILITY FUNCTIONS __________________________________________________________
  /**
   * Return the current style for an element.
   * @param {HTMLElement} elem The element to compute.
   * @param {string} prop The style property.
   * @returns {number}
   */
  function computeStyle(elem: HTMLElement, prop: string) {
    return win.getComputedStyle(elem).getPropertyValue(prop);
  }

  /**
   * Returns the maximum number of lines of text that should be rendered based
   * on the current height of the element and the line-height of the text.
   */
  function getMaxLines(height?: number) {
    let availHeight = height || element.clientHeight;
    let lineHeight = getLineHeight(element);

    return Math.max(Math.floor(availHeight / lineHeight), 0);
  }

  /**
   * Returns the maximum height a given element should have based on the line-
   * height of the text and the given clamp value.
   */
  function getMaxHeight(clmp: number) {
    let lineHeight = getLineHeight(element);
    return lineHeight * clmp;
  }

  /**
   * Returns the line-height of an element as an integer.
   */
  function getLineHeight(elem: HTMLElement): number {
    let lh: any = computeStyle(elem, 'line-height');
    if (lh === 'normal') {
      // Normal line heights vary from browser to browser. The spec recommends
      // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
      lh = parseFloat(parseFloat(computeStyle(elem, 'font-size')).toFixed(0)) * 1.1;
    }
    return parseFloat(parseFloat(lh).toFixed(0));
  }

  /**
   * Returns the height of an element as an integer (max of scroll/offset/client).
   * Note: inline elements return 0 for scrollHeight and clientHeight
   */
  function getElemHeight(elem: HTMLElement): number {
    return Math.max(elem.scrollHeight, elem.offsetHeight, elem.clientHeight);
  }

  /**
   * Gets an element's last child. That may be another node or a node's contents.
   */
  function getLastChild(elem: HTMLElement): any {
    if (!elem.lastChild) {
      return;
    }
    // Current element has children, need to go deeper and get last child as a text node
    if (elem.lastChild.childNodes && elem.lastChild.childNodes.length > 0) {
      return getLastChild(Array.prototype.slice.call(elem.children).pop());
    }
    // This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
    else if (!elem.lastChild || !elem.lastChild.nodeValue || elem.lastChild.nodeValue === '' || elem.lastChild.nodeValue === opt.truncationChar) {
      if (elem.lastChild.parentNode) {
        elem.lastChild.parentNode.removeChild(elem.lastChild);
        return getLastChild(element);
      }
    }
    // This is the last child we want, return it
    else {
      return elem.lastChild;
    }
  }

  /**
   * Apply the ellipsis to the element
   * @param elem the element to apply the ellipsis on
   * @param str The string that will be set to the element
   */
  function applyEllipsis(elem: HTMLElement, str: string) {
    elem.nodeValue = str + opt.truncationChar;
  }

  /**
   * Removes one character at a time from the text until its width or
   * height is beneath the passed-in max param.
   */
  function truncate(target: HTMLElement, maxHeight: number): any {

    /**
     * Resets global variables.
     */
    function reset() {
      splitOnChars = opt.splitOnChars.slice(0);
      splitChar = splitOnChars[0];
      chunks = null;
      lastChunk = null;
    }

    if (!target || !maxHeight || !target.nodeValue) {
      return;
    }

    let nodeValue = target.nodeValue.replace(opt.truncationChar, '');

    // Grab the next chunks
    if (!chunks) {
      // If there are more characters to try, grab the next one
      if (splitOnChars.length > 0) {
        splitChar = splitOnChars.shift()!;
      }
      // No characters to chunk by. Go character-by-character
      else {
        splitChar = '';
      }

      chunks = nodeValue.split(splitChar);
    }

    // If there are chunks left to remove, remove the last one and see if
    // the nodeValue fits.
    if (chunks.length > 1) {
      lastChunk = chunks.pop();
      applyEllipsis(target, chunks.join(splitChar));
    }
    // No more chunks can be removed using this character
    else {
      chunks = null;
    }

    // Insert the custom HTML before the truncation character
    if (truncationHTMLContainer) {
      target.nodeValue = target.nodeValue.replace(opt.truncationChar, '');
      element.innerHTML = target.nodeValue + ' ' + truncationHTMLContainer.innerHTML + opt.truncationChar;
    }

    // Search produced valid chunks
    if (chunks) {
      // It fits
      if (element.clientHeight <= maxHeight) {
        // There's still more characters to try splitting on, not quite done yet
        if (splitOnChars.length >= 0 && splitChar !== '') {
          applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
          chunks = null;
        }
        // Finished!
        else {
          return element.innerHTML;
        }
      }
    }
    // No valid chunks produced
    else {
      // No valid chunks even when splitting by letter, time to move
      // on to the next node
      if (splitChar === '') {
        applyEllipsis(target, '');
        target = getLastChild(element);

        reset();
      }
    }

    return truncate(target, maxHeight);
  }


  // CONSTRUCTOR ________________________________________________________________
  if (clampValue === 'auto') {
    clampValue = getMaxLines().toString();
  } else if (isCSSValue) {
    clampValue = getMaxLines(parseInt(clampValue, 10)).toString();
  }

  let clampedText;
  let height = getMaxHeight(Number(clampValue));
  if (height < getElemHeight(element)) {
    clampedText = truncate(getLastChild(element), height);
  }

  return { 'original': originalText, 'clamped': clampedText };
}
