import puppeteer from 'puppeteer';
import mysql from 'mysql2/promise'; // Import mysql2 library

// Configuración de la base de datos MySQL
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'scheduling',
};

async function createUrlsTable(connection) {
  const [rows, fields] = await connection.execute(
    "CREATE TABLE IF NOT EXISTS urls (id INT AUTO_INCREMENT PRIMARY KEY, url VARCHAR(255) UNIQUE, isOpened CHAR(1))"
  );
}

// Modifica las demás funciones relacionadas con la base de datos para usar el método .execute()

// Ejemplo: función countUnopenedUrls
async function countUnopenedUrls(connection) {
  const [rows, fields] = await connection.execute(
    "SELECT COUNT(*) AS count FROM urls WHERE isOpened = 'F'"
  );
  return rows[0].count;
}

async function main(url, connection) {
  if (url) {
    console.log(`La URL proporcionada es ${url}.`);
    const urlExists = await checkUrlExists(url, connection);
    if (!urlExists) {
      insertUrl(url, connection);
    }
  } else {
    console.log("No se proporcionó ninguna URL.");
  }

  const start_time = Date.now();
  let timeLimitReached = false;

  while (!timeLimitReached) {
    const count = await countUnopenedUrls(connection);
    if (count > 0) {
      const urls = await getUnopenedUrls(connection);
      for (const url of urls) {
        const iterationTime = Date.now();
        console.log("Start Time:", start_time);
        console.log("Iteration Time:", iterationTime);

        if (Date.now() - start_time >= 60000) {
          console.log("Se ha alcanzado el tiempo límite de un minuto.");
          timeLimitReached = true;
          break;
        } else {
          console.log(`Abriendo URL: ${url}`);
          const hrefs = await extractHrefs(url);

          for (const href of hrefs) {
            console.log(`Enlace extraído: ${href}`);
            const hrefExists = await checkUrlExists(href, connection);
            if (!hrefExists) {
              insertUrl(href, connection);
            } else {
              console.log("Este enlace ya existe:", href);
            }
          }

          updateUrl(url, connection);
        }
      }
    } else {
      console.log("No hay URLs por abrir.");
      break;
    }
  }
}

async function checkUrlExists(url, connection) {
    const [rows, fields] = await connection.execute(
      "SELECT url FROM urls WHERE url = ?",
      [url]
    );
  
    return rows.length > 0;
  }

  async function getUnopenedUrls(connection) {
    const [rows, fields] = await connection.execute(
      "SELECT url FROM urls WHERE isOpened = 'F'"
    );
  
    return rows.map((row) => row.url);
  }
  

  async function insertUrl(url, connection) {
    const [rows, fields] = await connection.execute(
      "INSERT INTO urls (url, isOpened) VALUES (?, 'F')",
      [url]
    );
  }
  
async function extractHrefs(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const hrefs = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    return links.map(link => link.href);
  });
  await browser.close();

  const filteredHrefs = hrefs.filter(href => /basketball/i.test(href) && href.split('/').length >= 5 && href.split('/').length <= 7 && !/news/i.test(href));

  return filteredHrefs;
}

async function updateUrl(url, connection) {
    const [rows, fields] = await connection.execute(
      "UPDATE urls SET isOpened = 'T' WHERE url = ?",
      [url]
    );
  }
  


  
// Ejecución de la función principal
async function run() {
  const connection = await mysql.createConnection(dbConfig);
  await createUrlsTable(connection);
  const url = process.argv[2] || null;
  await main(url, connection);
  await connection.end(); // Cierre de la conexión al finalizar
}


run();
