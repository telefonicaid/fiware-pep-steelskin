# PEP Proxy configuration procedure

PEP Proxy is able to start multiple instances by adding and configuring certain files in `/etc/pepProxy.d`
and using `pepProxy` service script

In order to start multiple instances of the proxy, just add one configuration file per instance in the 
`/etc/pepProxy.d` folder. RPM comes with one preconfigured instance (config file called pepproxy_default.conf) 
that can be used as a template to configure another instances.

In its starting sequence, the `pepProxy` service looks for files in  `/etc/pepProxy.d` that begins with `pepproxy_` 
prefix and has `.conf` extension and start (or stop or status or restat) one process for file found.

It is important to change `PROXY_PORT` and `ADMIN_PORT` to one not used by other PEP intances/services. 

`pepProxy` init.d is packaged into the RPM and is needed to execute PEP Proxy 
in multiinstace explained above. It has the next operations:
- **start**: `sudo /sbin/service pepProxy start [<instance>]` If `<instance>` is not provided, the script 
tries to start as many instances as found in the configuration folder as possible (matching the configuration
 file pattern). Otherwise, it only starts a single instance with the provided name.
- **stop**: `sudo /sbin/service pepProxy stop [<instance>]` if `<instance>` is not provided, script tries to
stop all the instances by listing all pid files under `/var/run/pepProxy` with the pattern `pepproxy_*.pid`.
If `<instance>` is provided try to stop a instance with a pid file `/var/run/pepProxy/pepproxy_<instance>.pid`
- **status**: `sudo /sbin/service pepProxy status [<instance>]` work in the same way that `stop` works but 
showing information about intances status instead stopping it.
- **restart** `sudo /sbin/service pepProxy stop [<instance>]` performs a `stop` and a `start` opetarions 
applying to one or all instances if `<instance>` is provided or not respectively.

Process PEP Proxy (node) is running as `pepproxy` user
