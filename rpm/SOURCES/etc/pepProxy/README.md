# PEP Proxy configuration procedure

PEP Proxy is able to start multiple instances by adding and configuring certain files in `/etc/pepProxy`
and using `pepProxy` service script

To start multiple instances is needed to place in `/etc/pepProxy` one configuration file for 
each instance that is wanted to run. RPM cames with one preconfigured instance (config 
file called pepproxy_default.conf) that can be used as a template to configure another instances.

The `pepProxy` service script to start looks for files in `/etc/pepProxy` that begins with `pepproxy_` 
prefix and has `.conf` extension and start (or stop or status or restat) one process for file found.

It is important to change `PROXY_PORT` and `ADMIN_PORT` to one not used by other PEP intances/services. 

`pepProxy` init.d is packaged into the RPM and is needed to execute PEP Proxy 
in multiinstace explained above. It has the next operations:
- **start**: `sudo /sbin/service pepProxy start [<instance>]` if `<instance>` is not provided, script try to
start as many instances as files that match with `pepproxy_*.conf` template othewise only starts one 
instance whit name provided. I.E. `sudo /sbin/service pepProxy start default` starts a instance that has a
file named `pepproxy_default.conf`
- **stop**: `sudo /sbin/service pepProxy stop [<instance>]` if `<instance>` is not provided, script try to
stop all the instances by listing all pid files under `/var/run/pepProxy` with the pattern `pepproxy_*.pid`.
If `<instance>` is provided try to stop a instance with a pid file `/var/run/pepProxy/pepproxy_<instance>.pid`
- **status**: `sudo /sbin/service pepProxy status [<instance>]` work in the same way that `stop` works but 
showing information about intances status instead stopping it.
- **restart** `sudo /sbin/service pepProxy stop [<instance>]` performs a `stop` and a `start` opetarions 
applying to one or all instances if `<instance>` is provided or not respectively.

Process PEP Proxy (node) is running as pepproxy user