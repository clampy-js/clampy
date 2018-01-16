"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ClampOptions = /** @class */ (function () {
    function ClampOptions(clamp, truncationChar, truncationHTML, splitOnChars) {
        ;
        (this.clamp = clamp || "auto"),
            (this.truncationChar = truncationChar || "…");
        this.truncationHTML = truncationHTML;
        this.splitOnChars = splitOnChars || [".", "-", "–", "—", " "];
    }
    return ClampOptions;
}());
exports.ClampOptions = ClampOptions;
var ClampResponse = /** @class */ (function () {
    function ClampResponse(original, clamped) {
        this.original = original;
        this.clamped = clamped;
    }
    return ClampResponse;
}());
exports.ClampResponse = ClampResponse;
/**
 * Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the content inside is too long.
 *
 * @export
 * @param {HTMLElement} element The HTMLElement that should be clamped.
 * @param {ClampOptions} [options] The Clamp options
 * @returns {ClampResponse} The Clamp response
 */
function clamp(element, options) {
    var win = window;
    if (!options) {
        options = {
            clamp: "auto",
            truncationChar: "…",
            splitOnChars: [".", "-", "–", "—", " "]
        };
    }
    var opt = {
        clamp: options.clamp || "auto",
        splitOnChars: options.splitOnChars || [".", "-", "–", "—", " "],
        truncationChar: options.truncationChar || "…",
        truncationHTML: options.truncationHTML
    };
    var splitOnChars = opt.splitOnChars.slice(0);
    var splitChar = splitOnChars[0];
    var chunks;
    var lastChunk;
    var sty = element.style;
    var originalText = element.innerHTML;
    var clampValue = opt.clamp;
    var isCSSValue = clampValue.indexOf &&
        (clampValue.indexOf("px") > -1 || clampValue.indexOf("em") > -1);
    var truncationHTMLContainer;
    if (opt.truncationHTML) {
        truncationHTMLContainer = document.createElement("span");
        truncationHTMLContainer.innerHTML = opt.truncationHTML;
    }
    // UTILITY FUNCTIONS __________________________________________________________
    /**
     * Return the current style for an element.
     * @param {HTMLElement} elem The element to compute.
     * @param {string} prop The style property.
     * @returns {number}
     */
    function computeStyle(elem, prop) {
        return win.getComputedStyle(elem).getPropertyValue(prop);
    }
    /**
     * Returns the maximum number of lines of text that should be rendered based
     * on the current height of the element and the line-height of the text.
     */
    function getMaxLines(height) {
        var availHeight = height || element.clientHeight;
        var lineHeight = getLineHeight(element);
        return Math.max(Math.floor(availHeight / lineHeight), 0);
    }
    /**
     * Returns the maximum height a given element should have based on the line-
     * height of the text and the given clamp value.
     */
    function getMaxHeight(clmp) {
        var lineHeight = getLineHeight(element);
        return lineHeight * clmp;
    }
    /**
     * Returns the line-height of an element as an integer.
     */
    function getLineHeight(elem) {
        var lh = computeStyle(elem, "line-height");
        if (lh === "normal") {
            // Normal line heights vary from browser to browser. The spec recommends
            // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
            lh =
                parseFloat(parseFloat(computeStyle(elem, "font-size")).toFixed(0)) * 1.1;
        }
        return parseFloat(parseFloat(lh).toFixed(0));
    }
    /**
     * Returns the height of an element as an integer (max of scroll/offset/client).
     * Note: inline elements return 0 for scrollHeight and clientHeight
     */
    function getElemHeight(elem) {
        return Math.max(elem.scrollHeight, elem.offsetHeight, elem.clientHeight);
    }
    /**
     * Gets an element's last child. That may be another node or a node's contents.
     */
    function getLastChild(elem) {
        if (!elem.lastChild) {
            return;
        }
        // Current element has children, need to go deeper and get last child as a text node
        if (elem.lastChild.childNodes && elem.lastChild.childNodes.length > 0) {
            return getLastChild(Array.prototype.slice.call(elem.children).pop());
        }
        else if (!elem.lastChild ||
            !elem.lastChild.nodeValue ||
            elem.lastChild.nodeValue === "" ||
            elem.lastChild.nodeValue === opt.truncationChar) {
            // This is the absolute last child, a text node, but something's wrong with it. Remove it and keep trying
            if (elem.lastChild.parentNode) {
                elem.lastChild.parentNode.removeChild(elem.lastChild);
                return getLastChild(element);
            }
        }
        else {
            // This is the last child we want, return it
            return elem.lastChild;
        }
    }
    /**
     * Apply the ellipsis to the element
     * @param elem the element to apply the ellipsis on
     * @param str The string that will be set to the element
     */
    function applyEllipsis(elem, str) {
        elem.nodeValue = str + opt.truncationChar;
    }
    /**
     * Removes one character at a time from the text until its width or
     * height is beneath the passed-in max param.
     */
    function truncate(target, maxHeight) {
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
        var nodeValue = target.nodeValue.replace(opt.truncationChar, "");
        // Grab the next chunks
        if (!chunks) {
            // If there are more characters to try, grab the next one
            if (splitOnChars.length > 0) {
                splitChar = splitOnChars.shift();
            }
            else {
                // No characters to chunk by. Go character-by-character
                splitChar = "";
            }
            chunks = nodeValue.split(splitChar);
        }
        // If there are chunks left to remove, remove the last one and see if
        // the nodeValue fits.
        if (chunks.length > 1) {
            lastChunk = chunks.pop();
            applyEllipsis(target, chunks.join(splitChar));
        }
        else {
            // No more chunks can be removed using this character
            chunks = null;
        }
        // Insert the custom HTML before the truncation character
        if (truncationHTMLContainer) {
            target.nodeValue = target.nodeValue.replace(opt.truncationChar, "");
            element.innerHTML =
                target.nodeValue +
                    " " +
                    truncationHTMLContainer.innerHTML +
                    opt.truncationChar;
        }
        // Search produced valid chunks
        if (chunks) {
            // It fits
            if (element.clientHeight <= maxHeight) {
                // There's still more characters to try splitting on, not quite done yet
                if (splitOnChars.length >= 0 && splitChar !== "") {
                    applyEllipsis(target, chunks.join(splitChar) + splitChar + lastChunk);
                    chunks = null;
                }
                else {
                    // Finished!
                    return element.innerHTML;
                }
            }
        }
        else {
            // No valid chunks produced
            // No valid chunks even when splitting by letter, time to move
            // on to the next node
            if (splitChar === "") {
                applyEllipsis(target, "");
                target = getLastChild(element);
                reset();
            }
        }
        return truncate(target, maxHeight);
    }
    // CONSTRUCTOR ________________________________________________________________
    if (clampValue === "auto") {
        clampValue = getMaxLines().toString();
    }
    else if (isCSSValue) {
        clampValue = getMaxLines(parseInt(clampValue, 10)).toString();
    }
    var clampedText;
    var height = getMaxHeight(Number(clampValue));
    if (height < getElemHeight(element)) {
        clampedText = truncate(getLastChild(element), height);
    }
    return new ClampResponse(originalText, clampedText);
}
exports.clamp = clamp;
//# sourceMappingURL=clampy.js.map