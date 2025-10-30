#!/usr/bin/env node

/**
 * Скрипт обновления справочника населенных пунктов из GeoNames
 *
 * GeoNames - бесплатная географическая база данных
 * Лицензия: Creative Commons Attribution 4.0
 *
 * Использование:
 *   node scripts/update-settlements.js
 *
 * Источники данных:
 *   - http://download.geonames.org/export/dump/RU.zip (Россия)
 *   - http://download.geonames.org/export/dump/UA.zip (Украина)
 */

require('dotenv').config();

const https = require('https');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const unzipper = require('unzipper');
const readline = require('readline');

// Настройки
const GEONAMES_BASE_URL = 'http://download.geonames.org/export/dump/';
const COUNTRIES = ['RU', 'UA'];
const TEMP_DIR = path.join(__dirname, '../.temp-geonames');
const BATCH_SIZE = 500; // Размер пакета для вставки

// Supabase клиент
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ Ошибка: не найден SUPABASE_SERVICE_ROLE_KEY или NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Типы населенных пунктов для фильтрации (только города, посёлки, деревни)
const VALID_FEATURE_CODES = [
  'PPL',    // populated place (город, населенный пункт)
  'PPLA',   // seat of a first-order administrative division (центр региона)
  'PPLA2',  // seat of a second-order administrative division (центр района)
  'PPLA3',  // seat of a third-order administrative division
  'PPLA4',  // seat of a fourth-order administrative division
  'PPLC',   // capital of a political entity (столица)
  'PPLG',   // seat of government of a political entity
  'PPLL',   // populated locality (поселение)
  'PPLR',   // religious populated place
  'PPLS',   // populated places (города множественного значения)
  'PPLX',   // section of populated place (район города)
];

// Создание временной директории
function ensureTempDir() {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

// Скачивание файла
async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Скачивание ${url}...`);
    const file = fs.createWriteStream(destination);

    https.get(url.replace('http://', 'https://'), (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Редирект
        return downloadFile(response.headers.location, destination).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Ошибка скачивания: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Скачано: ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlinkSync(destination);
      reject(err);
    });
  });
}

// Распаковка ZIP архива
async function extractZip(zipPath, extractTo) {
  return new Promise((resolve, reject) => {
    console.log(`📦 Распаковка ${zipPath}...`);

    fs.createReadStream(zipPath)
      .pipe(unzipper.Extract({ path: extractTo }))
      .on('close', () => {
        console.log(`✅ Распаковано в: ${extractTo}`);
        resolve();
      })
      .on('error', reject);
  });
}

// Парсинг строки TSV файла GeoNames
function parseGeoNamesLine(line) {
  const parts = line.split('\t');

  return {
    geonameid: parseInt(parts[0]),
    name: parts[1],
    asciiname: parts[2],
    alternatenames: parts[3] ? parts[3].split(',') : [],
    latitude: parseFloat(parts[4]),
    longitude: parseFloat(parts[5]),
    feature_class: parts[6],
    feature_code: parts[7],
    country_code: parts[8],
    admin1: parts[10], // Регион
    admin2: parts[11], // Район
    population: parseInt(parts[14]) || 0,
  };
}

// Обработка файла с населенными пунктами
async function processSettlementsFile(filePath, countryCode) {
  return new Promise((resolve, reject) => {
    console.log(`📖 Обработка файла ${filePath} (${countryCode})...`);

    const settlements = [];
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineCount = 0;
    let validCount = 0;

    rl.on('line', (line) => {
      lineCount++;

      try {
        const data = parseGeoNamesLine(line);

        // Фильтрация: только нужные типы населенных пунктов
        if (data.feature_class === 'P' && VALID_FEATURE_CODES.includes(data.feature_code)) {
          // Определяем русское название
          const nameRu = data.alternatenames.find(name => /[а-яА-ЯёЁ]/.test(name)) || data.name;

          settlements.push({
            geonameid: data.geonameid,
            name: data.name,
            name_ru: nameRu,
            name_alt: data.alternatenames.filter((n, i) => i < 10), // Ограничиваем альтернативные названия
            country_code: data.country_code,
            region: data.admin1,
            district: data.admin2,
            feature_code: data.feature_code,
            feature_class: data.feature_class,
            population: data.population,
            latitude: data.latitude,
            longitude: data.longitude,
          });

          validCount++;
        }
      } catch (err) {
        console.warn(`⚠️ Ошибка парсинга строки ${lineCount}: ${err.message}`);
      }
    });

    rl.on('close', () => {
      console.log(`✅ Обработано ${lineCount} строк, найдено ${validCount} населенных пунктов`);
      resolve(settlements);
    });

    rl.on('error', reject);
  });
}

// Вставка данных в БД батчами
async function insertSettlements(settlements) {
  console.log(`💾 Вставка ${settlements.length} записей в БД...`);

  let inserted = 0;

  for (let i = 0; i < settlements.length; i += BATCH_SIZE) {
    const batch = settlements.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('settlements')
      .upsert(batch, { onConflict: 'geonameid' });

    if (error) {
      console.error(`❌ Ошибка вставки батча ${i}-${i + batch.length}:`, error);
    } else {
      inserted += batch.length;
      console.log(`✅ Вставлено ${inserted} / ${settlements.length}`);
    }
  }

  return inserted;
}

// Очистка старых данных
async function cleanOldData(countryCode) {
  console.log(`🗑️ Удаление старых данных для ${countryCode}...`);

  const { error } = await supabase
    .from('settlements')
    .delete()
    .eq('country_code', countryCode);

  if (error) {
    console.error(`❌ Ошибка удаления:`, error);
  } else {
    console.log(`✅ Старые данные удалены`);
  }
}

// Главная функция
async function main() {
  console.log('🌍 Обновление справочника населенных пунктов из GeoNames\n');

  try {
    ensureTempDir();

    for (const countryCode of COUNTRIES) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📍 Обработка ${countryCode === 'RU' ? 'России' : 'Украины'} (${countryCode})`);
      console.log('='.repeat(60));

      const zipUrl = `${GEONAMES_BASE_URL}${countryCode}.zip`;
      const zipPath = path.join(TEMP_DIR, `${countryCode}.zip`);
      const extractPath = path.join(TEMP_DIR, countryCode);
      const dataFile = path.join(extractPath, `${countryCode}.txt`);

      // Скачивание
      await downloadFile(zipUrl, zipPath);

      // Распаковка
      await extractZip(zipPath, extractPath);

      // Обработка
      const settlements = await processSettlementsFile(dataFile, countryCode);

      // Очистка старых данных
      await cleanOldData(countryCode);

      // Вставка новых данных
      const inserted = await insertSettlements(settlements);

      console.log(`\n✅ ${countryCode}: обработано ${inserted} населенных пунктов`);
    }

    // Очистка временных файлов
    console.log(`\n🗑️ Очистка временных файлов...`);
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });

    console.log('\n✅ Обновление справочника завершено успешно!');

  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  }
}

// Запуск
main();
