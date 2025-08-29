/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-pep-steelskin
 *
 * fiware-pep-steelskin is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-pep-steelskin is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-pep-steelskin.
 * If not, seehttp://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::[iot_support@tid.es]
 */

'use strict';

const got = require('got');

/**
 * Wrapper for the deprecated 'request' library using 'got' underneath.
 * Provides backward compatibility for the request API patterns used in this codebase.
 */

/**
 * Convert request-style options to got-style options
 */
function convertOptionsToGot(options) {
    const gotOptions = {};
    
    // URL handling
    if (options.url) {
        gotOptions.url = options.url;
    } else if (options.uri) {
        gotOptions.url = options.uri;
    }
    
    // Method
    if (options.method) {
        gotOptions.method = options.method;
    }
    
    // Query string
    if (options.qs) {
        gotOptions.searchParams = options.qs;
    }
    
    // Headers
    if (options.headers) {
        gotOptions.headers = options.headers;
    }
    
    // Body
    if (options.body) {
        gotOptions.body = options.body;
    }
    
    // JSON handling
    if (options.json !== undefined) {
        if (typeof options.json === 'object' && Object.keys(options.json).length > 0) {
            // Send JSON data as body (only for non-GET methods)
            if (gotOptions.method && gotOptions.method.toUpperCase() !== 'GET') {
                gotOptions.json = options.json;
            }
            // Also expect JSON response when sending JSON data
            gotOptions.responseType = 'json';
        } else if (options.json === true || 
                   (typeof options.json === 'object' && Object.keys(options.json).length === 0)) {
            // Just expect JSON response (empty object or true means expect JSON back)
            gotOptions.responseType = 'json';
        }
    }
    
    if (options.form) {
        gotOptions.form = options.form;
    }
    
    // Timeout
    if (options.timeout) {
        gotOptions.timeout = options.timeout;
    }
    
    // Keep response as text by default for compatibility (unless JSON is requested)
    if (!gotOptions.responseType) {
        gotOptions.responseType = 'text';
    }
    
    // Don't throw for HTTP errors - let the callback handle them like request library
    gotOptions.throwHttpErrors = false;
    
    return gotOptions;
}

/**
 * Convert got response to request-style response
 */
function convertGotResponse(gotResponse) {
    return {
        statusCode: gotResponse.statusCode,
        statusMessage: gotResponse.statusMessage,
        headers: gotResponse.headers,
        body: gotResponse.body
    };
}

/**
 * Main request function that mimics the request library API
 */
function request(options, callback) {
    // Handle case where first argument is a URL string
    if (typeof options === 'string') {
        options = { url: options };
    }
    
    const gotOptions = convertOptionsToGot(options);
    
    // If no callback provided, return a stream (for proxy.js streaming usage)
    if (!callback) {
        // Use got.stream directly and add request-compatible properties
        const gotStream = got.stream(gotOptions);
        
        // Add request-compatible properties
        gotStream.on('response', (response) => {
            gotStream.response = response;
            gotStream.statusCode = response.statusCode;
            gotStream.statusMessage = response.statusMessage;
            gotStream.headers = response.headers;
        });
        
        return gotStream;
    }
    
    // Handle callback-based requests
    got(gotOptions)
        .then((response) => {
            const requestResponse = convertGotResponse(response);
            callback(null, requestResponse, response.body);
        })
        .catch((error) => {
            // Handle non-HTTP errors (network errors, timeouts, etc.)
            // In case of non-HTTP errors, request library typically calls callback with (error, undefined, undefined)
            callback(error, undefined, undefined);
        });
}

module.exports = request;