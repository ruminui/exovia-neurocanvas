import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const android = path.join(root, 'android', 'app', 'src', 'main');
const res = path.join(android, 'res');

async function write(relative, content) {
  const target = path.join(res, relative);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, `${content.trim()}\n`, 'utf8');
}

await fs.access(path.join(android, 'AndroidManifest.xml'));

await write('values/colors.xml', `
<resources>
    <color name="exovia_black">#050505</color>
    <color name="exovia_surface">#0D0D0B</color>
    <color name="exovia_gold">#D8AA42</color>
    <color name="exovia_gold_bright">#F3D88F</color>
    <color name="colorPrimary">#D8AA42</color>
    <color name="colorPrimaryDark">#050505</color>
    <color name="colorAccent">#D8AA42</color>
</resources>`);

await write('values/styles.xml', `
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.NoActionBar">
        <item name="colorPrimary">@color/exovia_gold</item>
        <item name="colorPrimaryDark">@color/exovia_black</item>
        <item name="colorAccent">@color/exovia_gold</item>
        <item name="android:fontFamily">sans</item>
        <item name="android:windowLightStatusBar">false</item>
        <item name="android:statusBarColor">@color/exovia_black</item>
        <item name="android:navigationBarColor">@color/exovia_black</item>
        <item name="android:windowActionModeOverlay">true</item>
    </style>

    <style name="AppTheme.NoActionBar" parent="AppTheme">
        <item name="windowActionModeOverlay">true</item>
        <item name="android:windowNoTitle">true</item>
    </style>

    <style name="AppTheme.NoActionBarLaunch" parent="Theme.SplashScreen">
        <item name="windowSplashScreenBackground">@color/exovia_black</item>
        <item name="windowSplashScreenAnimatedIcon">@drawable/ic_exovia_foreground</item>
        <item name="windowSplashScreenIconBackgroundColor">@color/exovia_surface</item>
        <item name="postSplashScreenTheme">@style/AppTheme.NoActionBar</item>
    </style>
</resources>`);

await write('drawable/ic_exovia_foreground.xml', `
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="108"
    android:viewportHeight="108">
    <path
        android:pathData="M18,58 C18,38 40,28 55,44 L70,61 C81,73 96,65 96,51 C96,36 79,29 68,40 L38,72 C24,87 8,77 8,62 C8,46 26,38 38,50 L53,66"
        android:fillColor="@android:color/transparent"
        android:strokeColor="#F3D88F"
        android:strokeWidth="7"
        android:strokeLineCap="round"
        android:strokeLineJoin="round" />
    <path
        android:pathData="M54,54 m-2,0 a2,2 0,1 0,4 0 a2,2 0,1 0,-4 0"
        android:fillColor="#FFF0B3" />
</vector>`);

await write('drawable/ic_launcher_legacy.xml', `
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="@color/exovia_black" />
            <corners android:radius="24dp" />
            <stroke android:width="2dp" android:color="#6B5224" />
        </shape>
    </item>
    <item android:drawable="@drawable/ic_exovia_foreground" android:left="8dp" android:top="8dp" android:right="8dp" android:bottom="8dp" />
</layer-list>`);

await write('mipmap-anydpi-v26/ic_launcher.xml', `
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/exovia_black" />
    <foreground android:drawable="@drawable/ic_exovia_foreground" />
    <monochrome android:drawable="@drawable/ic_exovia_foreground" />
</adaptive-icon>`);

await write('mipmap-anydpi-v26/ic_launcher_round.xml', `
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/exovia_black" />
    <foreground android:drawable="@drawable/ic_exovia_foreground" />
    <monochrome android:drawable="@drawable/ic_exovia_foreground" />
</adaptive-icon>`);

await write('values/strings.xml', `
<resources>
    <string name="app_name">Exovia NeuroCanvas</string>
    <string name="title_activity_main">Exovia NeuroCanvas</string>
    <string name="package_name">com.exovia.neurocanvas</string>
    <string name="custom_url_scheme">com.exovia.neurocanvas</string>
</resources>`);

const manifestPath = path.join(android, 'AndroidManifest.xml');
let manifest = await fs.readFile(manifestPath, 'utf8');
manifest = manifest
  .replace(/android:icon="@[^"]+"/, 'android:icon="@drawable/ic_launcher_legacy"')
  .replace(/android:roundIcon="@[^"]+"/, 'android:roundIcon="@mipmap/ic_launcher_round"')
  .replace(/android:theme="@[^"]+"/, 'android:theme="@style/AppTheme"');
await fs.writeFile(manifestPath, manifest, 'utf8');

const packageInfo = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
const buildGradlePath = path.join(root, 'android', 'app', 'build.gradle');
let buildGradle = await fs.readFile(buildGradlePath, 'utf8');
const versionCode = Math.max(1, Number.parseInt(process.env.GITHUB_RUN_NUMBER || '1', 10) || 1);
buildGradle = buildGradle
  .replace(/versionCode\s+\d+/, `versionCode ${versionCode}`)
  .replace(/versionName\s+["'][^"']+["']/, `versionName "${packageInfo.version}"`);
await fs.writeFile(buildGradlePath, buildGradle, 'utf8');

console.log(`Exovia Android branding configured. Version ${packageInfo.version} (${versionCode}).`);
