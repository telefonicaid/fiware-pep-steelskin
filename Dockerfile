# Copyright 2015 Telefónica Investigación y Desarrollo, S.A.U
#
# This file is part of the Orion Policy Enforcement Point (PEP) component
#
# PEP is free software: you can redistribute it and/or
# modify it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the License,
# or (at your option) any later version.
#
# PEP is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
# See the GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public
# License along with PEP.
# If not, see http://www.gnu.org/licenses/.
#
# For those usages not covered by the GNU Affero General Public License
# please contact with: [daniel.moranjimenez@telefonica.com]

FROM centos:6

MAINTAINER Daniel Moran Jimenez <daniel.moranjimenez@telefonica.com>

COPY . /opt/fiware-pep-steelskin/

WORKDIR /opt/fiware-pep-steelskin

RUN yum update -y && \
  yum install -y epel-release && yum update -y epel-release && \
  yum install -y npm && \
  npm install --production && \
  # Cleanup to thin the final image
  rpm -qa redhat-logos groff | xargs -r rpm -e --nodeps && yum -y erase libss && \
  yum clean all && rpm --initdb && rpm -vv --rebuilddb && rm -rf /var/lib/yum/yumdb && rm -rf /var/lib/yum/history && \
  find /usr/share/locale -mindepth 1 -maxdepth 1 ! -name 'en_US' ! -name 'locale.alias' | xargs -r rm -r && rm -f /var/log/*log && \
  bash -c 'localedef --list-archive | grep -v -e "en_US" | xargs localedef --delete-from-archive' && \
  /bin/cp -f /usr/lib/locale/locale-archive /usr/lib/locale/locale-archive.tmpl && \
  build-locale-archive && find /opt/fiware-pep-steelskin -name '.[^.]*' 2>/dev/null | xargs -r rm -rf && \
  npm cache clean

ENV LOG_LEVEL=INFO

EXPOSE 1026 11211

ENTRYPOINT bin/pepProxy

