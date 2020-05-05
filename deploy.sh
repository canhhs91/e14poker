#!/bin/sh

if [[ $1 == "production" ]]
then
	echo "Creating a PRODUCTION build..."
	yarn build
	echo "Switching to the FIREBASE PRODUCTION PROJECT..."
 	firebase use production
else
	echo "Creating a DEVELOPMENT build..."
        yarn build:dev
        echo "Switching to the FIREBASE DEVELOPMENT PROJECT..." 
        firebase use development
fi

echo "Deploying to firebase"
firebase deploy
