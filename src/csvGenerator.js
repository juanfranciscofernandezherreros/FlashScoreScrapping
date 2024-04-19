import fs from "fs";

export function generateCSVResultsMatchs(data,nombreArchivo) {
    if (!data || data.length === 0) {
      console.log("No hay datos para generar el archivo CSV.");
      return;
    }
  
    const headers = Object.keys(data[0]);
    const csvContent = data.map(obj =>
      headers.map(key => obj[key]).join(",")
    ).join("\n");
    const headerRow = headers.join(",") + "\n";
    const csvData = headerRow + csvContent;
    fs.writeFile(`${nombreArchivo}.csv`, csvData, (err) => {
      if (err) throw err;
      console.log('Los datos se han exportado correctamente a results.csv');
      process.exit(0); // Termina el proceso con código de salida 0 (éxito)
    });
  }
