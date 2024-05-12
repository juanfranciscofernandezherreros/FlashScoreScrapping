export const readAllCsv = async function readCSVFiles() {
    const fs = require('fs');
    const csv = require('csv-parser');
    const path = require('path');

    // Directorio donde se encuentran los archivos CSV
    const directoryPath = './csv/s'; // Puedes ajustar esta ruta según la ubicación real de tus archivos CSV

    try {
        const files = await fs.promises.readdir(directoryPath);

        for (const file of files) {
            if (file.endsWith('.csv')) {
                const fileStream = fs.createReadStream(path.join(directoryPath, file));

                fileStream
                    .pipe(csv())
                    .on('data', (row) => {
                        // Verifica si la fila contiene la palabra "RESULTS"
                        if (row.RESULTS) {
                            console.log(`Encontrado en el archivo ${file}:`, row.RESULTS);
                        }
                    })
                    .on('end', () => {
                        console.log(`Lectura del archivo ${file} completa.`);
                    });

                await new Promise((resolve, reject) => {
                    fileStream.on('end', resolve);
                    fileStream.on('error', reject);
                });
            }
        }
    } catch (error) {
        console.error('Error al leer los archivos CSV:', error);
    }
};
