#!/bin/bash

PROXY_VERSION=0.1
PROXY_RELEASE=1
FIWARE_VERSION=1.0
FIWARE_RELEASE=1
RPM_TOPDIR=$PWD
PROXY_USER=pepproxy

rpmbuild -ba $RPM_TOPDIR/SPECS/pepProxy.spec \
    --define "_topdir $RPM_TOPDIR" \
    --define "_project_user $PROXY_USER" \
    --define "_product_version $PROXY_VERSION" \
    --define "_product_release $PROXY_RELEASE" \
    --define "fiware_version $FIWARE_VERSION" \
    --define "fiware_release $FIWARE_RELEASE"