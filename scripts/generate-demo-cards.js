const { createClient } = require('@supabase/supabase-js');

// Supabase connection - using SERVICE ROLE KEY to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Russian names data
const firstNames = [
  'Александр', 'Дмитрий', 'Максим', 'Сергей', 'Андрей', 'Алексей', 'Артём', 'Илья', 'Кирилл', 'Михаил',
  'Иван', 'Роман', 'Егор', 'Арсений', 'Никита', 'Матвей', 'Даниил', 'Владимир', 'Тимофей', 'Глеб',
  'Константин', 'Степан', 'Владислав', 'Павел', 'Николай', 'Денис', 'Евгений', 'Олег', 'Виктор', 'Антон'
];

const lastNames = [
  'Иванов', 'Смирнов', 'Кузнецов', 'Попов', 'Васильев', 'Петров', 'Соколов', 'Михайлов', 'Новиков', 'Фёдоров',
  'Морозов', 'Волков', 'Алексеев', 'Лебедев', 'Семёнов', 'Егоров', 'Павлов', 'Козлов', 'Степанов', 'Николаев',
  'Орлов', 'Андреев', 'Макаров', 'Никитин', 'Захаров', 'Зайцев', 'Соловьёв', 'Борисов', 'Яковлев', 'Григорьев'
];

const middleNames = [
  'Александрович', 'Дмитриевич', 'Максимович', 'Сергеевич', 'Андреевич', 'Алексеевич', 'Артёмович', 'Ильич', 'Кириллович', 'Михайлович',
  'Иванович', 'Романович', 'Егорович', 'Арсеньевич', 'Никитич', 'Матвеевич', 'Даниилович', 'Владимирович', 'Тимофеевич', 'Глебович'
];

const ranks = [
  'Рядовой', 'Ефрейтор', 'Младший сержант', 'Сержант', 'Старший сержант',
  'Старшина', 'Прапорщик', 'Младший лейтенант', 'Лейтенант', 'Старший лейтенант',
  'Капитан', 'Майор', 'Подполковник', 'Полковник'
];

const militaryUnits = [
  '1-я гвардейская танковая армия',
  '58-я общевойсковая армия',
  '2-я гвардейская общевойсковая армия',
  '41-я общевойсковая армия',
  '8-я гвардейская общевойсковая армия',
  '20-я гвардейская общевойсковая армия',
  'Морская пехота',
  'ВДВ',
  'Спецназ ГРУ',
  'Разведка',
  'Артиллерия',
  'Инженерные войска'
];

const hometowns = [
  'Кавалерово', 'Москва', 'Санкт-Петербург', 'Владивосток', 'Находка', 'Уссурийск',
  'Хабаровск', 'Благовещенск', 'Комсомольск-на-Амуре', 'Петропавловск-Камчатский',
  'Южно-Сахалинск', 'Магадан', 'Анадырь', 'Якутск', 'Чита', 'Улан-Удэ',
  'Иркутск', 'Красноярск', 'Новосибирск', 'Омск', 'Томск', 'Кемерово',
  'Барнаул', 'Екатеринбург', 'Челябинск', 'Тюмень', 'Курган', 'Оренбург'
];

const serviceTypes = ['mobilized', 'volunteer', 'pmc', 'professional'];

const memorialTexts = [
  'Герой, который отдал свою жизнь за Родину. Его подвиг навсегда останется в наших сердцах. Он был настоящим патриотом, верным долгу и своим товарищам. Мы помним, мы гордимся, мы чтим его память.',
  'Настоящий защитник Отечества, который не раздумывая встал на защиту своей страны. Его мужество и отвага служат примером для всех нас. Светлая память герою, который отдал самое ценное — свою жизнь за наше мирное будущее.',
  'Ты навсегда останешься в наших сердцах как символ чести, доблести и верности. Твой героический путь — это пример самоотверженности и любви к Родине. Мы будем хранить память о тебе и передадим её будущим поколениям.',
  'Отважный воин, который до конца был верен своему долгу и присяге. Его подвиг никогда не будет забыт. Он защищал не только территорию, но и наши жизни, наше будущее, наших детей. Вечная слава и благодарность.',
  'Твой подвиг навсегда останется в истории. Ты отдал жизнь, защищая тех, кто слабее, и обеспечивая мир для своей семьи и страны. Спасибо за твою службу, за твоё мужество, за мирное небо над нашими головами. Вечная память.',
  'Погиб при исполнении воинского долга, защищая мир и свободу своей страны. Его героизм и самоотверженность — это образец для всех поколений. Мы помним твой подвиг и гордимся тем, что ты был с нами. Светлая память герою.',
  'Герой нашего времени, который не струсил перед лицом опасности и выполнил свой долг до конца. Его имя навсегда вписано в историю. Мы благодарны за его службу и никогда не забудем его жертву. Вечная память и слава.',
  'Ты всегда будешь для нас примером настоящего мужества, чести и преданности. Твоя служба — это подвиг, который мы чтим и помним. Ты защищал не только границы, но и наши семьи, наш дом, нашу Родину. Спасибо тебе, герой.',
  'Светлая память защитнику Отечества, который отдал свою жизнь за нас. Мы скорбим о потере и в то же время гордимся таким героем. Твоё имя навсегда останется в наших сердцах как символ доблести и чести. Вечная память.',
  'Твоя служба — это пример для всех нас. Ты показал, что значит быть настоящим патриотом и защитником. Твой подвиг будет жить в веках, а память о тебе мы передадим нашим детям и внукам. Вечная слава и благодарность герою.'
];

