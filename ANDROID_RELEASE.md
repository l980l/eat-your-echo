# Android / Google Play release

The Android bundle is built on GitHub Actions, so Android Studio is not required on the Mac.

## One-time upload-key setup

1. In the GitHub repository, open **Settings → Secrets and variables → Actions** and add these three secrets:
   - `ANDROID_KEY_ALIAS` — use `itsmyturnupload`
   - `ANDROID_KEYSTORE_PASSWORD` — a long, unique password
   - `ANDROID_KEY_PASSWORD` — another long, unique password
2. Run **Actions → Create Android upload key → Run workflow** once.
3. Download the `android-upload-key-backup` artifact immediately and store `upload-keystore.jks` in a secure backup location. It expires after one day.
4. On the Mac, convert that downloaded file to one line and add the output as the fourth repository secret, `ANDROID_KEYSTORE_BASE64`:

   ```sh
   base64 < upload-keystore.jks | tr -d '\n'
   ```

Never commit the keystore or any passwords. Keep an offline backup of the keystore and passwords.

## Build a Play-ready AAB

1. Push the Android workflow files to GitHub.
2. Open **Actions → Build Android release AAB → Run workflow**.
3. Set a visible version (for example `1.0.0`) and an always-increasing version code (for example `1`).
4. Download the resulting `app-release.aab` artifact and upload it to the Play Console.

The first Play Console upload should enable **Play App Signing**. The upload key above signs the bundle sent to Google; Google signs the copies distributed to players.
