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
  