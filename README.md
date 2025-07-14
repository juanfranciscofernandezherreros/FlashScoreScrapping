# 📊 Flashscore Scraper con Docker

Este proyecto permite scrapear datos deportivos desde [Flashscore](https://www.flashscore.com) utilizando una imagen Docker. Los datos extraídos se guardan automáticamente como archivos CSV en una carpeta local.

---

## 🐳 1. Construcción de la imagen Docker

Desde la raíz del proyecto (donde esté el `Dockerfile`), ejecuta:

```bash
docker build -t flashscore-ppt:v1 .
```

---

## 📁 2. Crear carpeta de salida (Windows)

Antes de ejecutar cualquier contenedor, asegúrate de tener una carpeta local donde guardar los CSV:

```
C:\output
```

> Docker montará esta carpeta en el contenedor para guardar los resultados en ella.

---

## 🚀 3. Ejecutar el scraper con Docker

### Resultados de EuroBasket U20

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  country=europe ^
  league=eurobasket-u20 ^
  action=results ^
  headless=true
```

---

### Scrapear un partido específico con estadísticas de jugadores

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  ids=g_3_Y7qHZ2Wo ^
  includeStatsPlayer=true ^
  headless=true
```

### Scrapear punto a punto de un partido

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  ids=g_3_Y7qHZ2Wo ^
  includePointByPoint=true ^
  headless=true
```

### Scrapear estadísticas del partido

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  ids=g_3_Y7qHZ2Wo ^
  includeStatsMatch=true ^
  headless=true
```

### Obtener resultados de la WNBA

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  country=usa ^
  league=wnba ^
  action=results ^
  headless=true
```
---

### Obtener partidos

```bash
docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  country=europe ^
  league=eurobasket-u20 ^
  action=fixtures ^
  headless=true
```
---

```bash

docker run --rm ^
  -v C:\output:/app/src/csv ^
  flashscore-ppt:v1 ^
  start ^
  country=spain ^
  league=acb-2011-2012 ^
  action=results ^
  headless=true

```


## 🛠 Requisitos

- Docker instalado
- Carpeta `C:\output` creada en tu máquina (o equivalente en Linux/Mac)
- Acceso a internet

---

## 💬 Notas

- Todos los archivos `.csv` se guardarán en `C:\output` o la ruta que hayas montado.
- Si estás en **Linux/Mac/WSL**, cambia el volumen a:

```bash
-v $(pwd)/output:/app/src/csv
```

---

## 📦 Licencia

Este scraper es solo para fines educativos y personales. No está afiliado a Flashscore y debe usarse con responsabilidad.