export interface IClampOptions {
    clamp?: string | "auto";
    truncationChar?: string;
    truncationHTML?: string;
    splitOnChars?: string[];
}
export interface IClampResponse {
    original: string;
    clamped: string;
}
export declare class ClampOptions implements IClampOptions {
    clamp?: string | "auto";
    truncationChar?: string;
    truncationHTML?: string;
    splitOnChars?: string[];
    constructor(clamp?: string, truncationChar?: string, truncationHTML?: string, splitOnChars?: string[]);
}
export declare class ClampResponse implements IClampResponse {
    original: string;
    clamped: string;
    constructor(original: string, clamped: string);
}
/**
 * Clamps (ie. cuts off) an HTML element's content by adding ellipsis to it if the content inside is too long.
 *
 * @export
 * @param {HTMLElement} element The HTMLElement that should be clamped.
 * @param {ClampOptions} [options] The Clamp options
 * @returns {ClampResponse} The Clamp response
 */
export declare function clamp(element: HTMLElement, options?: ClampOptions): ClampResponse;
