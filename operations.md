# Operations Manual: logs and alarms
## Index

* [Logs](#logs)
* [Expected problems and known solutions](#problems)
* [Error naming code](#errorcode)

## <a name="logs"/>  Logs
There is only one log file associated with the process, in /var/log/pepProxy/pepProxy.log. This file receives the output (both error and standard) of the pepProxy service. This file is rotated with an external logrotate command.

The default log level is ERROR. There are two ways of changing the log level:
* The log level can be changed by editing the LOG_LEVEL parameter in the /etc/sysconfig/pepProxy configuration file.
The service must be restarted afterwards.
* The log level can also be changed without restarting the component, by using the administration API. The following
CURL command shows an example of how to change the logLevel to DEBUG.
```
curl -X PUT "http://localhost:11211/admin/log?level=DEBUG"
```

Every error message is identified with a prefix code in brackets. The code convention can be found in Apendix A.

## Fatal errors
The following sections list all the critical errors that may completely stop the service.
### Validation errors
#### VALIDATION-FATAL-001 Validation Request templates not found
Indicates that the XACML templates used to generate the validation requests are not present, so no interaction with the validation system will be possible. This is a critical error and must be fixed before the system starts working.
Considering the templates come packaged inside the RPM, the problem is most likely to be an installation problem. Check the contents of the RPM are all unpackaged, specifically the directory /opt/pepProxy/lib/templates.

#### PROXY-FATAL-001 Configured to die upon error in a redirection. Stopping process.
Indicates that the PEP Proxy was configured to die upon error in a redirection, and that redirection did occurr, so the PEP
proxy decided to gracefullt stop. This is an indication that the target of the PEP was down or there was some kind of 
error in the connection between the PEP Proxy and its target. Check the target is up and the network connectivity with the
PEP and restart the process.

## Standard errors
The following sections list all the errors that can appear in the log files, their severity and meaning and applicable actions whenever is possible.

### Proxy Errors
#### PROXY-GEN-001: Organization headers not found
A request has been received without the appropriate organization header. This is an error originated from the client and should not require intervention (if the request is coming from an internal component, that component's version should be checked).
#### PROXY-GEN-002: User ID headers not found
A request has been received without a user Token, so it couldn't be identified. This is an error originated from the client and should not require intervention (if the request is coming from an internal component, that component's version should be checked).
#### PROXY-GEN-003: Error initializing proxy: %s or Error initializing administration server: %s
There was an error creating the HTTP server socket for the process. The specific nature of the error will be stated in the message. This error is critical, and makes the service unavailable.
The most likely occurrence of this error will be when the IP address and port are already in use by other process (or an old instance of this service). Check the port is available using the netstat command.
#### PROXY-GEN-004: Error initializing administration server: %s
There was an error initializing the administration server for the PEP Proxy. This will usually mean there is some other software
running in the same port (maybe another instance of the PEP Proxy). Check there are no other PEP Proxy instances running in the
machine or, if there are, that those instances use different administration ports (check configuration manuals for details).

### Validation Errors
#### VALIDATION-GEN-001: Error connecting to Access Control: %d
There was a connection error sending a request to the Access Control. The specific nature of the error will be specified in the message. This is error is severe, and may have a big impact in the service.
This error can be caused by a transient network error, or a transient problem in the Access Control service, in which case it may not require human intervention. If the error is reproduced again, there may be a persistent problem: check the connectivity from the proxy machine to the Access Control one, and make sure the Access Control service is running in the appropriate port and responding to messages.
#### VALIDATION-GEN-002: Wrong status received by Access Control: %d
An unexpected status code was received for a request to the Access Control (on that was not specified in the API). This might be a transient problem (a 500 error due to any internal problem in the Access Control) or it might be consequence of a difference in the APIs (maybe because of a change in the version of the Access Control without a proper update in the PEP Proxy side).
If this error appears frequently, it may be critical, and compatibility of the versions of both components should be checked.
#### VALIDATION-GEN-003: Error connecting to Keystone authentication: %s
This error is raised when the PEP Proxy is not able to connect to Keystone to authenticate itself. The specific nature of the error will be specified in the message. This is error is severe, and may have a big impact in the service.
This error can be caused by a transient network error, or a transient problem in the Keystone service, in which case it may not require human intervention. If the error repeats, there may be a persistent problem: check the connectivity from the proxy machine to the Keystone one, and make sure the Keystone service is running in the appropriate port and responding to messages.
#### VALIDATION-GEN-004: Authentication against Keystone rejected with code %s
This error happens when Keystone rejects an authentication attempt of the PEP Proxy. This is a critical error: the proxy can't work at all without an authorization token.
This problem may be caused by a change in the credentials accepted by Keystone, and should require manual intervention to be solved. Check the PROXY_USERNAME and PROXY_PASSWORD in the /etc/sysconfig/pepProxy configuration file are valid credentials for the Keystone Proxy. Check Keystone's administration guid to see how to check the validity of a set of credentials.
If the credentials are not valid, a new set of credentials must be generated in the Keystone Proxy and configured in the PEP Proxy.
#### VALIDATION-GEN-005: Authentication error trying to authenticate the PEP Proxy %s
This error happens when Keystone fails to authenticate the PEP proxy (with a status code different than 401 or 404). This means
an internal error has happened in Keystone, and it may be incapable of processing requests. The problem might be transient but
it is critical: human supervision is highly advisable. Check the Keystone instance for error in its log and find the soluction in
the Keystone Operations Manual.

### Orion errors
#### ORION-PLUGIN-001: Wrong XML Payload. Action not found
Indicates that a received request didn't have the appropriate information to determine which action it's going to execute, so the validation process can't proceed. This is a client error and should not require human intervention. Warn the user if the error repeats.
#### ORION-PLUGIN-002: Wrong XML Payload. Parsing error: %s
An XML payload with syntactic errors has been received. This should be a client error, and it shouldn't require human intervention. Warn the user if the error repeats.
#### ORION-PLUGIN-003: Wrong JSON Payload: updateAction element not found
Indicates that a received request didn't have the appropriate information to determine which action it's going to execute, so the validation process can't proceed. This is a client error and should not require human intervention. Warn the user if the error repeats.
#### ORION-PLUGIN-004: Unknown content type: %s
The proxy received a request with a content type that is not supported. Currently only JSON ('application/json') and XML ('application/xml' and 'text/xml') are supported. This is a client error and should not require human intervention. This may be a problem with the content headers; if repeated, advice the client to check what headers are being sent and the API for the content payload.
#### ORION-PLUGIN-005: Action not found
This error is raised when a request action should be identifiable with the information in the URL but the proxy was unavailable to do so. It might happen when the request is trying to access a URL that is not known by the Orion plugin (maybe because the client is trying to access version of the Orion Context Broker different of the one supported by the proxy). This is a client error. The client should check the API he is trying to use is the appropriate one for this version of the proxy and the Context Broker.
#### ORION-PLUGIN-006: Wrong XML Payload. Parsing error: %s
An XML payload with syntactic errors has been received. This should be a client error, and it shouldn't require human intervention. Warn the user if the error repeats.

## <a name="problems"/> Expected problems and known solutions
| Symptoms | Causes | Procedure
|:---------------- |:--------------|:----------------------|
| An error log appears and the code has the prefix "PROXY-" | - | Look the log description in chapter 4.3.1 Proxy Errors |
| An error log appears and the code has the prefix "VALIDATION-" | - | Look the log description in chapter 4.3.2 Validation Errors |
| An error log appears and the code has the prefix "ORION-" | - | Look the log description in chapter 4.3.3 Orion Errors |

## <a name="errorcode"/> Error naming code
Every error has a code composed of a prefix and an ID, codified with the following table:

| Prefix | Module | Type of operation |
|:---------------- |:--------------|:----------------------|
| PROXY-GEN | fiware-pep-steelskin | Internal proxy error |
| VALIDATION-GEN | services/accessValidation | Access validation errors |
| VALIDATION-FATAL | services/accessValidation | Critical access validation module errors |
| ORION-PLUGIN | services/orionPlugin | Orion plugin errors |
 
