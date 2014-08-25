# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

MOZ_APP_BASENAME=Fennec
MOZ_APP_VENDOR=Mozilla

MOZ_APP_VERSION=34.0a1
MOZ_APP_UA_NAME=Firefox

MOZ_BRANDING_DIRECTORY=mobile/android/branding/unofficial
MOZ_OFFICIAL_BRANDING_DIRECTORY=mobile/android/branding/official
# MOZ_APP_DISPLAYNAME is set by branding/configure.sh

# We support Android SDK version 9 and up by default.
# See the --enable-android-min-sdk and --enable-android-max-sdk arguments in configure.in.
MOZ_ANDROID_MIN_SDK_VERSION=9

MOZ_SAFE_BROWSING=1

MOZ_NO_SMART_CARDS=1

# Enable getUserMedia
MOZ_MEDIA_NAVIGATOR=1

# Enable NFC permission
MOZ_ANDROID_BEAM=1

if test "$LIBXUL_SDK"; then
MOZ_XULRUNNER=1
else
MOZ_XULRUNNER=
fi

MOZ_CAPTURE=1
MOZ_RAW=1
MOZ_PLACES=
MOZ_SOCIAL=
MOZ_ANDROID_HISTORY=1
MOZ_DISABLE_EXPORT_JS=1

# use custom widget for html:select
MOZ_USE_NATIVE_POPUP_WINDOWS=1

MOZ_APP_ID={aa3c5121-dab2-40e2-81ca-7ea25febc110}

MOZ_EXTENSION_MANAGER=1
MOZ_APP_STATIC_INI=1

# Enable on-demand decompression
MOZ_ENABLE_SZIP=1

MOZ_FOLD_LIBS=1

# Enable navigator.mozPay
MOZ_PAY=1

# Enable UI for healthreporter
MOZ_SERVICES_HEALTHREPORT=1

# Wifi-AP/cell tower data reporting is enabled on non-release builds.
if test ! "$RELEASE_BUILD"; then
MOZ_DATA_REPORTING=1
fi

# Enable runtime locale switching.
MOZ_LOCALE_SWITCHER=1

# Enable second screen and casting support for external devices.
MOZ_DEVICES=1

# Enable second screen using native Android libraries
MOZ_NATIVE_DEVICES=1

# Mark as WebGL conformant
MOZ_WEBGL_CONFORMANT=1

# Enable the Search Activity in nightly.
if test "$NIGHTLY_BUILD"; then
  MOZ_ANDROID_SEARCH_ACTIVITY=1
else
  MOZ_ANDROID_SEARCH_ACTIVITY=
fi

# Don't enable the Mozilla Location Service stumbler.
# MOZ_ANDROID_MLS_STUMBLER=1
