# Keystone Installation

## Overview
This document's target is to provide a guide to install and configure a Keystone instance that can be used as the
IDM for this PEP Proxy. 

Some conventions are followed in the use of Keystone as the PEP Proxy:
* Keystone Domains are used as tenants. The Domain *name* is the piece of data that will be used in the `fiware-service`
header to specify the request's tenant.
* Keystone Projects are used as subservices for a tenant. Their *names* are the pieces of data that should be used
as the content of the `fiware-servicepath` header.

Along with the installation, some resource creation examples will be given (the SmartCity service). 

You should be aware that it does NOT represent a production-ready installation. The purpose of this instructions is just
to provide a quick way to start using the PEP Proxy with a compatible environment, in order to understand how it works
and what it offers. Take care of changing all the passwords used along this document to safer versions.

## Installation

This installation document is based on a CentOS 7 distribution. 

This guide is based in [this guide](https://openstack.redhat.com/Quickstart) and
[this one](http://docs.openstack.org/icehouse/install-guide/install/yum/content/keystone-install.html).

### Basic installation

```sh
sudo yum update -y

sudo yum install -y epel-release
sudo yum update -y epel-release
sudo yum install -y https://repos.fedorapeople.org/openstack/EOL/openstack-liberty/rdo-release-liberty-5.noarch.rpm
sudo yum install -y openstack-utils openstack-keystone python-keystoneclient mysql-server
sudo service mysqld start
sudo chkconfig mysqld on
```

### Initial configuration

```sh
sudo openstack-config --set /etc/keystone/keystone.conf \
   database connection mysql://keystone:keystone@localhost/keystone

sudo openstack-config --set /etc/keystone/keystone.conf \
   DEFAULT admin_token ADMIN
```

### MySQL Configuration

```sql
CREATE DATABASE keystone;
GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'localhost' \
  IDENTIFIED BY 'keystone';
GRANT ALL PRIVILEGES ON keystone.* TO 'keystone'@'%' \
  IDENTIFIED BY 'keystone';
```

### Initialize Keystone DB

```sh
sudo su -s /bin/sh -c "keystone-manage db_sync" keystone
```

### Config PKI tokens

```sh
sudo keystone-manage pki_setup --keystone-user keystone --keystone-group keystone
sudo chown -R keystone:keystone /etc/keystone/ssl
sudo chmod -R o-rwx /etc/keystone/ssl
```

### Start Keystone:

```sh
sudo service openstack-keystone start
sudo chkconfig openstack-keystone on
```

### Check Keystone is up

```sh
sudo netstat -nltp | grep -E "5000|35357"

tcp        0      0 0.0.0.0:35357               0.0.0.0:*                   LISTEN      11430/python
tcp        0      0 0.0.0.0:5000                0.0.0.0:*                   LISTEN      11430/python
```

### Install SCIM extensions

In order to support some role functionalities, we use some extensions that add SCIM support to Keystone. Those extensions
need to be installed for this tutorial to be completed. You can find instructions on how to do it [here](https://github.com/telefonicaid/fiware-keystone-scim).

## Basic contents

In this section we will provide instructions on how to use the Keystone API to create the minimum Keystone resources
needed in order to be able to use the PEP Proxy.
 
The following table shows the users that will be created:
 
 User                    | Keystone       | Password  
 ----------------------- | -------------- | ------------  
 Keystone Admin          | `admin`        | `admin`  
 Global Admin            | `cloud_admin`  | `cloud_admin`  
 Service Admin           | `admin_domain` | `admin_domain` 
 
 
### Create Keystone Admin
 
Based on [this](http://docs.openstack.org/icehouse/install-guide/install/yum/content/keystone-users.html).
 
```sh
 export OS_SERVICE_TOKEN=ADMIN
 export OS_SERVICE_ENDPOINT=http://localhost:35357/v2.0
 
 export KEYSTONE_HOST=localhost:5000
 
 keystone user-create --name=admin --pass=admin --email=admin@no.com
 keystone role-create --name=admin
 keystone tenant-create --name=admin --description="Admin Tenant"
 keystone user-role-add --user=admin --tenant=admin --role=admin
 keystone user-role-add --user=admin --tenant=admin --role=_member_ 
```
 
Create role `service` (to be used afterwards)
 
```sh
 keystone role-create --name=service
```
 
### Support multitenancy in Keystone
Create all the needed resources in Keystone to support multitenancy (domains in OpenStack terminology).
Domain configuration is based in [this](http://www.florentflament.com/blog/setting-keystone-v3-domains.html).
 
NOTE: all this examples use `jq`, that can be installed with:
```sh
sudo yum install -y jq
```

Create domain `admin_domain.`:
 
```sh
 ADMIN_TOKEN=$(\
 curl http://${KEYSTONE_HOST}/v3/auth/tokens \
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
                         "name": "Default"
                     },
                     "name": "admin",
                     "password": "admin"
                 }
             }
         },
         "scope": {
             "project": {
                 "domain": {
                     "name": "Default"
                 },
                 "name": "admin"
             }
         }
     }
 }' | grep ^X-Subject-Token: | awk '{print $2}' )
 
 ID_ADMIN_DOMAIN=$(\
 curl http://${KEYSTONE_HOST}/v3/domains \
     -s \
     -H "X-Auth-Token: $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '
 {
     "domain": {
     "enabled": true,
     "name": "admin_domain"
     }
 }' | jq .domain.id | tr -d '"' )
 
 echo "ID of domain cloud: $ID_ADMIN_DOMAIN"
```
 
### Create Global Admin

This will be the user that will create the Services (Domains or tenants). It will be used once for each tenant.
We create a `cloud_admin` user in the domain `admin_domain`.

```sh
ID_CLOUD_ADMIN=$(\
curl http://${KEYSTONE_HOST}/v3/users \
    -s \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "user": {
        "description": "Cloud administrator",
        "domain_id": "'$ID_ADMIN_DOMAIN'",
        "enabled": true,
        "name": "cloud_admin",
        "password": "password"
    }
}' | jq .user.id | tr -d '"' )

echo "ID of user cloud_admin: $ID_CLOUD_ADMIN"
```

Give the user `cloud_admin` the `admin` role in the `admin_domain` domain.

```sh
ADMIN_ROLE_ID=$(\
curl http://${KEYSTONE_HOST}/v3/roles?name=admin \
    -s \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
| jq .roles[0].id | tr -d '"' )

curl -X PUT http://${KEYSTONE_HOST}/v3/domains/${ID_ADMIN_DOMAIN}/users/${ID_CLOUD_ADMIN}/roles/${ADMIN_ROLE_ID} \
    -s \
    -i \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
    -H "Content-Type: application/json"

curl http://${KEYSTONE_HOST}/v3/domains/${ID_ADMIN_DOMAIN}/users/${ID_CLOUD_ADMIN}/roles\
    -s \
    -H "X-Auth-Token: $ADMIN_TOKEN" | jq .roles
```

### Create the PEP user

Similarly, we create the PEP user and assign it the role `service` in `admin_domain`:

```sh
ID_CLOUD_PEP=$(\
curl http://${KEYSTONE_HOST}/v3/users \
    -s \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "user": {
        "description": "PEP user",
        "domain_id": "'$ID_ADMIN_DOMAIN'",
        "enabled": true,
        "name": "pep",
        "password": "pep"
    }
}' | jq .user.id | tr -d '"' )

echo "ID of user cloud_admin: $ID_CLOUD_PEP"

SERVICE_ROLE_ID=$(\
curl "http://${KEYSTONE_HOST}/v3/roles?name=service" \
    -s \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
| jq .roles[0].id | tr -d '"' )

curl -X PUT http://${KEYSTONE_HOST}/v3/domains/${ID_ADMIN_DOMAIN}/users/${ID_CLOUD_PEP}/roles/${SERVICE_ROLE_ID} \
    -s \
    -i \
    -H "X-Auth-Token: $ADMIN_TOKEN" \
    -H "Content-Type: application/json"
```

### Configure policies

Modify Keystone's policy to support domains. In order to do so, we overwrite `/etc/keystone/policy.json` with the contents
of [policy.v3cloudsample.json](https://github.com/openstack/keystone/raw/master/etc/policy.v3cloudsample.json), replacing
the domain ID of domain `admin_domain`. 

```sh
curl -L https://github.com/openstack/keystone/raw/master/etc/policy.v3cloudsample.json \
| jq '.cloud_admin="rule:admin_required and domain_id:'${ID_ADMIN_DOMAIN}'"
   | .cloud_service="rule:service_role and domain_id:'${ID_ADMIN_DOMAIN}'"
   | .["identity:get_domain"]=""
   | .admin_and_user_filter="role:admin and \"%\":%(user.id)%"
   | .admin_and_project_filter="role:admin and \"%\":%(scope.project.id)%"
   | .["identity:list_role_assignments"]="rule:admin_on_domain_filter or rule:cloud_service or rule:admin_and_user_filter or rule:admin_and_project_filter"
   |.["identity:list_projects"]="rule:cloud_admin or rule:admin_and_matching_domain_id or rule:cloud_service"' \
| sudo tee /etc/keystone/policy.json
```

Some modifications are needed also for the SCIM extensions to work. Check [this section](https://github.com/telefonicaid/fiware-keystone-scim#permissions-fine-tuning)
of the SCIM Extensions Github repository for instructions.

And restart keystone:

```sh
sudo service openstack-keystone restart
```

### Create service

Logged as the user `cloud_admin`, we create a service (domain), a user in the new service, and we assign him the `admin` 
role for that service.

First, log in as `cloud_admin`.

```sh
CLOUD_ADMIN_TOKEN=$(\
curl http://${KEYSTONE_HOST}/v3/auth/tokens \
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
                        "name": "admin_domain"
                    },
                    "name": "cloud_admin",
                    "password": "password"
                }
            }
        },
        "scope": {
            "domain": {
                "name": "admin_domain"
            }
        }
    }
}' | grep ^X-Subject-Token: | awk '{print $2}' )
```

Create the new service(domain):

```sh
ID_DOM1=$(\
curl http://${KEYSTONE_HOST}/v3/domains \
    -s \
    -H "X-Auth-Token: $CLOUD_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "domain": {
        "enabled": true,
        "name": "SmartCity"
    }
}' | jq .domain.id | tr -d '"')

echo "ID of SmartCity: $ID_DOM1"
```

Create administrator user in the SmartCity:


```sh
ID_ADM1=$(\
curl http://${KEYSTONE_HOST}/v3/users \
    -s \
    -H "X-Auth-Token: $CLOUD_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "user": {
        "description": "Administrator of domain dom1",
        "domain_id": "'$ID_DOM1'",
        "enabled": true,
        "name": "adm1",
        "password": "password"
    }
}' | jq .user.id | tr -d '"')

echo "ID of user adm1: $ID_ADM1"
```

Assign the administrator role over the SmartCity service to the user:

```sh
curl -X PUT http://${KEYSTONE_HOST}/v3/domains/${ID_DOM1}/users/${ID_ADM1}/roles/${ADMIN_ROLE_ID} \
    -s \
    -i \
    -H "X-Auth-Token: $CLOUD_ADMIN_TOKEN" \
    -H "Content-Type: application/json"

curl http://${KEYSTONE_HOST}/v3/domains/${ID_DOM1}/users/${ID_ADM1}/roles \
    -s \
    -H "X-Auth-Token: $CLOUD_ADMIN_TOKEN" | jq .roles
```

### Create subservices

The Service Admin manages subservices, roles and users, and assigns users to roles in the subservice.

First of all, log in as Service Admin:

```sh
SMARTCITY_ADMIN_TOKEN=$(\
curl http://${KEYSTONE_HOST}/v3/auth/tokens \
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
                    "name": "adm1",
                    "password": "password"
                }
            }
        },
        "scope": {
            "domain": {
                "name": "SmartCity"
            }
        }
    }
}' | grep ^X-Subject-Token: | awk '{print $2}' )
```

#### Create role SubServiceAdmin

```sh
ID_SMARTCITY_ROLE_SUBSERVICEADMIN=$(\
curl http://${KEYSTONE_HOST}/v3/OS-SCIM/Roles \
    -s \
    -H "X-Auth-Token: $SMARTCITY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
  "schemas": ["urn:scim:schemas:extension:keystone:1.0"],
  "name": "SubServiceAdmin",
  "domain_id": "'$ID_DOM1'"
}' | jq .id | tr -d '"')

ID_SMARTCITY_ROLE_SUBSERVICECUSTOMER=$(\
curl http://${KEYSTONE_HOST}/v3/OS-SCIM/Roles \
    -s \
    -H "X-Auth-Token: $SMARTCITY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
  "schemas": ["urn:scim:schemas:extension:keystone:1.0"],
  "name": "SubServiceCustomer",
  "domain_id": "'$ID_DOM1'"
}' | jq .id | tr -d '"')
```

#### Create Subservice

We create a Keystone project in the domain as the admin user of the domain. I.e.: we create a subservice (Electricity)
in the SmartCity service with SmartCity's Service Admin credentials.


```sh
ID_SMARTCITY_ELECTRICITY=$(\
curl http://${KEYSTONE_HOST}/v3/projects \
    -s \
    -H "X-Auth-Token: $SMARTCITY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "project": {
        "description": "SmartCity Subservicio Electricity",
        "domain_id": "'$ID_DOM1'",
        "enabled": true,
        "name": "/Electricity"
    }
}' | jq .project.id | tr -d '"')

echo "ID of Electricity subservice: $ID_SMARTCITY_ELECTRICITY"
```

#### Create user Alice in SmartCity

```sh
ID_SMARTCITY_ALICE=$(\
curl http://${KEYSTONE_HOST}/v3/users \
    -s \
    -H "X-Auth-Token: $SMARTCITY_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '
{
    "user": {
        "description": "Alice",
        "domain_id": "'$ID_DOM1'",
        "enabled": true,
        "name": "alice",
        "password": "password"
    }
}' | jq .user.id | tr -d '"' )

echo "ID of user alice in SmartCity: $ID_SMARTCITY_ALICE"
```

#### Assign role SubServiceAdmin to the user in SmartCity

```sh
curl -X PUT http://${KEYSTONE_HOST}/v3/projects/${ID_SMARTCITY_ELECTRICITY}/users/${ID_SMARTCITY_ALICE}/roles/${ID_SMARTCITY_ROLE_SUBSERVICEADMIN} \
    -s \
    -i \
    -H "X-Auth-Token: $SMARTCITY_ADMIN_TOKEN" \
    -H "Content-Type: application/json"
```
