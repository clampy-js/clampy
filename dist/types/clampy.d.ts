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
export declare function clamp(element: HTMLElement, options?: IClampOptions): IClampResponse;
