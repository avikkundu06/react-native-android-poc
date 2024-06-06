const fs = require('fs/promises');
const path = require('path');

// Function to check a folder exist or not
// const checkDirectoryExists = async folderPath => {
//   try {
//     const stats = await fs.stat(folderPath);
//     if (stats.isDirectory()) {
//       console.log(`Directory exists: ${folderPath}`);
//       return true;
//     }
//   } catch (error) {
//     if (error.code === 'ENOENT') {
//       console.log(`Directory does not exist: ${folderPath}`);
//     } else {
//       console.error(`Error checking directory: ${error.message}`);
//     }
//   }
//   return false;
// };

// Function to create a directory
// async function createDirectory(folderPath) {
//   try {
//     const stats = await fs.mkdir(folderPath, {recursive: true});
//     console.log(`Directory created: ${folderPath}`);
//     return true;
//   } catch (error) {
//     console.error(`Error creating directory: ${error.message}`);
//   }
//   return false;
// }

// Function to copy directories
async function copyDirectory(src, dest) {
  try {
    await fs.mkdir(dest, {recursive: true});
    const entries = await fs.readdir(src, {withFileTypes: true});

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
    return true;
  } catch (error) {
    console.error(`Error copying directory: ${error.message}`);
  }
  return false;
}

// Function to delete a folder
async function deleteDirectory(folderPath) {
  try {
    const stats = await fs.rm(folderPath, {recursive: true});
    console.log(`Directory deleted: ${folderPath}`);
    return true;
  } catch (error) {
    console.error(`Error deleted directory: ${error.message}`);
  }
  return false;
}

// Function to update the package name in a file
const updatePackageName = async (filePath, oldPackageName, newPackageName) => {
  try {
    let filedata = await fs.readFile(filePath, 'utf8');
    const result = filedata.replace(new RegExp(oldPackageName, 'g'), newPackageName);

    await fs.writeFile(filePath, result, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error update app version: ${error.message}`);
  }
  return false;
};

// Function to update the app version in build.gradle
const updateAppVersion = async (filePath, newVersion, newVersionCode) => {
  try {
    let filedata = await fs.readFile(filePath, 'utf8');
    let result = filedata.replace(/versionName "\d+\.\d+\.\d+"/, `versionName "${newVersion}"`);
    result = result.replace(/versionCode \d+/, `versionCode ${newVersionCode}`);

    await fs.writeFile(filePath, result, 'utf8');
    return true;
  } catch (error) {
    console.error(`Error update app version: ${error.message}`);
  }
  return false;
};

const updateConfig = async (oldPackageName, newPackageName, newVersion, newVersionCode) => {
  try {
    const oldAndroidPackageSegments = oldPackageName.split('.');
    const newAndroidPackageSegments = newPackageName.split('.');

    const debugPath = path.join(__dirname, '..', 'android', 'app', 'src', 'debug', 'java');
    const releasePath = path.join(__dirname, '..', 'android', 'app', 'src', 'release', 'java');
    const mainPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java');

    const isTempCreated =
      (await copyDirectory(debugPath, path.join(__dirname, 'temp/debug'))) &&
      (await copyDirectory(releasePath, path.join(__dirname, 'temp/release'))) &&
      (await copyDirectory(mainPath, path.join(__dirname, 'temp/main')));

    if (isTempCreated) {
      const isOldDirectoryDeleted =
        (await deleteDirectory(path.join(debugPath, oldAndroidPackageSegments[0]))) &&
        (await deleteDirectory(path.join(releasePath, oldAndroidPackageSegments[0]))) &&
        (await deleteDirectory(path.join(mainPath, oldAndroidPackageSegments[0])));
      if (isOldDirectoryDeleted) {
        const isConfigFIleCopied =
          (await copyDirectory(path.join(__dirname, 'temp/debug', oldAndroidPackageSegments.join('/')), path.join(debugPath, newAndroidPackageSegments.join('/')))) &&
          (await copyDirectory(path.join(__dirname, 'temp/release', oldAndroidPackageSegments.join('/')), path.join(releasePath, newAndroidPackageSegments.join('/')))) &&
          (await copyDirectory(path.join(__dirname, 'temp/main', oldAndroidPackageSegments.join('/')), path.join(mainPath, newAndroidPackageSegments.join('/'))));
        if (isConfigFIleCopied) {
          const buildGradlePath = path.join(__dirname, '..', 'android', 'app', 'build.gradle');
          const mainActivityPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', ...newPackageName.split('.'), 'MainActivity.java');
          const mainApplicationPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'java', ...newPackageName.split('.'), 'MainApplication.java');
          const manifestPath = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
          const debugRNFilePath = path.join(debugPath, ...newPackageName.split('.'), 'ReactNativeFlipper.java');
          const releaseRNFilePath = path.join(releasePath, ...newPackageName.split('.'), 'ReactNativeFlipper.java');

          const configUpdated =
            // Update package name
            (await updatePackageName(mainActivityPath, oldPackageName, newPackageName)) &&
            (await updatePackageName(mainApplicationPath, oldPackageName, newPackageName)) &&
            (await updatePackageName(manifestPath, oldPackageName, newPackageName)) &&
            (await updatePackageName(buildGradlePath, oldPackageName, newPackageName)) &&
            (await updatePackageName(debugRNFilePath, oldPackageName, newPackageName)) &&
            (await updatePackageName(releaseRNFilePath, oldPackageName, newPackageName)) &&
            // Update app version
            (await updateAppVersion(buildGradlePath, newVersion, newVersionCode));
          if (configUpdated) {
            const deleteTempFolder = await deleteDirectory(path.join(__dirname, 'temp'));
            console.log(debugPath);
            console.log(releasePath);
            console.log(mainPath);
            console.log(oldAndroidPackageSegments);
            console.log(newAndroidPackageSegments);
            console.log(path.join(debugPath, oldAndroidPackageSegments[0]));
            process.exit(0);
          }
        }
      }
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.log(`Error creating folder: ${err.message}`);
  }
};

// Parameters
const oldPackageName = 'com.rn_android_poc';
const newPackageName = 'com.rn.androidpoc';
const newVersion = '1.0.0';
const newVersionCode = 1;

// Run the update
updateConfig(oldPackageName, newPackageName, newVersion, newVersionCode);
