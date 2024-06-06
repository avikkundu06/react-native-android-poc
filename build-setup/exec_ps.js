const {exec} = require('child_process');

// Function to execute a PowerShell command
function executePowerShellCommand(command) {
  // Ensure the command is properly escaped for PowerShell
  const powershellCommand = `powershell.exe -NoProfile -Command "${command.replace(/"/g, '\\"')}"`;

  exec(powershellCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing PowerShell command: ${error.message}`);
      return;
    }

    if (stderr) {
      console.error(`PowerShell Error: ${stderr}`);
      return;
    }

    console.log(`PowerShell Output: ${stdout}`);
  });
}

// Example usage with a more complex command
const command = 'cd .\\android\\; ./gradlew clean; cd ..;'; // Example complex command
executePowerShellCommand(command);
