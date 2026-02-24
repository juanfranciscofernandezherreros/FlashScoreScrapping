import fs from 'fs';
import csv from 'csv-parser';
import path from 'path';

const CSV_RESULTS_DIR = path.join(process.cwd(), 'src', 'csv', 'results');

export const readAllCsv = async function readCSVFiles() {
    try {
        const files = await fs.promises.readdir(CSV_RESULTS_DIR);

        for (const file of files) {
            if (file.endsWith('.csv')) {
                const fileStream = fs.createReadStream(path.join(CSV_RESULTS_DIR, file));

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

readAllCsv();
