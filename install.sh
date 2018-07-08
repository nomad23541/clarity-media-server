#!/bin/bash

# check if mongodb is installed on system
mongodb_installed() {
	if hash mongod 2> /dev/null; then
		# installed
		return 0
	else
		# not installed
		return 1
	fi	
}

MONGOTEMP="$(mktemp -d)"
MONGODIR="/opt/mongodb"

install_mongodb() {
	# make mongodb install dir
	mkdir ${MONGODIR}
	# go into tmp directory
	cd ${MONGOTEMP}
	# download tarball and extract to mongodb dir
	curl -O "https://fastdl.mongodb.org/linux/mongodb-linux-x86_64-3.6.0.tgz"
	tar -zxvf mongodb-linux-x86_64-3.6.0.tgz
	cp -a mongodb-linux-x86_64-3.6.0/. ${MONGODIR}
	# now add to path
	echo export PATH=${MONGODIR}/bin':$PATH' >> /home/${SUDO_USER}/.bashrc
	source /home/${SUDO_USER}/.bashrc
	# finally remove tmp dir
	rm -rf ${MONGOTEMP}
}

echo "Clarity Media Server"
echo "This script will install any dependencies outside of npm."
echo "Currently: MongoDB"
echo

# require sudo
if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

if mongodb_installed; then
	echo "MongoDB is installed."
else
	echo "MongoDB isn't installed, installing now..."
	install_mongodb
	echo "MongoDB finished installing."
fi

echo "Nothing else to do, script has finished."
