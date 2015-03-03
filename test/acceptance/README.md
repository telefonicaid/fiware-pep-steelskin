# PEP Acceptance Tests

Folder for acceptance tests of PEP.

## How to Run the Acceptance Tests

### Prerequisites:

- Python 2.7
- pip installed (http://docs.python-guide.org/en/latest/starting/install/linux/)
- virtualenv installed (pip install virtualenv) (optional).
- On host where pep is executed, linux package "dtach" has to be installed.
- On linux, is needed to have "python-dev" installed.
- On Windows, is needed to have "Microsoft Visual C++ Compiler for Python 2.7" (http://www.microsoft.com/en-us/download/details.aspx?id=44266)
Note: We recommend the use of virtualenv, because is an isolated working copy of Python which allows you to work on a specific project without worry of affecting other projects.

##### Environment preparation:

- If you are going to use a virtual environment (optional):
  * Create a virtual environment somewhere, e.g. in ~/venv (virtualenv ~/venv) (optional)
  * Activate the virtual environment (source ~/venv/bin/activate) (optional)
- Both if you are using a virtual environment or not:
  * Change to the test/acceptance folder of the project.
  * Set the environment variable (Windows and Linux) GIT_SSL_NO_VERIFY=true
  * Install the requirements for the acceptance tests in the virtual environment
     ```
     pip install -r requirements.txt --allow-all-external
     ```

### Tests execution:

- Change to the test/acceptance folder of the project if not already on it.
- Fill properties.py with the environment configuration (see in the properties section).
- Run lettuce (see available params with the -h option).

```
Some examples:
   lettuce .                                   -- run all features
   lettuce --tag=ac_actions_domain             -- run ac_actions_domain feature
```

### Tests Coverage (features):

- AC actions when the role is defined only in a project
- AC actions when the role is defined only in the domain
- AC middleware
- CEP actions when the role is defined only in a project
- CEP actions when the role is defined only in the domain
- CEP middleware
- Check the errors connecting with KS
- Context broker actions when the role is defined only in a domain
- Context broker actions when the role is defined only in a project
- Context broker middleware
- Errors raised by PEP because of errors from/to Keystone
- Errors raised by PEP because of errors from/to Keystone
- PeP cache in user, project and roles
- Test bypass functionality
- Test request headers
- Test the pep version consult in the administration port
- Urls that not exist in Access Control plugin
- Urls that not exist in ContextBroker plugin
- Urls that not exist in Perseo plugin

### properties.py

Config the environment to execute the test.
Its needed:

- PeP in a remote/docker environment (local tests are in progress)
- Real Access Control
- Real Keystone, its important to fill the world.ks['platform'], because to prepare
the keystone environment all parameters are used
- Its important to know, all users have the username as password, because the library
used to deploy the environment, needs it.

### tags

There is a tag for each feature file

```
ac_actions_domain
ac_actions_project
ac_mdw
access_control_connection_error
access_control_errors
access_control_validation_error
access_denied
action_not_found
bypass_keypass
cache
cb_actions_domain
cb_actions_project_rol
cb_mdwae
cep_actions_domain
cep_actions_project
cep_mdw
connection_errors
headers
issue-174
issue-182
keystone_authentication_error
keystone_authentication_rejected
keystone_errors
keystone_subservice_not_found
missing_headers
pep_proxy_authentication_rejected
roles_not_found
target_server_error
token_does_not_match_service
unexpected_content_type
urls_ac_ko
urls_cb_ko
urls_cep_ko
version
wrong_json_payload
wrong_xml_payload
```
