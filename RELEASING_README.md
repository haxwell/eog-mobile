Releasing a version of Easyah for testing
-----

Be sure all changes you want in this version are committed in both the API and the Client.

1.
ionic cordova build --release android

2.
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore easyah-release-key.keystore /home/jjames/src/learning_ionic/eog-mobile/platforms/android/build/outputs/apk/release/android-release-unsigned.apk alias_name

3.
rm easyah.apk && zipalign -v 4 /home/jjames/src/learning_ionic/eog-mobile/platforms/android/build/outputs/apk/release/android-release-unsigned.apk easyah.apk

4.
Issue the new release on Google Play.

5.
git tag -a vZ.Y.X -m "vZ.Y.X .... ..... "
git push --tags

6.
change config.xml and package.json to have the next version number

7.
#tag the API, too.
git tag -a vZ.Y.X -m "vZ.Y.X .... ..... "
git push --tags

