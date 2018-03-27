# fiware-pep-steelskin
## Index

* [Overview](#overview)
* [Deployment](#deployment)
* [Usage](#usage)
* [Administration](#administration)
* [Configuration](#configuration)
* [API With Access Control](#apiaccesscontrol)
* [Rules to determine the Context Broker action from the request](#rules)
* [Rules to determine the Perseo action from the request](#rulesPerseo)
* [Rules to determine the Keypass Access Control action from the request](#rulesKeypass)
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

Along this document, the term IDM (Identity Manager) will be used, as a general term to refer to the server providing user and role creation and authentication. The currently supported IDM is Keystone; a Keyrock IDM option is provided as well, but it may be deprecated in the near future.

Three other documents provide further information about the PEP Proxy:

* [Operations Manual](operations.md): provides information on logs and alarms.
* [Architecture information](architecture.md): provides further information on how the PEP works and is structured.
* [Keystone installation](keystoneInstallation.md): provides an example of Keystone installation with services and subservices
 that can be used to test the PEP Proxy and play with its features.

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
./create-rpm.sh <release-number> <release-version>
```

This command will generate some folders, including one called RPMS, holding the RPM created for every architecture (noarch is currently generated).

In order to install the generated RPM from the local file, use the following command (changing the PEP RPM for the one you have just generated; X.Y.Z being the version you are about to install):

```
yum --nogpgcheck localinstall  pep-proxy-X.Y-Z.noarch.rpm
```

It should automatically download all the dependencies provided they are available (Node.js and NPM may require the EPEL repositories to be added).

### With Docker
There are automatic builds of the development version of the Steelskin PEP Proxy published in Docker hub. In order to install
using the docker version, just execute the following:
```
docker run -p 11211:11211 -p 1026:1026 -e LOG_LEVEL=DEBUG -e AUTHENTICATION_HOST=<Keystone-host> -e ACCESS_HOST=<Access-control-host> -e TARGET_HOST=<Orion-host> telefonicaiot/fiware-pep-steelskin
```
This command will create a docker container with a PEP Steelskin running, using <Keystone-host> for token validation and
authentication, <Access-control-host> for access control and redirecting allowed requests to <Orion-host>. Remember there
are more environment variables you can use to tailor Steelskin configuration to suit your needs; you can find the complete
list in the configuration section below.

Take note that this command expose two ports: the 1026 port for component requests and the administration port, 11211.

### Build your own Docker image
There is also the possibility to build your own local Docker image of the PEP component.

To do it, follow the next steps once you have installed Docker in your machine:

1. Navigate to the path where the component repository was cloned.
2. Launch a Docker build
    * Using the default NodeJS version of the operating system used defined in FROM keyword of Dockerfile:
    ```bash
    sudo docker build -f Dockerfile .
    ```
    * Using an alternative NodeJS version:
    ```bash
    sudo docker build --build-arg NODEJS_VERSION=0.10.46 -f Dockerfile .
    ```

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
If the PEP Proxy is not started as a service, it can be started executing the following command from the project root:

```
bin/pep-proxy.js
```

Once the PEP Proxy is working, it can be used to enforce both authentication and authorization over the protected component (e.g. Orion Context Broker). In order to enforce both actions, the PEP Proxy has to be connected to an [Identity Manager](https://github.com/ging/fi-ware-idm) server and an [Access Manager](https://github.com/telefonicaid/fiware-keypass) server. Next sections will show some examples of both processes.

Note that, in order for a request to be authorized through the Access Control, it's mandatory that it contains all of the following headers:
* **x-auth-token**: should contain a valid user token, generated by the IDM.
* **fiware-service**: should contain the name of a service created in the IDM and the user must have access to it.
* **fiware-servicepath**: should contain a route to a subservice, begining with a slash '/' symbol.

This headers are used by the IDM and Access Control systems to make the decisions about the request, so if any of them are missing, the request will not progress any further, and will be rejected with a 400 HTTP error code. For a detailed explanation of the returned errors, please refer to the [API Error codes](errorcodes.md).

The proxy can also work in an authentication-only mode (using the `config.access.disable` flag), in which case the `fiware-service` and `fiware-servicepath` headers can be marked as optional, or checked anyway for validity (controlled by the `config.authentication.checkHeaders` flag). Header checking cannot be disabled for PEP Proxies performing authorization processes.

### Authentication

The authentication process is based on OAuth v2 tokens. The PEP Proxy expects all the requests to have a header `x-auth-token` containing a valid access token from the IDM. All the requests without this requirement are rejected with a 401 error. 

PEP Proxy currently supports two possible authentication authorities: Keyrock IdM and Openstack Keystone. The following sections show how to retrieve a token with each of this authentication technologies. The module can be configured using the config.authentication.module option.

#### Keyrock IdM

In order to get an access token to send with the request, a user can send a request to the IDM, with its user and password (here shown as a curl request):

```
curl -i --user <serverUser>:<serverPassword> -X POST -H "Content-Type: application/x-www-form-urlencoded" https://<idmHostName>/oauth2/token -d 'grant_type=password&username=<theUserName>&password=<theUserPassword>'
```

If the user and password are correct, the response will be like the following:

```
{
    "access_token":"O-OqiBR1AbZk7qfyidF3AwMeBY253xYEpUdkv",
    "refresh_token":"Ny0OwE19230QfftxXYGwwgOLafa5v2xnI5t6HWdQ",
    "token_type":"bearer",
    "expires_in":2591999
}
```

The `access_token` field contains the required token. 

The must be used also to assign roles to each user. For details about role creation and assign, check the IDM API.

#### Keystone
In order to get its access token, a user can send the following request to Keystone:
```
curl http://localhost:5000/v3/auth/tokens \
    -s \
    -i \
    -H "Content-Type: application/json" \
    -d '
{
    "auth": {
        "identity": {
            "methods": [
                "password"
            ],
            "password": {
                "user": {
                    "domain": {
                        "name": "SmartCity"
                    },
                    "name": "alice",
                    "password": "password"
                }
            }
        }
    }
}'
```
The token can be found in the `X-Subject-Token` header of the response:
```
X-Subject-Token: MIIC3AYJKoZIhvcNAQcCoIICzTCCAskCAQExCTAHBgUrDgMCGjCCATIGCSqGSIb3DQEHAaCCASMEggEfeyJ0b2tlbiI6IHsiaXNzdWVkX2F0IjogIjIwMTQtMTAtMTBUMTA6NTA6NDkuNTMyNTQyWiIsICJleHRyYXMiOiB7fSwgIm1ldGhvZHMiOiBbInBhc3N3b3JkIl0sICJleHBpcmVzX2F0IjogIjIwMTQtMTAtMTBUMTE6NTA6NDkuNTMyNDkxWiIsICJ1c2VyIjogeyJkb21haW4iOiB7ImlkIjogImY3YTViOGUzMDNlYzQzZThhOTEyZmUyNmZhNzlkYzAyIiwgIm5hbWUiOiAiU21hcnRWYWxlbmNpYSJ9LCAiaWQiOiAiNWU4MTdjNWUwZDYyNGVlNjhkZmI3YTcyZDBkMzFjZTQiLCAibmFtZSI6ICJhbGljZSJ9fX0xggGBMIIBfQIBATBcMFcxCzAJBgNVBAYTAlVTMQ4wDAYDVQQIDAVVbnNldDEOMAwGA1UEBwwFVW5zZXQxDjAMBgNVBAoMBVVuc2V0MRgwFgYDVQQDDA93d3cuZXhhbXBsZS5jb20CAQEwBwYFKw4DAhowDQYJKoZIhvcNAQEBBQAEggEAKRGV3uu8fiS7UNm47KhltSjlY1e7KnedUcD-mdwz6Asbo7X9hbtljy1ml9gGcuMf6vX4tycx4goRyMARPS7YKROd0evZtnYArIyx0IrmwDaqodwp8BxBCxFgHRZtCwzHvZFEaUcClydQq7HJvBfTgTwH4v1aJkMyK8wLMP-CYyiZSfCIWPVnoB9I3P56jeKHkmcryYLgT2I-AwDBj1zd9HPzUjyQuNj5rCMkJjvz-A9-hef6AMMZuYPMIYdkei+deq86O1qFuo7PpO2SA7QWkqjcsKs9v+myvHhLrBre9GLP2hP1rc4D67lSL2XB1UY20mc6FNIVIErxT0DOSXltXQ==
Vary: X-Auth-Token
Content-Type: application/json
Content-Length: 287
Date: Fri, 10 Oct 2014 10:50:49 GMT

{
  "token": {
    "issued_at": "2014-10-10T10:50:49.532542Z",
    "extras": {},
    "methods": [
      "password"
    ],
    "expires_at": "2014-10-10T11:50:49.532491Z",
    "user": {
      "domain": {
        "id": "f7a5b8e303ec43e8a912fe26fa79dc02",
        "name": "SmartValencia"
      },
      "id": "5e817c5e0d624ee68dfb7a72d0d31ce4",
      "name": "alice"
    }
  }
}
```

For details on user and role creation, check the Keystone API.

### Authorization

Once the user is authenticated, the PEP Proxy will ask the Access Control for its permissions. In order for the request to be accepted, at least one rule has to match the request information and the user roles. 

Rules are defined in [XACML](https://www.oasis-open.org/committees/xacml/). The particular rules will depend on each case and are left to the authorization designer. The following document shows a typical rule explained for the use case of a Context Broker:

```
<Policy xsi:schemaLocation="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17
    http://docs.oasis-open.org/xacml/3.0/xacml-core-v3-schema-wd-17.xsd"
        PolicyId="policy03"
        RuleCombiningAlgId="urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-unless-permit"
        Version="1.0" xmlns="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <Target>
    <AnyOf>
      <AllOf>
        <Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-regexp-match">
          <AttributeValue
              DataType="http://www.w3.org/2001/XMLSchema#string"
              >frn:contextbroker:551:833:.*</AttributeValue>
          <AttributeDesignator
              AttributeId="urn:oasis:names:tc:xacml:1.0:resource:resource-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"
              MustBePresent="true"
              Category="urn:oasis:names:tc:xacml:3.0:attribute-category:resource" />
        </Match>
      </AllOf>
    </AnyOf>
  </Target>

  <Rule RuleId="policy03rule01" Effect="Permit">

    <Condition>
      <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
        <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-one-and-only">
          <AttributeDesignator
              AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"
              MustBePresent="true"
              Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" />
        </Apply>
        <AttributeValue
            DataType="http://www.w3.org/2001/XMLSchema#string"
            >read</AttributeValue>
      </Apply>
    </Condition>
  </Rule>

</Policy>

```

All the rules are associated to a service ID (the value of the `fiware-service` header) and a subservice. When the request arrives to the Access Control, the later will retrieve all the permissions for the user roles, each one represented by a XACML policy. All the policies are applied then in order to find any that would let the request be executed.

In the example, the policy states the following: "if the resource has the prefix `frn:contextbroker:551:833:` and the action `read` the request would be allowed". This policy will allow read access over all the resources in subservice `833` of the service `551` to the roles that have it assigned. The meaning of the term resource will depend on the component which is being protected by the particular access rules. E.g.: for Orion Context Broker, the resources will be the entities of the CB; for each entity, the Policy Enforcement Point of the CB will generate a FRN, composed of the aforementioned prefix plus the identifier of the entity itself. 

Another example could be this the following:

```
<Policy xsi:schemaLocation="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17
    http://docs.oasis-open.org/xacml/3.0/xacml-core-v3-schema-wd-17.xsd"
        PolicyId="policy02"
        RuleCombiningAlgId="urn:oasis:names:tc:xacml:3.0:rule-combining-algorithm:deny-unless-permit"
        Version="1.0" xmlns="urn:oasis:names:tc:xacml:3.0:core:schema:wd-17"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

  <Target>
    <AnyOf>
      <AllOf>
        <Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
          <AttributeValue
              DataType="http://www.w3.org/2001/XMLSchema#string">admin</AttributeValue>
          <AttributeDesignator
              AttributeId="urn:oasis:names:tc:xacml:1.0:subject:subject-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"
              MustBePresent="false"
              Category="urn:oasis:names:tc:xacml:1.0:subject-category:access-subject" />
        </Match>
        <Match MatchId="urn:oasis:names:tc:xacml:1.0:function:string-regexp-match">
          <AttributeValue
              DataType="http://www.w3.org/2001/XMLSchema#string">frn:contextbroker:551:833:.*</AttributeValue>
          <AttributeDesignator
              AttributeId="urn:oasis:names:tc:xacml:1.0:resource:resource-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"
              MustBePresent="true"
              Category="urn:oasis:names:tc:xacml:3.0:attribute-category:resource" />
        </Match>
      </AllOf>
    </AnyOf>
  </Target>

  <Rule RuleId="policy02rule01" Effect="Permit">

    <Condition>
      <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-equal">
        <Apply FunctionId="urn:oasis:names:tc:xacml:1.0:function:string-one-and-only">
          <AttributeDesignator
              AttributeId="urn:oasis:names:tc:xacml:1.0:action:action-id"
              DataType="http://www.w3.org/2001/XMLSchema#string"
              MustBePresent="true"
              Category="urn:oasis:names:tc:xacml:3.0:attribute-category:action" />
        </Apply>
        <AttributeValue
            DataType="http://www.w3.org/2001/XMLSchema#string">write</AttributeValue>
      </Apply>
    </Condition>
  </Rule>

</Policy>

```

In this example, only those users with `subjectId` (user's role) "admin" may write on resources of tenant 511 and subservice 833.

Any number of policies can be included in the Access Control for each pair (tenant, subject). If any of the policies can be applied to the request and `Permit` the request, then the global result is a `Permit`. If none of the policies can be applied (no target exist for the tenant, subservice and subject of the request) the result will be `NotApplicable`. If there are policies that can be applied but all of them deny the access, the result will be a `Deny`.

## <a name="administration"/> Administration

#### Start service
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
#### Checking the process is running
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
#### Checking the version in the Administration API
The PEP Proxy provides an Administration port that can be used to check whether the proxy is up and listening or down.
The administration API consists in a single `/version` path, that returns useful information from the proxy (currently just the listening port and version).

Example of output:
```
{
  "version": "0.4.1-next",
  "port": 1026
}
```

## <a name="configuration"/> Configuration
All the configuration of the proxy is stored in the `config.js` file in the root of the project folder. The values set inside config.js operate as the default values for all the important pieces of configuration data, so it is important none of them are removed (you can change them to suit your needs, as long as they have a valid value).

Another way of configuring the component is through the use of environment variables, although less configuration options are exposed with this mechanism.

### Basic Configuration
In order to have the proxy running, there are several basic pieces of information to fill:
* `config.resource.proxy`: The information of the server proxy itself. Two ports must be configured for the proxy: `port` indicates in which port is the proxy listening for requests; `adminPort` indicates the administration port. E.g.:
```
{
    port: 1026,
    adminPort: 11211
}
```
* `config.resource.original`: The address and port of the proxied server. E.g.:
```
{
    host: 'localhost',
    port: 10026
},
```
* `config.access`: connection information to the selected Access Control PDP API. Includes a `disable` flag, to allow the proxy to work in authentication-only mode and a flag to activate accounting access in file. E.g.:
```
{
    disable: false,
    protocol: 'http',
    host: 'localhost',
    port: 7070,
    path: '/pdp/v3',
    account: false,
    accountFile: '/tmp/pepAccount.log'
}
```
Accounting log is only activated when account flag is true and debug log is INFO or DEBUG level (note that log level can be changed through API without restart)
Note that accunting log is not rotate, so you should make sure you configure your own rotation system.
Accounting access log include daba about:
* Attempt was right or not
* Token
* Origin
* UserId
* ServiceId
* SubServiceId
* Action
* Date
Example of access log:
```
Right Attempt | ResponseStatus=200 | Token=860864fb6d1a4c8a8cb7d59d16daaa52 | Origin=192.168.1.125 | UserId=62c63ada8694451fb67a341346172499 | ServiceId=a9b38dd2a97e4944b2daebdb74ed60ff | Service=smartgondor | SubServiceId=/ | SubService=/ | Action=read | Date=2017-09-21T12:46:57.844Z
```
* `config.componentName`: name of the component that will be used to compose the FRN that will identify the resource to be accessed. E.g.: `orion`.
* `config.resourceNamePrefix`: string prefix that will be used to compose the FRN that will identify the resource to be accessed. E.g.: `fiware:`.
* `config.bypass`: used to activate the administration bypass in the proxy. Valid values are `true` or `false`.
* `config.bypassRoleId`: ID of the role that will be considered to have administrative rights over the proxy (so being transparently proxied without validation). Valid values are Role UUIDs. E.g.: `db50362d5f264c8292bebdb5c5783741`.
* `config.dieOnRedirectError`: this flags changes the behavior of the PEP Proxy when an error is received when redirecting a request. If the flag is true, the PEP Proxy process is shut down immediately; if it is false, the behavior is the usual: generate a 501 Code error.

### Authentication configuration
* `config.authentication.checkHeaders`: when the proxy is working with the access control disabled (just user authentication), indicates whether the `fiware-service` and `fiware-servicepath` headers should be checked for existance and validity (checking: the headers exist, thy are not empty and the user is really part of the service and subservice mentioned in the header). This option is ignored when authorization is enabled, and considered to be `true` (as the headers constitute a mandatory part of the authorization process). Default value is `true`.
* `config.authentication.module`: indicates what type of authentication server should be used: keystone or idm. The currently supported one (and default) is `keystone`.
* `config.authentication.username`: username of the PEP proxy in the IDM. 
* `config.authentication.password`: password of the PEP proxy in the IDM.
* `config.authentication.domainName`: (only meaningful for Keystone) name of the administration domain the PEP proxy user belongs to.
* `config.authentication.retries`: as the authentication is based in the use of tokens that can expire, the operations against Keystone are meant to retry with a fresh token. This configuration value indicates how many retries the PEP should perform in case the communication against Keystone fails. The value `0` means the default will be used (default value is 3). The value `-1` implies that it should be retried forever.
* `cacheTTLs`: the values in this object correspond to the Time To Live of the values of the different caches the PEP uses to cache requests for information in Keystone. The value is expressed in seconds.
* `config.authentication.options`: address, port and other communication data needed to communicate with the Identity Manager. Apart from the host and port, default values should be used. 

### Plugin configuration
The `config.js` file contains configuration parameter that lets the deployer decide what plugin the proxy should use in order to extract the action type from the request attributes: the `middleware` parameter. This object has two attributes:
* `require`: indicating the route from the project folder to the module that contains the middleware.
* `functions`: an array of the middlewares to execute from the selected module.
All the currently available plugins are in the folder `lib/plugins/`, and most of them implement a single middleware called `extractAction` (the name for Orion plugin is `extractCBAction`).
The following example should work for any plugin following this patterns:
```
config.middlewares = {
    require: 'lib/plugins/perseoPlugin',

    functions: [
        'extractAction'
    ]
};
```
The environment variables provide ways of configuring the plugin without taking care of this details.

### Configuration based on environment variables
Some of the configuration values for the attributes above mentioned can be overriden with values in environment variables. The following table shows the environment variables and what attribute they map to.

| Environment variable | Configuration attribute             |
|:-------------------- |:----------------------------------- |
| PROXY_PORT           | config.resource.proxy.port          | 
| ADMIN_PORT           | config.resource.proxy.adminPort     | 
| TARGET_HOST          | config.resource.original.host       |
| TARGET_PORT          | config.resource.original.port       |
| LOG_LEVEL            | config.logLevel                     |
| ACCESS_HOST          | config.access.host                  |
| ACCESS_PORT          | config.access.port                  |
| ACCESS_PROTOCOL      | config.access.protocol              |
| ACCESS_ACCOUNT       | config.access.account               |
| ACCESS_ACCOUNTFILE   | config.access.accountFile           |
| AUTHENTICATION_HOST  | config.authentication.options.host  |
| AUTHENTICATION_PORT  | config.authentication.options.port  |
| AUTHENTICATION_PROTOCOL  | config.authentication.options.protocol  |
| PROXY_USERNAME       | config.authentication.user          |
| PROXY_PASSWORD       | config.authentication.password      |
| PROXY_PASSWORD       | config.authentication.password      |
| COMPONENT_PLUGIN       | config.middlewares and config.componentName     |

### Component configuration
A special environment variable, called `COMPONENT_PLUGIN` can be set with one of this values: `orion`, `perseo`, `keypass` and `rest`. This variable can be used to select what component plugin to load in order to determine the action of the incoming requests. This variable also rewrites `config.componentName` configuration paramenter.

### SSL Configuration
If SSL Termination is not available, the PEP Proxy can be configured to listen HTTPS instead of plain HTTP. To activate the SSL:

* Create the appropiate public keys and certificates and store them in the PEP Proxy machine.
* In the `config.js` file, change the `config.ssl.active` flag to true.
* In the same ssl object in the configuration, fill the path to the key and cert files.

### Multi-instance configuration
PEP Proxy is able to start multiple instances by adding and configuring certain files in `/etc/pepProxy.d` and using `pepProxy` service script

In order to start multiple instances of the proxy, just add one configuration file per instance in the `/etc/pepProxy.d` folder. RPM comes with one preconfigured instance (config file called pepproxy_default.conf) that can be used as a template to configure another instances.

In its starting sequence, the `pepProxy` service looks for files in  `/etc/pepProxy.d` that begins with `pepproxy_` prefix and has `.conf` extension and start (or stop or status or restat) one process for file found.

It is important to change `PROXY_PORT` and `ADMIN_PORT` to one not used by other PEP intances/services. 

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
| N/A | - |

### Standard operations
* `create`: URL contains `/v1/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is `APPEND`.
* `update`: URL contains `/v1/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is `UPDATE`.
* `delete`: URL contains `/v1/updateContext` and the `actionType` attribute of the payload (either with XML or JSON) is “DELETE”.
* `read`: URL contains `/v1/queryContext` or `/v1/contextTypes`.
* `subscribe`: URL contains  `/v1/subscribeContext`, `/v1/updateContextSubscription` o `/v1/unsubscribeContext`.
* `register`: URL contains `/v1/registry/registerContext`.
* `discover`: URL contains `/v1/registry/discoverContextAvailability`.
* `subscribe-availability`: URL contains `/v1/registry/subscribeContextAvailability`, `/v1/registry/updateContextAvailabilitySubscription` o `/v1/registry/unsubscribeContextAvailability`.

### Convenience operations
The following tables show the rules for detemining the action based on Method and path of the request. 

An up-to-date list of the convenience operations can be found [here](https://docs.google.com/spreadsheet/ccc?key=0Aj_S9VF3rt5DdEhqZHlBaGVURmhZRDY3aDRBdlpHS3c#gid=0).

#### NGSI9 (context information availability)
| Method | Path                                                                                     | Action |
| ------ |:--------------------------------------------------------------------------------------- | ---:|
| GET    | /v1/registry/contextEntities/{EntityId}                                                      	| Dis |
| POST   | /v1/registry/contextEntities/{EntityId}                                                      	| Reg |
| GET    | /v1/registry/contextEntities/{EntityId}/attributes                                           	| -   |
| POST   | /v1/registry/contextEntities/{EntityId}/attributes                                           	| -   |
| GET    | /v1/registry/contextEntities/{EntityId}/attributes/{attributeName}                           	| Dis |
| POST   | /v1/registry/contextEntities/{EntityId}/attributes/{attributeName}                          	| Reg |
| GET    | /v1/registry/contextEntities/{EntityId}/attributeDomains/{attributeDomainName}               	| Dis |
| POST   | /v1/registry/contextEntities/{EntityId}/attributeDomains/{attributeDomainName}               	| Reg |
| GET    | /v1/registry/contextEntityTypes/{typeName}                                                   	| Dis |
| POST   | /v1/registry/contextEntityTypes/{typeName}                                                   	| Reg |
| GET    | /v1/registry/contextEntityTypes/{typeName}/attributes                                        	| -   |
| POST   | /v1/registry/contextEntityTypes/{typeName}/attributes                                        	| -   |
| GET    | /v1/registry/contextEntityTypes/{typeName}/attributes/{attributeName}                        	| Dis |
| POST   | /v1/registry/contextEntityTypes/{typeName}/attributes/{attributeName}                        	| Reg |
| GET    | /v1/registry/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}            	| Dis |
| POST   | /v1/registry/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}            	| Reg |
| POST   | /v1/registry/contextAvailabilitySubscriptions                                                	| S-A |
| PUT    | /v1/registry/contextAvailabilitySubscriptions/{subscriptionId}                               	| S-A |
| DELETE | /v1/registry/contextAvailabilitySubscriptions/{subscriptionId}                               	| S-A |

#### NGS10 (context information availability)
| Method | Path                                                                                     | Action |
| ------ |:--------------------------------------------------------------------------------------- | ---:|
| GET    | /v1/contextEntities                                                                  | R |
| POST   | /v1/contextEntities                                                                  | C |
| GET    | /v1/contextEntities/{EntityID}                                                     	| R |
| PUT    | /v1/contextEntities/{EntityID}                                                     	| U |
| POST   | /v1/contextEntities/{EntityID}                                                     	| C |
| DELETE | /v1/contextEntities/{EntityID}                                                     	| D |
| GET    | /v1/contextEntities/{EntityID}/attributes                                          	| - |
| PUT    | /v1/contextEntities/{EntityID}/attributes                                          	| - |
| POST   | /v1/contextEntities/{EntityID}/attributes                                          	| - |
| DELETE | /v1/contextEntities/{EntityID}/attributes                                          	| - |
| GET    | /v1/contextEntities/{EntityID}/attributes/{attributeName}                          	| R |
| POST   | /v1/contextEntities/{EntityID}/attributes/{attributeName}                          	| C |
| PUT    | /v1/contextEntities/{EntityID}/attributes/{attributeName}                          	| U |
| DELETE | /v1/contextEntities/{EntityID}/attributes/{attributeName}                          	| D |
| GET    | /v1/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| R |
| PUT    | /v1/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| U |
| DELETE | /v1/contextEntities/{EntityID}/attributes/{attributeName}/{valueID}                	| D |
| GET    | /v1/contextEntities/{EntityID}/attributeDomains/{attributeDomainName}              	| R |
| GET    | /v1/contextEntityTypes/{typeName}                                                  	| R |
| GET    | /v1/contextEntityTypes/{typeName}/attributes                                       	| - |
| GET    | /v1/contextEntityTypes/{typeName}/attributes/{attributeName}                       	| R |
| GET    | /v1/contextEntityTypes/{typeName}/attributeDomains/{attributeDomainName}           	| R |
| POST   | /v1/contextSubscriptions                                                           	| S |
| GET    | /v1/contextSubscriptions                                                             | R |
| GET    | /v1/contextSubscriptions/{subscriptionID}                                            | R |
| PUT    | /v1/contextSubscriptions/{subscriptionID}                                          	| S |
| DELETE | /v1/contextSubscriptions/{subscriptionID}                                          	| S |
| GET    | /v1/contextTypes                                                                     | R |
| GET    | /v1/contextTypes{typename}                                                           | R |

#### NGSIv2 
| Method | Path                                                                                    | Action |
| ------ |:--------------------------------------------------------------------------------------- | ---:|
| GET    | /v2                                                                                     | R |
| GET    | /v2/entities                                                                            | R |
| GET    | /v2/entities/{entityId}                                                                | R |
| GET    | /v2/entities/{entityId}/attrs                                                          | R |
| POST   | /v2/entities                                                                           | C |
| PATCH  | /v2/entities/{entityId}/attrs                                                          | U |
| POST   | /v2/entities/{entityId}/attrs                                                          | U |
| POST   | /v2/entities/{entityId}/attrs?options=append                                           | C |
| DELETE | /v2/entities/{entityId}                                                                | D |
| PUT    | /v2/entities/{entityId}/attrs                                                          | U |
| GET    | /v2/entities/{entityId}/attrs/{attrId}                                                 | R |
| PUT    | /v2/entities/{entityId}/attrs/{attrId}                                                 | U |
| DELETE | /v2/entities/{entityId}/attrs/{attrId}                                                 | D |
| GET    | /v2/entities/{entityId}/attrs/{attrId}/value                                           | R |
| PUT    | /v2/entities/{entityId}/attrs/{attrId}/value                                           | U |
| GET    | /v2/types                                                                              | R |
| GET    | /v2/types/{typeId}                                                                     | R |
| GET    | /v2/subscriptions                                                                      | R |
| POST   | /v2/subscriptions                                                                      | C |
| GET    | /v2/subscriptions/{subscriptionId}                                                     | R |
| PATCH  | /v2/subscriptions/{subscriptionId}                                                     | U |
| DELETE | /v2/subscriptions/{subscriptionId}                                                     | D |
| POST   | /v2/op/query                                                                           | R |
| POST   | /v2/op/update                                                                          | (*) |

(*) It depends on the `actionType` (within payload):

* UPDATE: U
* APPEND: C
* APPEND_STRICT: C
* DELETE: D

Operations marked with a slash, "-" are now deprecated. All those operations will be tagged with the special action "N/A". If you want to allow them anyway, just add a rule to the Access Control allowing the "N/A" action for the desired roles.

## <a name="rulesPerseo"/> Rules to determine the Perseo CEP action from the request

The available actions are:
* **readRule**: to get working rules in CEP
* **writeRule**: to modify rules in CEP (create, delete, update)
* **notify**: to fire rules (if appropiate) with an event notification

The following tables show the map from method and path of the request to the action. 

### Notifications
| Method | Path |  Action |
| ------ |:-----|:------------|
| POST   | /notices | notify|

### Rules
| Method | Path        | Action| 
| ------ |:-------------|:-----------|
| GET    | /rules      | readRule  |
| GET    | /rules/{id} | readRule  |
| POST   | /rules      | writeRule |
| DELETE | /rules/{id} | writeRule |

### Visual Rules
| Method | Path    |  Action |
| ------ |:--------|:------------|
| GET    | /m2m/vrules        	| readRule |
| GET    | /m2m/vrules/{id}       | readRule |
| POST   | /m2m/vrules        	| writeRule |
| DELETE | /m2m/vrules/{id}    	| writeRule |
| PUT    | /m2m/vrules/{id}       | writeRule |

## <a name="rulesKeypass"/> Rules to determine the Keypass Access Control action from the request
The available actions are:
* **createPolicy**: to create a new policy for a subject in Keypass.
* **listPolicies**: to list all the policies belonging to a subject.
* **deleteSubjectPolicies**: to remove all the policies for a particular subject.
* **deleteTenantPolicies**: to remove all the policies for all the subjects of a tenant.
* **readPolicy**: to get the policy body for a particular policy.
* **deletePolicy**: to remove a single policy of a subject.

The following table show the map from method and path of the request to the action.

| Method | Path        | Action|
| ------ |:-------------|:-----------|
| POST    | /pap/v1/subject/{subjectId}      | createPolicy  |
| GET    | /pap/v1/subject/{subjectId}       | listPolicies  |
| DELETE    | /pap/v1/subject/{subjectId}       | deleteSubjectPolicies  |
| DELETE    | /pap/v1      | deleteTenantPolicies  |
| GET    | /pap/v1/subject/{subjectId}/policy/{policyId}      | readPolicy  |
| DELETE    | /pap/v1/subject/{subjectId}/policy/{policyId}      | deletePolicy  |

## <a name="customizing"/> Customizing PEP Proxy for other components
Most of the code of the proxy (i.e. the extraction of user data, the communication with the Keystone Proxy and the proxy process itself) will execute exactly the same for all the components. The exception is the rule to determine the action the request is trying to perform. To address this behavior and possible actions different customizations of the proxy could need, the proxy allows for the introduction of middlewares in the validation process.

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

* `require`: path to the module that contains the middlewares, from the project root. The system currently supports only modules defined inside the fiware-pep-steelskin project (or in accessible folders).
* `functions`: list of the middlewares to load. The names in this list must be exported functions of the module selected in the previous attribute.

### Generic REST Middleware
For standard REST APIs that make use exclusively of the POST, PUT, DELETE and GET methods with their CRUD meaning, the PEP Proxy provides a generic plugin that maps those methods to actions in the access request. To configure it, put the following lines in the middleware section of the PEP Proxy installation:

```
config.middlewares = {
   require: 'lib/services/restPlugin',
   
   functions: [
     'extractAction'
   ]
};
```
In order to add more expression power to the authorization rules created in the Access Control component, the Generic REST Plugin adds a new element to the FRN: the URL of the resource is appended to the existing elements in the FRN.

### URL Table Generic middleware
For applications that require a mapping between URLs and Method to actions when the REST Middleware is not enough, a plugin generator based on tables is provided. In order to use this plugin, create a new plugin file and import the `./urlTablePlugin` module. This module contains just one function, `extractAction`, that takes a mapping table and generates a middleware function that extract the action of a request based on it. 

The mapping table has to have one row for each action to check indicating:
* Request **Method**
* **URL** pattern (using regular expressions)
* **Action** name
Whenever a request arrives to the plugin with the selected method and a URL that matches the URL expression, the action will be assigned to the request.

An example of use of the `urlTablePlugin` can be found in the Perseo plugin.

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
[Mocha](http://mochajs.org/) Test Runner + [Chai](http://chaijs.com/) Assertion Library + [Sinon](http://sinonjs.org/) Spies, stubs.

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

### Releasing
The project contains a script to aid in the releasing process. This script is located in the `scripts/build` folder. In
order to create a new release, just invoke the script, from the project root folder, with the following line:
```
scripts/build/release.sh <NEW_VERSION> <RELEASE_TYPE>
```
Usually, `RELEASE_TYPE` will be `sprint`. This release procedure will do the following steps:
* Change the version in package.json to the selected version.
* Create a branch `release/0.6.0` and a tag `0.6.0` from `master`.
* Add the `-next` suffix to the version in master and clean the `CHANGES_NEXT_RELEASE` file.

For other release types, check the command help.

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

