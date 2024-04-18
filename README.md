
npm run start-urls -- --url https://www.flashscore.com/basketball/spain/acb 

npm run start country=spain league=acb action=fixtures generateCSV=false headless

npm run start country=spain league=acb action=fixtures generateCSV=true headless

npm run start country=spain league=acb action=results generateCSV=false headless

npm run start country=spain league=acb action=results generateCSV=true headless

npm run start country=spain league=acb action=results ids=g_3_EVvGhsts includeMatchData=true includeStatsPlayer=false includeStatsMatch=false includePointByPoint=false generateCSV=false  headless

npm run start country=spain league=acb action=results ids=g_3_EVvGhsts includeMatchData=true includeStatsPlayer=false includeStatsMatch=false includePointByPoint=false generateCSV=true  headless

npm run start country=spain league=acb action=results ids=g_3_EVvGhsts includeMatchData=true includeStatsPlayer=false includeStatsMatch=true includePointByPoint=false generateCSV=true  headless

---

npm run start newUrl=https://www.flashscore.com/basketball/spain/acb/results/ generateCSV=true headless

npm run start country=spain league=acb action=results generateCSV=true headless


docker build -t flashscore-scraping:1.0.0 .


docker run flashscore-scraping:1.0.0



  if (url != null) { // Comprueba si newUrl no es nulo
    if (generateCSV == true) { // Comprueba si generateCSV es verdadero
        // Abre un navegador Puppeteer en modo headless o visible dependiendo del valor de la variable headless
        const browser = await puppeteer.launch({ headless });
        console.log("XXXX");
        console.log("Argument url ", url); // Imprime la URL
        const parts = url.split("/"); // Divide la URL en partes utilizando "/" como delimitador
        // La parte de interés sería la cuarta y la quinta después de la división
        const country = parts[4]; // Extrae el país de la URL
        const league = parts[5]; // Extrae la liga de la URL
        console.log(country); // Imprime el país
        console.log(country); // Imprime la liga
        // Obtiene la lista de identificadores de partidos
        allMatchIdLists = await getMatchIdList(browser, country, league);
        // Itera sobre la lista de datos de eventos y los registra
        console.log("[season : " + allMatchIdLists.additionalContent + "]");
        console.log("generateCSV", generateCSV); // Imprime el valor de generateCSV
        console.log("Generando archivo CSV..."); // Imprime un mensaje
        const fechaActual = new Date(); // Obtiene la fecha actual
        const formattedFecha = formatFecha(fechaActual); // Formatea la fecha
        // Genera un nombre de archivo para el archivo CSV basado en la fecha actual, el país y la liga
        const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}`;
        // Genera un archivo CSV con los resultados de los partidos
        generateCSVResultsMatchs(allMatchIdLists.eventDataList, nombreArchivo);
    }
}

 
 
  // Función para generar el archivo CSV
  // Función para generar el archivo CSV con encabezados
	function generateCSVFileMatch(data,country,league) {
	  // Define los encabezados del CSV
	  const headers = Object.keys(data);
	  // Crea una cadena con los encabezados separados por comas y agrega una nueva línea
	  const headerRow = headers.join(",") + "\n";
	  // Obtiene los valores de los datos y los concatena en una cadena separada por comas
	  const csvContent = Object.values(data).join(",") + "\n";
	  // Combina los encabezados y los datos
	  const csvData = headerRow + csvContent;
	  // Escribe los datos en el archivo CSV
	  fs.writeFile('datos'+ids+'.csv', csvData, (err) => {
		if (err) throw err;
		console.log('Los datos se han exportado correctamente a datos.csv');
	  });
	}
	
	function generateCSVResultsMatchs(data,nombreArchivo) {
  // Verificar si hay datos
  if (!data || data.length === 0) {
    console.log("No hay datos para generar el archivo CSV.");
    return;
  }

  // Obtener las claves de los encabezados del primer elemento
  const headers = Object.keys(data[0]);

  // Crear el contenido CSV
  const csvContent = data.map(obj =>
    // Mapear cada objeto a una cadena CSV
    headers.map(key => obj[key]).join(",")
  ).join("\n");

  // Crear la fila de encabezados
  const headerRow = headers.join(",") + "\n";

  // Combinar los encabezados y el contenido CSV
  const csvData = headerRow + csvContent;

  // Escribir en el archivo CSV
  fs.writeFile(`${nombreArchivo}.csv`, csvData, (err) => {
    if (err) throw err;
    console.log('Los datos se han exportado correctamente a results.csv');
  });
}

	
	// Función para generar el archivo CSV con encabezados y nombre personalizado
function generateCSVFile(data, filename) {
  // Define los encabezados del CSV
  const headers = Object.keys(data[0]); // Suponiendo que el primer elemento de 'data' contiene las claves para los encabezados
  // Crea una cadena con los encabezados separados por comas y agrega una nueva línea
  const headerRow = headers.join(",") + "\n";
  // Crea una cadena para los datos en formato CSV
  const csvContent = data.map(item => Object.values(item).join(",")).join("\n");
  // Combina los encabezados y los datos
  const csvData = headerRow + csvContent;
  // Escribe los datos en el archivo CSV con el nombre especificado
  fs.writeFile(`${filename}.csv`, csvData, (err) => {
    if (err) throw err;
    console.log(`Los datos se han exportado correctamente a ${filename}.csv`);
  });
}

function generateCsvMatchData(matchData, nombreArchivo) {
    const csvData = [
        ["nombreArchivo", "date", "homeName", "imageHome", "awayName", "imageAway", "resultsHome", "resultsAway", "totalLocal", "firstLocal", "secondLocal", "thirstLocal", "fourthLocal", "extraLocal", "totalAway", "firstAway", "secondAway", "thirstAway", "fourthAway", "extraAway"],
        [nombreArchivo, matchData["date"], matchData["home"]["name"], matchData["home"]["image"], matchData["away"]["name"], matchData["away"]["image"], matchData["result"]["home"], matchData["result"]["away"], matchData["totalLocal"], matchData["firstLocal"], matchData["secondLocal"], matchData["thirstLocal"], matchData["fourthLocal"], matchData["extraLocal"], matchData["totalAway"], matchData["firstAway"], matchData["secondAway"], matchData["thirstAway"], matchData["fourthAway"], matchData["extraAway"]]
    ];

    // Convertir los datos CSV en texto
    const csvText = csvData.map(row => row.join(',')).join('\n');

    // Escribir los datos en un archivo CSV
    fs.writeFileSync(nombreArchivo + ".csv", csvText);
}


  let allMatchIdLists = [];

  if (action==="fixtures" && ids!==null) {
    const browser = await puppeteer.launch({ headless });
    const fecha = await getDateMatch(browser,ids.toString());
    console.log("fechasPartidos - ",fecha.matchHistoryRows + "");
    console.log("teamNameLocal - ",fecha.teamNameLocal + "");
    console.log("teamNameAway - ",fecha.teamNameAway + "");
    console.log("teamLinkLocal - ",fecha.teamLinkLocal + "");
    console.log("teamLinkAway - ",fecha.teamLinkAway + "");
	console.log("generateCSV" , generateCSV);
    if (generateCSV) {
      // Lógica para generar el CSV
      console.log("Generando archivo CSV FIXTURES1...");
      generateCSVFileMatch(fecha,country,league); // Llama a la función para generar el archivo CSV con los datos de 'fecha'
    }
	
    await browser.close();
  } 

  if (action === "fixtures" && ids === null) {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
    await browser.close();

    if (generateCSV) {        
		// Lógica para generar el CSV
		console.log("Generando archivo CSV FIXTURES...");
		const fechaActual = new Date(); // Obtiene la fecha actual
		const formattedFecha = formatFecha(fechaActual);
		const nombreArchivo = `FIXTURES_${formattedFecha}_${country}_${league}`;
        generateCSVFile(combinedData, nombreArchivo);
    } else {
        console.log("[");
        console.log(allMatchIdLists.additionalContent);
        for (const combined of combinedData) {
            console.log(combined);
        }
        console.log("]");
    }

    return combinedData;
}


  if (action === "results") {
    const browser = await puppeteer.launch({ headless });
    if (ids !== null) {
		
      for (const id of ids) {
        console.log("ID", id);
		// Lógica para generar el CSV
		  const fechaActual = new Date(); // Obtiene la fecha actual
		const formattedFecha = formatFecha(fechaActual);
		const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}_${id}`;
        if (includeMatchData) {
			const matchData = await getMatchData(browser, id);
			
			if(generateCSV==true){	
			console.log("Generando archivo CSV...");			
			generateCsvMatchData(matchData,nombreArchivo+'_MATCH_DATA');		  
			}
        }
        const numberOfMatches = 4; // Puedes cambiar este valor según tus necesidades

        for (let i = 1; i <= numberOfMatches; i++) {
          if (includeStatsMatch) {
            const statsMatch = await getStatsMatch(browser, id, i);
            console.log(`StatsMatch ${i}:`, statsMatch);
			if(generateCSV==true){	
			console.log("Generando archivo CSV STATS_MATCH...");			
			generateCsvMatchData(matchData,nombreArchivo+'_STATS_MATCH_' + i);		  
			}
          }

          if (includePointByPoint) {
            const pointByPoint = await getPointByPoint(browser, id, i);
            console.log(`PointByPoint ${i}:`, pointByPoint);
          }
        }

      }	  
    } else {
      allMatchIdLists = await getMatchIdList(browser, country, league);
      // Iterate over the eventDataList array and log each 
    console.log("[season : " + allMatchIdLists.additionalContent + "]");    
	  console.log("generateCSV" , generateCSV);
		// Generar CSV si generateCSV es verdadero
		if (generateCSV==true) {
		  // Lógica para generar el CSV
		  console.log("Generando archivo CSV...");
		  const fechaActual = new Date(); // Obtiene la fecha actual
		const formattedFecha = formatFecha(fechaActual);
		const nombreArchivo = `RESULTS_${formattedFecha}_${country}_${league}`;
		  generateCSVResultsMatchs(allMatchIdLists.eventDataList,nombreArchivo);
		}
    }
	
	
	
    await browser.close();
  }
  
  // Función para formatear la fecha en formato YYYYMMDDHHMMSS
function formatFecha(fecha) {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = String(fecha.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
