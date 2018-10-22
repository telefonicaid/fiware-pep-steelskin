Summary: Orion Policy Enforcement Point
Name: fiware-pep-steelskin
Version: %{_product_version}
Release: %{_product_release}
License: AGPLv3
BuildRoot: %{_topdir}/BUILDROOT/
BuildArch: noarch
# Requires: nodejs >= 0.10.24
Requires: logrotate
Requires(post): /sbin/chkconfig, /usr/sbin/useradd npm
Requires(preun): /sbin/chkconfig, /sbin/service
Requires(postun): /sbin/service
Group: Applications/Engineering
Vendor: Telefonica I+D
BuildRequires: npm

%description
The Orion Policy Enforcement Point is a proxy designed to filter requests to the
Orion Context Broker by validating its security role and user token against the
policies stored in the Access Control component of the Fiware Platform.

# System folders
%define _srcdir $RPM_BUILD_ROOT/../../..
%define _service_name pepProxy
%define _install_dir /opt/pepProxy
%define _pepProxy_log_dir /var/log/pepProxy
%define _pepProxy_pid_dir /var/run/pepProxy

# RPM Building folder
%define _build_root_project %{buildroot}%{_install_dir}
# -------------------------------------------------------------------------------------------- #
# prep section, setup macro:
# -------------------------------------------------------------------------------------------- #
%prep
echo "[INFO] Preparing installation"
# Create rpm/BUILDROOT folder
rm -Rf $RPM_BUILD_ROOT && mkdir -p $RPM_BUILD_ROOT
[ -d %{_build_root_project} ] || mkdir -p %{_build_root_project}

# Copy src files
cp -R %{_srcdir}/lib \
      %{_srcdir}/bin \
      %{_srcdir}/config.js \
      %{_srcdir}/package.json \
      %{_srcdir}/LICENSE \
      %{_build_root_project}

[ -f %{_srcdir}/npm-shrinkwrap.json ] && /bin/cp %{_srcdir}/npm-shrinkwrap.json %{_build_root_project}      

cp -R %{_topdir}/SOURCES/etc %{buildroot}

# -------------------------------------------------------------------------------------------- #
# Build section:
# -------------------------------------------------------------------------------------------- #
%build
echo "[INFO] Building RPM"
cd %{_build_root_project}

# Only production modules
rm -fR node_modules/
npm cache clear
npm install --production

# -------------------------------------------------------------------------------------------- #
# pre-install section:
# -------------------------------------------------------------------------------------------- #
%pre
echo "[INFO] Creating %{_project_user} user"
grep ^%{_project_user}: /etc/passwd
RET_VAL=$?
if [ "$RET_VAL" != "0" ]; then
      /usr/sbin/useradd -s "/bin/bash" -d %{_install_dir} %{_project_user}
      RET_VAL=$?
      if [ "$RET_VAL" != "0" ]; then
         echo "[ERROR] Unable create %{_project_user} user" \
         exit $RET_VAL
      fi
fi

# -------------------------------------------------------------------------------------------- #
# post-install section:
# -------------------------------------------------------------------------------------------- #
%post
echo "[INFO] Configuring application"

    echo "[INFO] Creating the home pepproxy directory"
    mkdir -p _install_dir
    echo "[INFO] Creating log & run directory"
    mkdir -p %{_pepProxy_log_dir}
    chown -R %{_project_user}:%{_project_user} %{_pepProxy_log_dir}
    chown -R %{_project_user}:%{_project_user} _install_dir
    chmod g+s %{_pepProxy_log_dir}
    setfacl -d -m g::rwx %{_pepProxy_log_dir}
    setfacl -d -m o::rx %{_pepProxy_log_dir}

    mkdir -p %{_pepProxy_pid_dir}
    chown -R %{_project_user}:%{_project_user} %{_pepProxy_pid_dir}
    chown -R %{_project_user}:%{_project_user} _install_dir
    chmod g+s %{_pepProxy_pid_dir}
    setfacl -d -m g::rwx %{_pepProxy_pid_dir}
    setfacl -d -m o::rx %{_pepProxy_pid_dir}

    echo "[INFO] Configuring application service"
    cd /etc/init.d
    chkconfig --add %{_service_name}

