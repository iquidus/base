Iquidus Base
====

-----

### About

Written in node.js, using mongodb and Twitter Bootstrap. Iquidus Base is focused on achieving optimal performance, maximum security and layout consistencey across browsers. Taking care of user registration, authentication, and adiministration; Iquidus Base is the ideal foundation to build your web service upon.

-----

### Open Source

Released under the BSD 3-Clause license, allowing you to use it as the base for your own projects without restrictions. Source code is available via [Github](https://github.com/iquidus/base/). All feedback, bug reports and pull requests are welcome.

###### Get the Source

    git clone https://github.com/iquidus/base.git base

-----

### Install

First ensure node.js and mongodb are installed on your system. Installation of these applicaions vary between OS's and linux distributions, if in doubt, RTFM. 

###### Install Dependencies

	cd base && npm install

###### Configure

    cp ./settings.json.template ./settings.json

Edit any settings you need to.

###### Start Application

	node base
	
###### Visit

    http://127.0.0.1:9001

###### Login

*  email: admin@local.host  
*  password: !Qu1dU5Ba$e

Note: Once logged in, change the default admin accounts username, password and email.

-----

### Development

###### Branches

Each bugfix or feature will be developed in their own branch and then merged into devel when complete. 

devel: Next intended stable version, in development/testing. Once stable this branch gets merged into master.

master: Contains latest stable version.

###### To do

*  0.1.x : Optimization, bugfixes, test scripts.  
*  0.2.x : Security improvements, email confirmation, 4 digit pin.  
*  0.3.x : Plugin hooks.  
