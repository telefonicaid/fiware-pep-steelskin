/*
 * Copyright 2014 Telefonica Investigación y Desarrollo, S.A.U
 *
 * This file is part of fiware-iotagent-lib
 *
 * fiware-pep-steelskin is free software: you can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the License,
 * or (at your option) any later version.
 *
 * fiware-iotagent-lib is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with fiware-pep-steelskin.
 * If not, see http://www.gnu.org/licenses/.
 *
 * For those usages not covered by the GNU Affero General Public License
 * please contact with::daniel.moranjimenez@telefonica.com
 */

const got = require('got');
const logger = require('logops');

/**
 *  Transform the "request" options into "got" options and add additional "got" defaults
 *
 *  The following options are currently exposed:
 *   - `method` - HTTP Method
 *   - `searchParams` - query string params
 *   - `qs` - alias for query string params
 *   - `headers`
 *   - `responseType` - either `text` or `json`. `json` is the default
 *   - `json` - a supplied JSON object as the request body
 *   - `body` - any ASCII text as  the request body
 *   - `url` - the request URL
 *   - `uri` - alternative alias for the request URL.
 *
 * @param {Object} options          Original definition of the request using the request library
 * @return {Object}                 Updated definition of the request using the got library
 *
 */
function getOptions(options) {
    const httpOptions = {
        method: options.method,
        searchParams: options.searchParams || options.qs,
        headers: options.headers,
        throwHttpErrors: false, // Always false to match request library behavior
        retry: options.retry || 0,
        // Don't set responseType automatically - let got handle it based on content-type
        // We'll do manual JSON parsing in the response handler to match request library behavior
        responseType: 'text'
    };

    // got library is not properly documented, so it is not clear which takes precedence
    // among body, json and form (see https://stackoverflow.com/q/70754880/1485926).
    // Thus, we are enforcing our own precedence with the "else if" chain below.
    // Behaviour is consistent with the one described at development.md#iotagentlibrequest
    if (options.method === 'GET' || options.method === 'HEAD' || options.method === 'OPTIONS') {
        // Do nothing - Never add a body for GET/HEAD/OPTIONS methods
        // This is intentionally empty to avoid adding request body to these methods
        httpOptions.body = undefined;
    } else if (options.body) {
        // body takes precedence over json or form
        httpOptions.body = options.body;
    } else if (options.json) {
        // For json option, convert the object to JSON string and set appropriate headers
        // This matches the original request library behavior
        httpOptions.body = JSON.stringify(options.json);
        if (!httpOptions.headers) {
            httpOptions.headers = {};
        }
        if (!httpOptions.headers['content-type'] && !httpOptions.headers['Content-Type']) {
            httpOptions.headers['Content-Type'] = 'application/json';
        }
    } else if (options.form) {
        // Note that we don't consider 'form' part of the function API (check development.md#iotagentlibrequest)
        // but we are preparing the code anyway as a safe measure
        httpOptions.form = options.form;
    }

    return httpOptions;
}

/*
 *
 *  Make a direct HTTP request using the underlying request library
 *  (currently [got](https://github.com/sindresorhus/got)),
 *
 *  This function mimics the interface of the obsolete request library and switches
 *  back from promises to callbacks to avoid re-writing large chunks of code.
 *  This centralizes all HTTP requests in a single location and is useful
 *  when creating agents which use an HTTP transport for their southbound
 *  commands, and removes the need for the custom IoT Agent to import its own
 *  additonal request library.
 *
 * @param {Object} options            Definition of the request .
 * @param {Function} callback         The callback function.
 *
 */

function request(options, callback) {
    if (!callback || typeof callback !== 'function') {
        throw new Error('Callback function is required');
    }

    const httpOptions = getOptions(options);
    
    got(options.url || options.uri, httpOptions)
        .then((response) => {
            try {
                let responseBody = response.body;
                
                // Auto-parse JSON responses to match original request library behavior
                // Original request library automatically parses JSON when Content-Type is application/json
                if (typeof responseBody === 'string' && response.headers['content-type']) {
                    const contentType = response.headers['content-type'].toLowerCase();
                    if (contentType.includes('application/json')) {
                        try {
                            responseBody = JSON.parse(responseBody);
                        } catch (e) {
                            // Keep original body if parsing fails
                        }
                    }
                }
                
                // Create response object that matches original request library format
                const requestStyleResponse = {
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage,
                    headers: response.headers,
                    body: responseBody,
                    // Include other properties that tests might expect
                    request: response.request
                };
                
                // Match original request library interface: callback(error, response, body)
                callback(null, requestStyleResponse, responseBody);
            } catch (error) {
                // Even in case of error, provide a minimal response object
                const minimalResponse = {
                    statusCode: 500,
                    statusMessage: 'Internal Error',
                    headers: {},
                    body: undefined
                };
                callback(error, minimalResponse, undefined);
            }
        })
        .catch((error) => {
            // Handle circular references in error logging safely
            const errorInfo = {
                name: error.name,
                message: error.message,
                code: error.code,
                statusCode: error.response ? error.response.statusCode : undefined,
                statusMessage: error.response ? error.response.statusMessage : undefined
            };
            
            // For network errors (no response), pass the error but still provide response object
            // For HTTP errors, got should not throw since we set throwHttpErrors: false
            // But if it does throw, we should still provide a response object if available
            if (error.response) {
                const requestStyleResponse = {
                    statusCode: error.response.statusCode,
                    statusMessage: error.response.statusMessage,
                    headers: error.response.headers,
                    body: error.response.body
                };
                logger.debug('ERROR with response: %s', JSON.stringify({
                    statusCode: requestStyleResponse.statusCode, 
                    statusMessage: requestStyleResponse.statusMessage
                }, null, 4));
                // For HTTP errors (like 403, 404), the original request library does NOT pass the error as first parameter
                // It only passes error for network-level errors
                return callback(null, requestStyleResponse, error.response.body);
            } else {
                // Even for network errors, provide a minimal response object to match request library behavior
                const minimalResponse = {
                    statusCode: error.code === 'ECONNREFUSED' ? 500 : 
                               (error.name === 'HTTPError' ? 500 : undefined),
                    statusMessage: error.message,
                    headers: {},
                    body: undefined
                };
                console.log('ERROR without response: %s', JSON.stringify({
                    error: error.message, 
                    code: error.code, 
                    name: error.name, 
                    statusCode: minimalResponse.statusCode,
                    url: options.url || options.uri
                }, null, 4));
                // For network errors, the original request library DOES pass the error
                return callback(error, minimalResponse, undefined);
            }
        });
}

module.exports = request;