echo "Done"

# -------------------------------------------------------------------------------------------- #
# pre-uninstall section:
# -------------------------------------------------------------------------------------------- #
%preun

echo "[INFO] stoping service %{_service_name}"
service %{_service_name} stop &> /dev/null

if [ $1 == 0 ]; then

  echo "[INFO] Checking Context Broker installations"
  service --status-all |grep contextBroker
  CONTEXT_BROKER=$?

  if [ -e /etc/sysconfig/contextBroker ] && [ $CONTEXT_BROKER = 0 ]; then
    service contextBroker stop
    CURRENT_PORT=$(cat  /etc/sysconfig/pepProxy |grep "PROXY_PORT=" |awk -F '=' '{print $2}')
    sed -i "s/BROKER_PORT=.*/BROKER_PORT=$CURRENT_PORT/g" /etc/sysconfig/contextBroker
    service contextBroker start
  fi

  echo "[INFO] Removing application log files"
  # Log
  [ -d %{_pepProxy_log_dir} ] && rm -rfv %{_pepProxy_log_dir}

  echo "[INFO] Removing application run files"
  # Log
  [ -d %{_pepProxy_pid_dir} ] && rm -rfv %{_pepProxy_pid_dir}

  echo "[INFO] Removing application files"
  # Installed files
  [ -d %{_install_dir} ] && rm -rfv %{_install_dir}

  echo "[INFO] Removing application user"
  userdel -fr %{_project_user}

  echo "[INFO] Removing application service"
  chkconfig --del %{_service_name}
  rm -Rf /etc/init.d/%{_service_name}
  echo "Done"
fi

# -------------------------------------------------------------------------------------------- #
# post-uninstall section:
# clean section:
# -------------------------------------------------------------------------------------------- #
%postun
%clean
rm -rf $RPM_BUILD_ROOT

# -------------------------------------------------------------------------------------------- #
# Files to add to the RPM
# -------------------------------------------------------------------------------------------- #
%files
%defattr(755,%{_project_user},%{_project_user},755)
%config /etc/init.d/%{_service_name}
%config /etc/%{_service_name}.d
%config /etc/sysconfig/logrotate-pepproxy-size
%config /etc/logrotate.d/logrotate-pepproxy.conf
%config /etc/cron.d/cron-logrotate-pepproxy-size
%{_install_dir}

