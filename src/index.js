import puppeteer from "puppeteer";
import fs from "fs";

import {
  getMatchIdList,
  getFixtures,
  getMatchData,
  getStatsPlayer,
  getStatsMatch,
  getPointByPoint,
  getDateMatch
} from "./utils/index.js";

(async () => {
  let country = null;
  let league = null;
  let headless = false;
  let action = "results";
  let ids = null;
  let includeMatchData = true; // Default value is true
  let includeStatsPlayer = true; // Default value is true
  let includeStatsMatch = true; // Default value is true
  let includePointByPoint = true; // Default value is true
  let generateCSV = false; // Nuevo argumento para generar CSV

  process.argv?.slice(2)?.map(arg => {
    if (arg.includes("country="))
      country = arg.split("country=")?.[1] ?? country;
    if (arg.includes("league="))
      league = arg.split("league=")?.[1] ?? league;
    if (arg.includes("headless"))
      headless = true;
    if (arg.includes("path="))
      path = arg.split("path=")?.[1] ?? path;
    if (arg.includes("action="))
      action = arg.split("action=")?.[1] ?? action;
    if (arg.includes("ids="))
      ids = arg.split("ids=")?.[1]?.split(",") ?? ids;
    if (arg.includes("includeMatchData="))
      includeMatchData = arg.split("includeMatchData=")?.[1]?.toLowerCase() === "true";
    if (arg.includes("includeStatsPlayer="))
      includeStatsPlayer = arg.split("includeStatsPlayer=")?.[1]?.toLowerCase() === "true";
    if (arg.includes("includeStatsMatch="))
      includeStatsMatch = arg.split("includeStatsMatch=")?.[1]?.toLowerCase() === "true";
    if (arg.includes("includePointByPoint="))
      includePointByPoint = arg.split("includePointByPoint=")?.[1]?.toLowerCase() === "true"
	if (arg.includes("generateCSV="))
      generateCSV = arg.split("generateCSV=")?.[1]?.toLowerCase() === "true";
  });

  // Función para generar el archivo CSV
  // Función para generar el archivo CSV con encabezados
	function generateCSVFileMatch(data) {
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
	
	function generateCSVResultsMatchs(data) {
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
  fs.writeFile('results.csv', csvData, (err) => {
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
	// Generar CSV si generateCSV es verdadero
    if (generateCSV) {
      // Lógica para generar el CSV
      console.log("Generando archivo CSV...");
      generateCSVFileMatch(fecha); // Llama a la función para generar el archivo CSV con los datos de 'fecha'
    }
	
    await browser.close();
  } 

  if (action === "fixtures" && ids === null) {
    const browser = await puppeteer.launch({ headless });
    const combinedData = await getFixtures(browser, country, league);
    await browser.close();

    if (generateCSV) {
        // Lógica para generar el CSV
        console.log("Generando archivo CSV...");
        generateCSVFile(combinedData, "fixtures");
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
        if (includeMatchData) {
          const matchData = await getMatchData(browser, id);
          console.log("Match Data:", matchData);
        }
        const numberOfMatches = 4; // Puedes cambiar este valor según tus necesidades

        for (let i = 1; i <= numberOfMatches; i++) {
          if (includeStatsMatch) {
            const statsMatch = await getStatsMatch(browser, id, i);
            console.log(`StatsMatch ${i}:`, statsMatch);
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
      allMatchIdLists.eventDataList.forEach((eventData) => {
        console.log("matchId - " + eventData["matchId"]);
        console.log("matchEvent - " + eventData["eventTime"]);
      });
	  console.log("generateCSV" , generateCSV);
		// Generar CSV si generateCSV es verdadero
		if (generateCSV) {
		  // Lógica para generar el CSV
		  console.log("Generando archivo CSV...");
		  generateCSVResultsMatchs(allMatchIdLists.eventDataList);
		}
    }
	
	
	
    await browser.close();
  }
})();
