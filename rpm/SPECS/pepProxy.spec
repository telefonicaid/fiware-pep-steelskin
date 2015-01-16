Summary: Orion Policy Enforcement Point
Name: pep-proxy
Version: %{_product_version}
Release: %{_product_release}
License: AGPLv3
BuildRoot: %{_topdir}/BUILDROOT/
BuildArch: noarch
# Requires: nodejs >= 0.10.24
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
    echo "[INFO] Creating log directory"
    mkdir -p %{_pepProxy_log_dir}
    chown -R %{_project_user}:%{_project_user} %{_pepProxy_log_dir}
    chown -R %{_project_user}:%{_project_user} _install_dir
    chmod g+s %{_pepProxy_log_dir}
    setfacl -d -m g::rwx %{_pepProxy_log_dir}
    setfacl -d -m o::rx %{_pepProxy_log_dir}

    echo "[INFO] Checking Context Broker installations"
    service --status-all |grep contextBroker
    CONTEXT_BROKER=$?

    if [ -e /etc/sysconfig/contextBroker ] && [ $CONTEXT_BROKER = 0 ]; then
            service contextBroker stop
            CURRENT_PORT=$(cat  /etc/sysconfig/contextBroker |grep "BROKER_PORT=" |awk -F '=' '{print $2}')
            sed -i s/BROKER_PORT=.*/BROKER_PORT=10026/g /etc/sysconfig/contextBroker
            sed -i "s/PROXY_PORT=.*/PROXY_PORT=$CURRENT_PORT/g" /etc/sysconfig/pepProxy
            service contextBroker start
    fi

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
%config /etc/sysconfig/%{_service_name}
%{_install_dir}

%changelog
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
