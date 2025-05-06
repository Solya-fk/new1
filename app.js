const fs = require('fs').promises;
const axios = require('axios');
const readline = require('readline');


async function loadConfig(filename) {
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Помилка при читанні файлу ${filename}:`, error.message);
    

    if (error.code === 'ENOENT') {
      const defaultConfig = { api_key: 'not_required_for_this_api' };
      await fs.writeFile(filename, JSON.stringify(defaultConfig, null, 2));
      console.log(`Створено базовий файл конфігурації ${filename}`);
      return defaultConfig;
    }
    throw error;
  }
}

async function getDataFromApi(endpoint, params = {}) {
  try {
    const response = await axios.get(endpoint, { params });
    
    if (response.status === 200) {
      return response.data;
    } else {
      console.error(`Помилка API: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error('Помилка запиту API:', error.message);
    return null;
  }
}

// Функція для отримання введення користувача
function getUserInput(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}


async function main() {
  try {
   
    const config = await loadConfig('config.json');
    console.log('Конфігурацію завантажено');

    console.log('\nДоступні опції для JSONPlaceholder API:');
    console.log('1. Отримати список постів');
    console.log('2. Отримати список користувачів');
    console.log('3. Отримати список альбомів');
    console.log('4. Отримати коментарі до посту');
    console.log('5. Отримати завдання (todos) для користувача');
    
    const option = await getUserInput('\nОберіть опцію (1-5): ');
    
    let apiUrl = '';
    let params = {};
    let data = null;
    
    switch (option) {
      case '1':
      
        apiUrl = 'https://jsonplaceholder.typicode.com/posts';
        data = await getDataFromApi(apiUrl);
        break;
        
      case '2':
        // Отримати список користувачів
        apiUrl = 'https://jsonplaceholder.typicode.com/users';
        data = await getDataFromApi(apiUrl);
        break;
        
      case '3':
        // Отримати список альбомів
        apiUrl = 'https://jsonplaceholder.typicode.com/albums';
        data = await getDataFromApi(apiUrl);
        break;
        
      case '4':
        // Отримати коментарі до посту
        const postId = await getUserInput('Введіть ID посту (1-100): ');
        apiUrl = `https://jsonplaceholder.typicode.com/posts/${postId}/comments`;
        data = await getDataFromApi(apiUrl);
        break;
        
      case '5':
        // Отримати завдання для користувача
        const userId = await getUserInput('Введіть ID користувача (1-10): ');
        apiUrl = 'https://jsonplaceholder.typicode.com/todos';
        params = { userId };
        data = await getDataFromApi(apiUrl, params);
        break;
        
      default:
        console.log('Невірна опція. Вихід з програми.');
        return;
    }
    
    // Обробка отриманих даних
    if (data) {
      console.log('\nРезультати:');
      
      if (option === '1') {
        // Виведення списку постів
        console.log(`Всього отримано постів: ${data.length}`);
        data.slice(0, 5).forEach((post, index) => {
          console.log(`\n${index + 1}. ${post.title}`);
          console.log(`   Автор: User ${post.userId}`);
          console.log(`   ${post.body.substring(0, 100)}...`);
        });
        
        if (data.length > 5) {
          console.log(`\n... і ще ${data.length - 5} постів`);
        }
      } 
      else if (option === '2') {
        // Виведення списку користувачів
        console.log(`Всього отримано користувачів: ${data.length}`);
        data.slice(0, 5).forEach((user, index) => {
          console.log(`\n${index + 1}. ${user.name} (@${user.username})`);
          console.log(`   Email: ${user.email}`);
          console.log(`   Компанія: ${user.company.name}`);
          console.log(`   Веб-сайт: ${user.website}`);
        });
      } 
      else if (option === '3') {
        // Виведення списку альбомів
        console.log(`Всього отримано альбомів: ${data.length}`);
        data.slice(0, 5).forEach((album, index) => {
          console.log(`${index + 1}. ${album.title} (Користувач ${album.userId})`);
        });
        
        if (data.length > 5) {
          console.log(`\n... і ще ${data.length - 5} альбомів`);
        }
      }
      else if (option === '4') {
        // Виведення коментарів до посту
        console.log(`Коментарі до посту #${data[0]?.postId || 'N/A'}:`);
        data.forEach((comment, index) => {
          console.log(`\n${index + 1}. Від: ${comment.name} (${comment.email})`);
          console.log(`   ${comment.body.substring(0, 100)}...`);
        });
      }
      else if (option === '5') {
        // Виведення завдань користувача
        console.log(`Завдання користувача #${params.userId}:`);
        data.forEach((todo, index) => {
          console.log(`${index + 1}. [${todo.completed ? 'X' : ' '}] ${todo.title}`);
        });
      }
      
      // Збереження повної відповіді у файл
      await fs.writeFile('output.json', JSON.stringify(data, null, 2));
      console.log('\nПовну відповідь збережено у файл output.json');
    }
  } catch (error) {
    console.error('Помилка в роботі програми:', error.message);
  }
}

// Запуск програми
main();