// Generate random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Generate random hero
function generateHero(index) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];

  const birthYear = 1985 + Math.floor(Math.random() * 15); // 1985-1999
  const birthDate = randomDate(new Date(birthYear, 0, 1), new Date(birthYear, 11, 31));

  const deathYear = 2022 + Math.floor(Math.random() * 3); // 2022-2024
  const deathDate = randomDate(new Date(deathYear, 0, 1), new Date(deathYear, 11, 31));

  const serviceStartYear = birthYear + 18 + Math.floor(Math.random() * 5);
  const serviceStartDate = randomDate(new Date(serviceStartYear, 0, 1), new Date(serviceStartYear, 11, 31));

  return {
    first_name: firstName,
    last_name: lastName,
    middle_name: middleName,
    birth_date: formatDate(birthDate),
    death_date: formatDate(deathDate),
    rank: ranks[Math.floor(Math.random() * ranks.length)],
    military_unit: militaryUnits[Math.floor(Math.random() * militaryUnits.length)],
    hometown: hometowns[Math.floor(Math.random() * hometowns.length)],
    burial_location: hometowns[Math.floor(Math.random() * hometowns.length)],
    service_type: serviceTypes[Math.floor(Math.random() * serviceTypes.length)],
    service_start_date: formatDate(serviceStartDate),
    memorial_text: memorialTexts[Math.floor(Math.random() * memorialTexts.length)],
    biography_md: `**${firstName} ${middleName} ${lastName}** родился ${formatDate(birthDate)} в городе ${hometowns[Math.floor(Math.random() * hometowns.length)]}.\n\nС детства проявлял интерес к военному делу. После окончания школы поступил на военную службу. Служил честно и достойно, был примером для товарищей.\n\nПогиб при исполнении воинского долга ${formatDate(deathDate)}. Посмертно представлен к государственной награде.\n\nОставил после себя светлую память в сердцах родных, друзей и сослуживцев.`,
    status: 'approved',
    is_demo: true,
    is_deleted: false,
    owner_id: '00000000-0000-0000-0000-000000000001' // Demo user ID
  };
}

async function main() {
  console.log('🚀 Starting demo cards generation...\n');

  // Check if demo user exists
  const { data: demoUser, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (userError || !demoUser) {
    console.log('⚠️  Demo user not found. Creating...');
    const { error: createUserError } = await supabase
      .from('users')
      .insert({
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'Demo User',
        phone: '+79000000000',
        role: 'user',
        is_deleted: false
      });

    if (createUserError) {
      console.error('❌ Failed to create demo user:', createUserError);
      return;
    }
    console.log('✅ Demo user created\n');
  } else {
    console.log('✅ Demo user exists\n');
  }

  // Generate 80 demo heroes
  const heroes = [];
  for (let i = 0; i < 80; i++) {
    heroes.push(generateHero(i));
  }

  console.log(`📝 Generated ${heroes.length} demo heroes\n`);

  // Insert in batches of 10
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < heroes.length; i += batchSize) {
    const batch = heroes.slice(i, i + batchSize);
    const { data, error } = await supabase
      .from('fallen')
      .insert(batch)
      .select();

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
      errorCount += batch.length;
    } else {
      successCount += batch.length;
      console.log(`✅ Inserted batch ${i / batchSize + 1} (${batch.length} heroes)`);
    }
  }

  console.log(`\n🎉 Done!`);
  console.log(`✅ Successfully inserted: ${successCount} heroes`);
  if (errorCount > 0) {
    console.log(`❌ Failed to insert: ${errorCount} heroes`);
  }
}

main().catch(console.error);
