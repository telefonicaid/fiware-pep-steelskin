FROM centos:6

RUN yum update -y && yum install -y wget \
  && wget http://ftp.rediris.es/mirror/fedora-epel/6/i386/epel-release-6-8.noarch.rpm && yum localinstall -y --nogpgcheck epel-release-6-8.noarch.rpm \
  && yum install -y npm git

COPY . /opt/fiware-pep-steelskin
WORKDIR /opt/fiware-pep-steelskin
RUN npm install

ENV LOG_LEVEL=INFO

EXPOSE 1026
EXPOSE 11211
ENTRYPOINT bin/pepProxy
