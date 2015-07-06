FROM centos:6

RUN yum update -y && yum install -y wget
RUN wget http://ftp.rediris.es/mirror/fedora-epel/6/i386/epel-release-6-8.noarch.rpm && yum localinstall -y --nogpgcheck epel-release-6-8.noarch.rpm
RUN yum install -y npm git

WORKDIR /opt
RUN git clone https://github.com/telefonicaid/fiware-pep-steelskin.git && cd fiware-pep-steelskin && npm install

EXPOSE 1026
WORKDIR /opt/fiware-pep-steelskin
ENTRYPOINT bin/pepProxy
