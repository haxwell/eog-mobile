#!/bin/bash

PWD=$(pwd)
BIN="/bin"
if [[ $PWD != *"$BIN" ]]; then
    echo "Sorry, this script assumes that it is run from the ./bin directory. [ rather than $PWD ]"
    exit 1
fi

GIT_STATUS_LINE_COUNT=$(git status | wc -l)
GIT_IS_ON_DEVELOP_BRANCH=$(git status)

if [[ $GIT_IS_ON_DEVELOP_BRANCH = "On branch develop"* ]] && [[ $GIT_IS_ON_DEVELOP_BRANCH = *"working tree clean" ]]; then

ENV_STAGING="staging"
ENV_PROD="prod"

while getopts e:t: option
do
    case "${option}"
        in
        e) ENV=${OPTARG};;
        t) TAG_THIS_VERSION=${OPTARG};;
    esac
done

if [ -z $ENV ]; then
    echo "(1) Usage: automated-build -e [staging|prod]"
    exit 1
fi

if [ $ENV != $ENV_STAGING ] && [ $ENV != $ENV_PROD ]; then
    echo "(2) Usage: automated-build -e [staging|prod]"
    exit 1
fi

cd ..

    rm --force platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk

    echo "Environment is set to [ "$ENV" ]"
    echo "Building the release APK...."

    cp "src/_environments/environment."$ENV".ts" "src/_environments/environment.ts"
    ionic cordova build --release android

    if [ -e platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ]; then
        # TODO print a nice message when the build does not produce the APK

        if [ -ne easyah-release-key.keystore ]; then
            echo "Error: the .keystore release key for easyah was not found. For security, this file is not a part of the project. You will need to go to your secret place and find it."
            exit 1
        fi

        echo "Running jarsigner on the APK"

        jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore easyah-release-key.keystore platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk alias_name

        echo "Running zipalign on the new Easyah APK"
        rm easyah.apk --force && zipalign -v 4 platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk easyah.apk

        if [ $ENV = $ENV_PROD ] && [ $TAG_THIS_VERSION = "true" ]; then
            VERSION=$(sed -nE 's/^\s*"version": "(.*?)",$/\1/p' package.json)
            echo "Merging the develop branch into master... Tagging this version as [ "$VERSION" ]..."

            git checkout master
            git merge develop
            /usr/bin/git push
            
            git tag -a v$VERSION -m "v$VERSION, tagged automatically by the wonderful automated-build script."
            git push --tags

            git checkout develop

            NEXT_VERSION=$(./bin/increment_version.awk $VERSION)
            sed -i 's/version":"'$VERSION'/version":"'$NEXT_VERSION'/' package.json
            sed -i 's/version": "'$VERSION'/version": "'$NEXT_VERSION'/' package.json
            sed -i 's/version="'$VERSION'/version="'$NEXT_VERSION'/' config.xml

            # TODO Figure out all that JWT stuff that Google Play Store requires in order to push an APK (See https://developers.google.com/identity/protocols/OAuth2ServiceAccount)
            # TODO Look into what bullshit Apple requires to push a build via API

        fi
    fi
else
    echo "Error: The repository is not on the 'develop' branch, or the branch is not clean."
fi

cd -