%changelog
* Mon Oct 22 2018 Fermin Galan <fermin.galanmarquez@telefonica.com> 1.4.0
- Add: init script in RPM is able to deal with multiple instances of PEP running on the same system (#390)
- Fix: init script in RPM fixes start stop errors in pep service (#390)
- Fix: check boolean config fields against right boolean value
- Fix: mustache dependence version to 2.2.1 due to detected medium vulnerability
- Fix: allow log level in uppercase for access logger and lowercase for tracerequest
- Using precise dependencies (~=) in packages.json

* Wed Oct 18 2017 Fermin Galan <fermin.galanmarquez@telefonica.com> 1.3.0
- FEATURE update node version to 4.8.4
- FEATURE access accounting in a file of each operation (including user, service/servicepath and action) [#350]
- FIX text/plain bodies are not forwarded (impacting on "PUT /v2/entities/E/attrs/A/value" operation for CB) [#345]
- FIX size of validation cache according with cacheTTLS.validation instead of cacheTTLS.users [#349]

* Tue Oct 4 2016 Daniel Moran <daniel.moranjimenez@telefonica.com> 1.2.0
- Update Context Broker plugin with v2 operations (#325).
- Add an administrative operation to get the log level (#323).
- Add the 'comp' field to the PEP log (#328)
- Create a cache for Keypass requests (#324).

* Thu Dec 17 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.7.2
- FIX Makes loading of xacml templates relative to source code (not working directory).
- FIX Race condition causes requests that will never be responsed (#269).
- FIX Nginx error when transfer-encoding: chunked is specified (#268).
- FIX Race condition causes "The token doesn't belong to the provided service" (#272).

* Thu Oct 29 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.7.1
- Bugfix: init.d service script start PEP Proxy correctly (#236)
- Make the PEP Proxy die when an error is received in a request resend (#225)
- Added environment variable to customize component name (#240)
- Remove query parameters from the FRN generated by the REST plugin (#244)
- Init script fixed due to a COMPONENT_NAME was used in PEP proxy configuration (#246)
- Add Dockerfile for the PEP.
- PEP Crashes when unable to authenticate (#256)
- ADD First NGSIv2 operations to the convenience list (#259)
- Distinguish POST actions in NGSIv2 using query parameters (#262)

* Thu May 21 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.7.0
- Add capacity to start several instances of PEP Proxy using init.d script (#211)
- Add log debug statements for role extraction
- Fix error obtaining subservice ID from its name (208).
- Add integration with Travis CI.

* Mon Apr 13 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.6.0
- FIX Service not found for tokens coming from a trust.
- FIX XAuth Token not checked if validation is off (#197)
- FIX Wrong JSON payload generates wrong type of error (#194)
- ADD Tests for the IOTAgent plugin (using the generic REST plugin).
- ADD Remove slow operations in debug logs (#48).
- ADD Tracing debug mode (#64).
- ADD Rest component plugin to the executable and environment variables.

* Fri Feb 27 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.5.0
- Added /v1/contextTypes to the URL Mappings of Orion.
- Fix right plugins directory in pepProxy binary.
- Fix accept content-type header with charset
- Fix proxy query params 
- Fix some urls are not recognized with query params (#148)
- Add "effective" flag to the request to Keystone (#147)
- Fix UpdateContext operations with query parameters are not recognized (#155)
- Remove specific setup for RPM installation in Context Broker uses (#159)
- Add administration port with Version resource (#164)
- Check all the mandatory headers before processing the request (#165) (#110)
- Group and redefine error codes.
- Add execution mode without Access Control authorization for the PEP Proxy (#173)
- Check the service and subservice headers for content (#176)
- Fix the Keystone user authentication error was raised as a connection one (#174)
- Fix type of error when authenticating PEP Proxy (#182)
- Fix some errors appear in the API documentation and don't ever occur (#180)
- Add a guard in the release script to abort if there are unstagged git changes (#181)

* Fri Jan 16 2015 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.4.1
- FIX XML requests wrongly forwarded as an empty JSON (#103).
- FIX Logs don't show Access Control response due to a wrong format placeholder (#105).

* Thu Dec 18 2014 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.4.0
- ADD: Environment variable to select the plugin to execute (#49).
- ADD: Process the "/" value for the fiware-servicepath header as a domain-scoped request instead of project scoped (#70).
- ADD: Cache for every call to Keystone (#46).
- FIX: Slash scaped in Access Control Templates (#73).
- FIX: Capture request forwarding errors (#82).
- FIX: Wrong roles attribute in cached value (#84).
- FIX: Missing "v1" prefix in some standard ops (#86).
- FIX: Make the retries on Keystone requests dependent on the error type (#78)
- FIX: Fixed subscribe action (it was 'suscribe') (#94)

* Tue Dec 02 2014 Daniel Moran <daniel.moranjimenez@telefonica.com> 0.3.0
- Add: Reuse the token instead of authenticating for each request (Issue #22).
- Add: Support for Keystone as the authentication mechanism.
- Add: Admin role bypass for privileged usage of the proxy.
- Add: Plugin to sucure Keypass PAP.
- Add: Plugin to secure Perseo CEP Rules API.
- Add: Change expected headers form UUIDs to Names (and resolve UUIDs against Keystone).
