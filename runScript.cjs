const { exec } = require('child_process');

const country = 'spain';
const league = 'acb';
const action = 'results';
const headless = 'headless';

// Construct the npm command
const command = `npm run start country=${country} league=${league} action=${action} ${headless}`;

// Array para almacenar las líneas filtradas
const filteredLinesArray = [];

// Función para ejecutar comandos de forma secuencial
function executeSequentially(index) {
  if (index === filteredLinesArray.length) {
    console.log('All commands executed successfully');
    process.exit(0); // Exit the script successfully when all commands are done
    return;
  }

  const filteredLine = filteredLinesArray[index];
  const newCommand = `npm run start country=${country} league=${league} action=${action} ids=${filteredLine} includeMatchData=true includeStatsPlayer=false includeStatsMatch=false includePointByPoint=false ${headless}`;

  // Execute the new command
  exec(newCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      console.error(`Command stderr: ${stderr}`);
      process.exit(1); // Exit the script with an error code
    }

    // Log the output of the new command
    console.log(`Output for ${filteredLine}:`);
    console.log(stdout);

    // Execute the next command recursively
    executeSequentially(index + 1);
  });
}

// Execute the command to get lines
exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    console.error(`Command stderr: ${stderr}`);
    process.exit(1); // Exit the script with an error code
  }

  // Split the stdout into lines
  const lines = stdout.split('\n');

  // Filter and push only the lines that start with "g_3" to the array
  lines.forEach(line => {
    if (line.trim().startsWith('g_3')) {
      filteredLinesArray.push(line.trim());
    }
  });

  // Start executing commands sequentially
  executeSequentially(0);

  

});
