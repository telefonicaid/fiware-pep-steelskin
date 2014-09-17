# fiware-orion-pep
## Index

* [Overview](#overview)
* [Architecture](#architecture)
* [Deployment](#deployment)
* [Usage](#usage)
* [Administration](#administration)
* [Configuration](#configuration)
* [API With Access Control](#apiaccesscontrol)
* [Rules to determine the Context Broker action from the request](#rules)
* [Customizing PEP Proxy for other components](#customizing)
* [License](#licence)
* [Development documentation](#development)

## <a name="overview"/> Overview
The Orion Policy Enforcement Point (PEP) is a proxy meant to secure independent FiWare components, by intercepting every request sent to the component, validating it against the Access Control component. This validation is based in several pieces of data:

* User token: comes from the OAuth authorization server and is taken from the `x-auth-token` header.
* ServiceId: is read from the `fiware-service` header and identifies the protected component.
* SubserviceId: is read from the `fiware-servicepath` header and identifies further divisions of the service.
* Action: the PEP guess the action for a particular request by checking the path or inspecting the body. The logic for performing such actions depends on the component that is being secured, so the PEP will need a plugin for each of this components.

Communication with the Access Control is based on the [XACML protocol](http://docs.oasis-open.org/xacml/3.0/xacml-3.0-core-spec-os-en.html).

## <a name="architecture"/> Architecture Description
Orion Policy Enforcement Point Proxy is part of the authorization mechanism of the FIWARE platform. This authorization mechanism is based in OAuth 2.0, and it makes use of tokens to identify the user. 
 
![Alt text](https://raw.githubusercontent.com/telefonicaid/fiware-orion-pep/develop/img/arquitecture.png "Authorization Architecture")

Each request to a component holds some extra information (apart from the token) that can be used to identify what kind of action is requested to be executed and over what entity. This information may be explicit (using headers) or implicit (being part of the payload or the URL). The first task of the proxy is to extract this information (currently focused on the Context Broker, but will be compatible with other components in the future).

For each request, the proxy asks the IDM to validate the access token of the user (2). If the token is valid, the IDM answer with a response that contain the user roles (3). With those roles, the selected actions and resources (identified by the extra information) the PEP Proxy makes a request to the Access Manager for validation (4). This is an HTTP request using the XACML Request format. The Access Control component validates all the information and checks the retrieved data against the XACML Access Rules defined in the Identity Manager (4) (where each role for each user is associated with n permissions, each one of them defined using an XACML Rule). 

If the user is allowed to execute the requested action (5), the HTTP request is resend to the component (6); if it is not, it is rejected.

## <a name="deployment"/> Deployment
### Dependencies
The PEP Proxy is standard Node.js app and doesn't require more dependencies than the Node.js interpreter (0.10 or higher) and the NPM package utility. For RPM installations using Yum, those dependencies should be automatically installed.

### Without RPM Packages 
Just checkout this directory and install the Node.js dependencies using:

```
npm install --production
```

The proxy should be then ready to be configured and used.

### With RPM Packages
This project provides the specs to create the RPM Package for the project, that may (in the future) be installed in a package repository.

To generate the RPM, checkout the project to a machine with the RPM Build Tools installed, and, from the `rpm/` folder,
execute the following command:

```
./create-rpm.sh
```

This command will generate some folders, including one called RPMS, holding the RPM created for every architecture (noarch is currently generated).

In order to install the generated RPM from the local file, use the following command:

```
yum --nogpgcheck localinstall  pep-proxy-0.1-1.noarch.rpm
```

It should automatically download all the dependencies provided they are available (Node.js and NPM may require the EPEL repositories to be added).

### Deployment within a Context Broker installation
If the PEP Proxy is deployed in a machine with an installed Context Broker service, the PEP Proxy will automatically change the Context Broker port to the 10026 and install itself on the port where the Context Broker was listening.

During the uninstallation of the PEP Proxy, this process is reversed, to revert the Broker to its original state.

### Undeployment
In order to undeploy the proxy:
* If it was installed directly from the GIT repositories, just kill the process and remove the directory.
* If it was installed using the RPM, use standard YUM commands to remove it:

```
yum remove pep-proxy
```

### Configuration with an RPM package
If the PEP Proxy is deployed in a machine with an installed Context Broker service, the PEP Proxy will automatically change the Context Broker port to the 10026 and install itself on the port where the Context Broker was listening, so no further configuration should be needed for the connectivity.

During the uninstallation of the PEP Proxy, this process is reversed, to revert the Broker to its original state.
If there is no previous Context Broker instance, the default behaviour of the PEP Proxy is to listen in the port 1026 and redirect its requests to the port 10026 in the local host. This behaviour can be changed configuring the attributes PROXY_PORT and TARGET_PORT in the configuration file.

### Configuration without an RPM package
If the PEP Proxy is deployed directly from the source code, it won't add itself as a service, and the running ports should be configured manually. This configuration will involve two steps:
* Changing the port of the Context Broker to a different internal port (not open to external connections). Refer to the Orion Context Broker Deployment Manual for instructions on how to do it.
* Changing the port of the proxy to listen in the Context Broker original port, and to redirect to the new one. This parameters can be changed in the config.js file in the root folder.
Once configured, the service can be started as a demon with the following comand:

```
nohup bin/pep-proxy.js &> pep-proxy.log&
```

### Activate service
The proxy service is disabled once its installed. In order to enable it, use the following command:
```
service pepProxy start
```

### Log Rotation
Independently of how the service is installed, the log files will need an external rotation (e.g.: the logrotate command) to avoid disk full problems. 


## <a name="usage"/> Usage
The PEP Proxy can be started executing the following command from the project root:

```
bin/pep-proxy.js
```

## <a name="administration"/> Administration
###Service operations
####	Start service
To start the service, use either the service command:
service pepProxy start

Or just the launch script:
```
/etc/init.d/pepProxy start
```
For testing purposes it might be interesting to launch the process directly without the service. That can be done executing the following command from the project root directory:
```
./bin/pepProxy
```

Take into account that when the process is executed manually the system configuration for the script (in /etc/sysconfig/pepProxy) is not loaded and the default configuration (in /opt/pepProxy/config.js) is used. 

####	Stop service
To stop the service, use either the service command:
```
service pepProxy stop
```
Or just the launch script:
```
/etc/init.d/pepProxy stop
```
###	How to check service status
####	Checking the process is running
The status of the process can be retrieved using the service command:
```
service pepProxy status
```
It also can be checked with ps, using a filter with the command name:
```
ps -ef | grep "bin/pepProxy"
```
In both cases a result of 0 (echoing $?) indicates the process is supposed to be running, and an error otherwise.
#### Checking that the port is listening
The following command:
```
netstat -ntpl | grep 1026
```
can be used to check the process is listening in the appropriate port (provided the port is the standard 1026). The result should resemble this line:
```
tcp   0   0  0.0.0.0:1026     0.0.0.0:*   LISTEN   12179/node
```

## <a name="configuration"/> Configuration
All the configuration of the proxy is stored in the `config.js` file in the root of the project folder.

### Basic Configuration
In order to have the proxy running, there are several basic pieces of information to fill:
* `config.resource.proxy`: The information of the server proxy itself (mainly the port).
* `config.resource.original`: The address and port of the proxied server.
* `config.authentication.username`: username of the PEP proxy in the IDM.
* `config.authentication.password`: password of the PEP proxy in the IDM.
* `config.authentication.host`: host where the authentication host is listening (for the proxy to authenticate itself).
* `config.access.host`: hot where the Keystone proxy is located (usually the same as the authentication host).

### SSL Configuration
If SSL Termination is not available, the PEP Proxy can be configured to listen HTTPS instead of plain HTTP. To activate the SSL:

* Create the appropiate public keys and certificates and store them in the PEP Proxy machine.
* In the `config.js` file, change the `config.ssl.active` flag to true.
* In the same ssl object in the configuration, fill the path to the key and cert files.

## <a name="apiaccesscontrol"/> API With Access Control
The validation of each request si done connecting with the Access Control component, which, using the information provided by the PEP Proxy, decides whether the user can execute the selected action in this organization or not. The following is a summary of this interaction with some examples.


### Request
The XACML Request maps the information extracted from the request and from the IDM (roles, organization and action) to XACML categories (`access-subject`, `resource` and `action`, respectively). 
```
<?xml version="1.0" encoding="UTF-8"?>
<Request xmlns="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17 http://docs.oasis-open.org/xacml/3.0/xacml-core-v3-schema-wd-17.xsd"
         ReturnPolicyIdList="false">
    <!-- X-Auth-Token-->
    <Attributes Category="urn:oasis:names:tc:xacml:1.0:subject-category:access-subject">
        <Attribute IncludeInResult="false"
                   AttributeId="urn:oasis:names:tc:xacml:1.0:subject:subject-id">
            <AttributeValue
                    DataType="http://www.w3.org/2001/XMLSchema#int">511</AttributeValue>
        </Attribute>
    </Attributes>
    <!-- fiware resource name being accessed: organization id -->
    <Attributes
            Category="urn:oasis:names:tc:xacml:3.0:attribute-category:resource">
        <Attribute IncludeInResult="false"
                   AttributeId="urn:oasis:names:tc:xacml:1.0:resource:resource-id">
            <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">frn:contextbroker:551:::</AttributeValue>
        </Attribute>
    </Attributes>
    <!-- action performed -->
    <Attributes
            Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action">
        <Attribute IncludeInResult="false"
                   AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id">
            <AttributeValue DataType="http://www.w3.org/2001/XMLSchema#string">create</AttributeValue>
        </Attribute>
    </Attributes>
</Request>
```

### Response
The XACML Response returns a `Decision` element that can have the following values: “Permit”, “Deny”, “NotApplicable” or “Indeterminate”. The subset of allowable values understood by the PEP Proxy is:
* `Permit`: allows the request to continue its way to the Context Broker.
* `Deny`: rejects the request, returning a 403 error to the requestor.


```
<?xml version="1.0" encoding="UTF-8"?>
<Response xmlns="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17 http://docs.oasis-open.org/xacml/3.0/xacml-core-v3-schema-wd-17.xsd">
    <Result>
        <Decision>Permit</Decision>
    </Result>
</Response>
```
## <a name="rules"/> Rules to determine the Context Broker action from the request

### Available actions

This is the list of actions available for the Context Broker. For every action, the abbreviature is also shown (will be used in some of the following tables). 

| Action | Abbreviature |
| ------ |:------------:|
| create | C            |
| update | U            |
| delete | D            |
| read | R            |
| subscribe | S            |
| register | Reg           |
| discover | Dis            |
| subscribe-availability | S-A            |

### Standard operations
* `create`: URL contains `/ngsi10/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is `APPEND`.
* `update`: URL contains `/ngsi10/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is `UPDATE`.
* `delete`: URL contains `/ngsi10/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is “DELETE”.
* `read`: URL contains `/ngsi10/queryContext`.
* `subscribe`: URL contains  `/ngsi10/subscribeContext`, `/ngsi10/updateContextSubscription` o `/ngsi10/unsubscribeContext`.
* `register`: URL contains `/ngsi9/registerContext`.
* `discover`: URL contains `/nsgi9/discoverContextAvailability`.
* `subscribe-availability`: URL contains `/ngsi9/subscribeContextAvailability`, `/ngsi9/updateContextAvailabilitySubscription` o `/ngsi9/unsubscribeContextAvailability`.

### Convenience operations
The following tables show the rules for detemining the action based on Method and path of the request. 

An up-to-date list of the convenience operations can be found [here](https://docs.google.com/spreadsheet/ccc?key=0Aj_S9VF3rt5DdEhqZHlBaGVURmhZRDY3aDRBdlpHS3c#gid=0).

#### NGSI9 (context information availability)
| Method | Path                                                                                     | Action |
| ------ |:--------------------------------------------------------------------------------------- | ---:|
| GET    | /ngsi9/contextEntities/{EntityId}                                                      	| Dis |
| POST   | /ngsi9/contextEntities/{EntityId}                                                      	| Reg |
| GET    | /ngsi9/contextEntities/{EntityId}/attributes                                           	| -   |
| POST   | /ngsi9/contextEntities/{EntityId}/attributes                                           	| -   |
| GET    | /ngsi9/contextEntities/{EntityId}/attributes/{attributeName}                           	| Dis |
| POST   | /ngsi9/contextEntities/{EntityId}/attributes/{attributeName}                          	| Reg |
| GET    | /ngsi9/contextEntities/{EntityId}/attributeDomains/{attributeDomainName}               	| Dis |
| POST   | /ngsi9/contextEntities/{EntityId}/attributeDomains/{attributeDomainName}               	| Reg |
| GET    | /ngsi9/contextEntityTypes/{typeName}                                                   	| Dis |
| POST   | /ngsi9/contextEntityTypes/{typeName}                                                   	| Reg |
| GET    | /ngsi9/contextEntityTypes/{typeName}/attributes                                        	| -   |
| POST   | /ngsi9/contextEntityTypes/{typeName}/attributes                                        	| -   |
| GET    | /ngsi9/contextEntityTypes/{typeName}/attributes/{attributeName}                        	| Dis |
| POST   | /ngsi9/contextEntityTypes/{typeName}/attributes/{attributeName}                        	| Reg |
| GET    | /ngsi9/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}            	| Dis |
| POST   | /ngsi9/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}            	| Reg |
| POST   | /ngsi9/contextAvailabilitySubscriptions                                                	| S-A |
| PUT    | /ngsi9/contextAvailabilitySubscriptions/{subscriptionId}                               	| S-A |
| DELETE | /ngsi9/contextAvailabilitySubscriptions/{subscriptionId}                               	| S-A |

#### NGS10 (context information availability)
| Method | Path                                                                                     | Action |
| ------ |:--------------------------------------------------------------------------------------- | ---:|
| GET    | /ngsi10/contextEntities/{EntityID}                                                     	| R |
| PUT    | /ngsi10/contextEntities/{EntityID}                                                     	| U |
| POST   | /ngsi10/contextEntities/{EntityID}                                                     	| C |
| DELETE | /ngsi10/contextEntities/{EntityID}                                                     	| D |
| GET    | /ngsi10/contextEntities/{EntityID}/attributes                                          	| - |
| PUT    | /ngsi10/contextEntities/{EntityID}/attributes                                          	| - |
| POST   | /ngsi10/contextEntities/{EntityID}/attributes                                          	| - |
| DELETE | /ngsi10/contextEntities/{EntityID}/attributes                                          	| - |
| GET    | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}                          	| R |
| POST   | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}                          	| C |
| PUT    | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}                          	| U |
| DELETE | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}                          	| D |
| GET    | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| R |
| PUT    | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| U |
| DELETE | /ngsi10/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| D |
| GET    | /ngsi10/contextEntities/{EntityID}/attributeDomains/{attributeDomainName}              	| R |
| GET    | /ngsi10/contextEntityTypes/{typeName}                                                  	| R |
| GET    | /ngsi10/contextEntityTypes/{typeName}/attributes                                       	| - |
| GET    | /ngsi10/contextEntityTypes/{typeName}/attributes/{attributeName}                       	| R |
| GET    | /ngsi10/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}           	| R |
| POST   | /ngsi10/contextSubscriptions                                                           	| S |
| PUT    | /ngsi10/contextSubscriptions/{subscriptionID}                                          	| S |
| DELETE | /ngsi10/contextSubscriptions/{subscriptionID}                                          	| S |


## <a name="customizing"/> Customizing PEP Proxy for other components
Although the Orion PEP Proxy was meant to protect the access to the Context Broker using the rules defined in the Access Control, it was designed to easily adapt to other components. Most of the code of the proxy (i.e. the extraction of user data, the communication with the Keystone Proxy and the proxy process itself) will execute exactly the same for all the components. The exception is the rule to determine the action the request is trying to perform. To address this behavior and possible actions different customizations of the proxy could need, the proxy allows for the introduction of middlewares in the validation process.

### Middleware definition
The middlewares are quite similar to the ones used by the Connect (or Express) framework. A middleware is a function that receives three parameters:

* req: The object representing the incoming HTTP request. Along with all the request information, the request is used to store the information for the validation process (i.e. attributes `userId` with the user token, `organization` with the organization extracted from the headers and `action` that should be filled in by the middlewares).
* res: The object representing the response. This object can be used to stop the request pipeline due to conditions defined by the specific component (although it is advisable to use a `next(error)` call with a custom error to allow the error to be handled by the proxy).
* next: Callback used to call the next middleware in the chain. In the current version, it is required that the call to the next middleware contains both the request and response objects (this behavior is not the same as the one in Connect middlewares). If the first parameter in the call is an error, the request will be rejected. If the first parameter is null or undefined, the request will continue through the validation process. This is an example of a call to next that lets the request follow through:

```
next(null, req, res);
```

### Middleware configuration
The middlewares must be defined inside a Node.js module. They can be configured using the `config.middlewares` object of the `config.js` file. This object contains two attributes:

* `require`: path to the module that contains the middlewares, from the project root. The system currently supports only modules defined inside the fiware-orion-pep project (or in accessible folders). 
* `functions`: list of the middlewares to load. The names in this list must be exported functions of the module selected in the previous attribute.

## <a name="licence"/> License

Orion FiWare Policy Enforcement Point is licensed under Affero General Public License (GPL) version 3.

## <a name="development"/> Development documentation
### Project build
The project is managed using Grunt Task Runner.

For a list of available task, type
```bash
grunt --help
```

The following sections show the available options in detail.


### Testing
[Mocha](http://visionmedia.github.io/mocha/) Test Runner + [Chai](http://chaijs.com/) Assertion Library + [Sinon](http://sinonjs.org/) Spies, stubs.

The test environment is preconfigured to run [BDD](http://chaijs.com/api/bdd/) testing style with
`chai.expect` and `chai.should()` available globally while executing tests, as well as the [Sinon-Chai](http://chaijs.com/plugins/sinon-chai) plugin.

Module mocking during testing can be done with [proxyquire](https://github.com/thlorenz/proxyquire)

To run tests, type
```bash
grunt test
```

Tests reports can be used together with Jenkins to monitor project quality metrics by means of TAP or XUnit plugins.
To generate TAP report in `report/test/unit_tests.tap`, type
```bash
grunt test-report
```


### Coding guidelines
jshint, gjslint

Uses provided .jshintrc and .gjslintrc flag files. The latter requires Python and its use can be disabled
while creating the project skeleton with grunt-init.
To check source code style, type
```bash
grunt lint
```

Checkstyle reports can be used together with Jenkins to monitor project quality metrics by means of Checkstyle
and Violations plugins.
To generate Checkstyle and JSLint reports under `report/lint/`, type
```bash
grunt lint-report
```


### Continuous testing

Support for continuous testing by modifying a src file or a test.
For continuous testing, type
```bash
grunt watch
```


### Source Code documentation
dox-foundation

Generates HTML documentation under `site/doc/`. It can be used together with jenkins by means of DocLinks plugin.
For compiling source code documentation, type
```bash
grunt doc
```


### Code Coverage
Istanbul

Analizes the code coverage of your tests.

To generate an HTML coverage report under `site/coverage/` and to print out a summary, type
```bash
# Use git-bash on Windows
grunt coverage
```

To generate a Cobertura report in `report/coverage/cobertura-coverage.xml` that can be used together with Jenkins to
monitor project quality metrics by means of Cobertura plugin, type
```bash
# Use git-bash on Windows
grunt coverage-report
```


### Code complexity
Plato

Analizes code complexity using Plato and stores the report under `site/report/`. It can be used together with jenkins
by means of DocLinks plugin.
For complexity report, type
```bash
grunt complexity
```

### PLC

Update the contributors for the project
```bash
grunt contributors
```


### Development environment

Initialize your environment with git hooks.
```bash
grunt init-dev-env 
```

We strongly suggest you to make an automatic execution of this task for every developer simply by adding the following
lines to your `package.json`
```
{
  "scripts": {
     "postinstall": "grunt init-dev-env"
  }
}
``` 


### Site generation

There is a grunt task to generate the GitHub pages of the project, publishing also coverage, complexity and JSDocs pages.
In order to initialize the GitHub pages, use:

```bash
grunt init-pages
```

This will also create a site folder under the root of your repository. This site folder is detached from your repository's
history, and associated to the gh-pages branch, created for publishing. This initialization action should be done only
once in the project history. Once the site has been initialized, publish with the following command:

```bash
grunt site
```

This command will only work after the developer has executed init-dev-env (that's the goal that will create the detached site).

This command will also launch the coverage, doc and complexity task (see in the above sections).

