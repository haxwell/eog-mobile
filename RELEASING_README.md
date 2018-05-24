Releasing a version of Easyah for testing
-----

Be sure 
- you have deployed to the phone and done basic testing BEFORE building this APK. If not, and it breaks, as its want to do, you'll just have to do it anyway, so...
- all changes you want in this version are committed in both the API and the Client.
- versions have been upped from the last time you did this.. (see #6)
- you have changed the environment.ts file (in the client) to reflect the environment this build is going to (production vs staging)

1.
ionic cordova build --release android

2.
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore easyah-release-key.keystore /home/jjames/src/learning_ionic/eog-mobile/platforms/android/build/outputs/apk/release/android-release-unsigned.apk alias_name

** Note Password here is the one you've used for a long time in Keepass.

3.
rm easyah.apk --force && zipalign -v 4 /home/jjames/src/learning_ionic/eog-mobile/platforms/android/build/outputs/apk/release/android-release-unsigned.apk easyah.apk

4.
Issue the new release on Google Play.

5.
git tag -a vZ.Y.X -m "vZ.Y.X .... ..... "
git push --tags

6.
change config.xml and package.json to have the next version number. So when this step is done, config.xml and package.json will have a version number higher than what you see from `git tag` #definitionOfDone

7.
#tag the API, too.
git tag -a vZ.Y.X -m "vZ.Y.X .... ..... "
git push --tags

