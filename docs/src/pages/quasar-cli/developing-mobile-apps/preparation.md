---
title: Mobile App Preparation
desc: What you need to do before developing a Quasar hybrid mobile app with Cordova.
---
Before we dive in to the actual development, we need to do some preparation work. Here we will go over Android as the target platform.

Quasar is not a fully integrated mobile development toolchain.  Almost all of the software discussed on this page is not Quasar and changes without notice, so your milage may vary.  

If you find something's changed, missing, or there is a better way, click "edit" and submit a PR.

## 1. Install the Tools

We will:

a. Install npm's cordova
b. Install Android SDK
c. Gradle build tool
d. Test Android simulator

### a. Install npm's cordova
First step is to make sure you got the Cordova CLI installed and the necessary SDKs.

```bash
$ npm install -g cordova
$ cordova --version
9.0.0
```

### b. Install Android SDK

Next, install the Android platform SDK on your machine. You can [download the Android Studio here](https://developer.android.com/studio/index.html) and follow these [installation steps](https://developer.android.com/studio/install.html) afterwards.

* Add Android installation to your path:

#### b.Unix (macOS, linux)

```bash
export ANDROID_HOME="$HOME/bin/Android/Sdk"
export ANDROID_SDK_ROOT=$ANDROID_HOME
PATH=$PATH:$ANDROID_HOME/emulator  
PATH=$PATH:$ANDROID_HOME/tools  
PATH=$PATH:$ANDROID_HOME/platform-tools
```

> Please note that sometimes the `/Android/Sdk` folder is added inside `/Library/` inside your user folder. Check your user folder and if the `/Android/` folder is only inside `/Library/` do: `export ANDROID_HOME="$HOME/Library/Android/Sdk"` instead.  

[See also](https://stackoverflow.com/a/51812999/1483977).  ANDROID_SDK_ROOT clears a warning and possibly a emulator bug.
There is a path bug with Sdk/tools/emulator vs Sdk/emulator/emulator.  Test with:

```
which emulator
/home/youruser/bin/Android/Sdk/emulator/emulator
```
#### b.Windows

```bash
setx ANDROID_HOME "%USERPROFILE%\AppData\Local\Android\Sdk"
setx path "%path%;%ANDROID_HOME%\tools;%ANDROID_HOME%\platform-tools"
```

Then, start Android studio by changing into the folder you installed it in and run `./studio.sh`. Next step is to install the individual SDKs:

* Open the "Configure" menu at the bottom of the window:

  ![SDK manager](https://cdn.quasar.dev/img/Android-Studio-SDK-Menu.png "SDK manager")

* Select the desired SDKs. As per August 2018 Cordova supports 5.0 and up and click on "Apply" to install the SDKs.

  ![SDK selection](https://cdn.quasar.dev/img/Android-Studio-SDK-selection.png "SDK selection")


### c. Install "Gradle" build tool
You'll also need a copy of the Java build tool [gradle](https://gradle.org/):

#### c.Linux:  

```
sudo apt install gradle
```

#### c.Windows: 

```
Google and PR :-)
```

### d. Install Emulator

We want to test our Quasar web app packaged in Cordova.  The best way to do that is to use the Androdi Emulator.  Let's install dependencies.

#### d.Linux

The adduser and reboot will get past this error: `/dev/kvm device: permission denied in AVD manager
```
sudo apt install qemu-kvm && sudo adduser $(whoami) kvm && reboot now
```

#### d.Windows

This step may not be needed.  PR :-)

### d. Test the Android simulator
Great!  Let's test the simulator.

Hint: Open a project to pass this bug:  https://issuetracker.google.com/issues/128271323

Hint: You want API 27 - Oreo.

- Open AVD manager -> Help -> Find Action -> AVD Manager
- Android Studio -> AVD Manager -> Nexus 5s -> DELETE
- AVD Manager -> Create Virtual Device -> Nexus 5 -> Oreo (API 27) -> Finish
  (If you select Pie, you'll get this error: https://stackoverflow.com/questions/45940861/android-8-cleartext-http-traffic-not-permitted#50834600)
- Click > to start the Virtual device.  Click the X over the power button to close.
- After you've verified the emulator, close android studio


## 2. Add Cordova Quasar Mode
In order to develop/build a Mobile app, we need to add the Cordova mode to our Quasar project. What this does is that it uses Cordova CLI to generate a Cordova project in `/src-cordova` folder. `/src-cordova/www` folder will be overwritten each time you build.

```bash
$ quasar mode add cordova
```

## 3. Add Platform
To switch to the cordova project, type:

```
$ cd src-cordova
```

To add a target platform, type:

```
$ cordova platform add [android|ios]
```

To verify that everything is in order, type:

```bash
$ cordova requirements
```

> On some newer Debian-based operating systems you might face a very persistent problem when running `cordova requirements`. Please see the ["Android SDK not found" after installation](/quasar-cli/developing-cordova-apps/troubleshooting-and-tips#Android-SDK-not-found-after-installation-of-the-SDK) section for assistance.

### Switching to iOS WkWebView

Switching to WKWebView is highly recommended (but optional!) as UIWebView has been deprecated in iOS 12.0 as described in this Cordova blog post: [https://cordova.apache.org/news/2018/08/01/future-cordova-ios-webview.html](https://cordova.apache.org/news/2018/08/01/future-cordova-ios-webview.html).

**However, choose wisely if you want to replace the default webview. Each comes with its own caveats.** Make sure that you visit the link above.

#### Option 1: Ionic Webview Plugin

1. Install Ionic Webview Plugin

```bash
# from /src-cordova
$ cordova plugin add cordova-plugin-ionic-webview
```

2. Add ScrollEnabled Preference to Config.xml

```xml
<platform name="ios">
  <preference name="ScrollEnabled" value="true" />
</platform>
```

3. Consult Ionic Docs for caveats on WkWebViewPlugin
  * [https://beta.ionicframework.com/docs/building/webview](https://beta.ionicframework.com/docs/building/webview)
  * [https://github.com/ionic-team/cordova-plugin-ionic-webview](https://github.com/ionic-team/cordova-plugin-ionic-webview)

#### Option 2: Cordova WkWebviewEngine Plugin

1. Install Cordova WkWebviewEngine Plugin

```bash
# from /src-cordova
$ cordova plugin add cordova-plugin-wkwebview-engine
```

2. For caveats and more info, visit: [https://github.com/apache/cordova-plugin-wkwebview-engine](https://github.com/apache/cordova-plugin-wkwebview-engine)

## 4. Start Developing
If you want to jump right in and start developing, you can skip step #2 and #3 commands and issue:

```bash
$ quasar dev -m cordova -T [android|ios]

# passing extra parameters and/or options to
# underlying "cordova" executable:
$ quasar dev -m ios -- some params --and options --here
```

This will add Cordova mode and project automatically, if it is missing.
