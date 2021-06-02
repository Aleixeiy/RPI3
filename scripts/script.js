const key = '6be5bbf993698f81eeed003ba70b740e'; // ключ для получения погоды
const belTimezone = 10800; // смещение по UTC в секундах
const MILLISECONDS_IN_DAY = 86400000;

let currBg; // текущий номер заставки
let currentWeather; // погода в настоящий момент
let celsius = true;
let lang;

function language_click()
{
	if (lang === 'ru') lang = 'en'; else
	lang = 'ru';
	localStorage.setItem('lang', lang);
	changeWeather();
	changeForecast();
}

function celsius_click()
{
    celsius = true;
	localStorage.setItem('celsius', true);
    document.getElementsByClassName('celsius')[0].className = "celsius active_temp";
    document.getElementsByClassName('fahrenheit')[0].className = "fahrenheit";
    changeWeather();
    changeForecast();
}

function fahrenheit_click()
{
    celsius = false;
	localStorage.setItem('celsius', false);
    document.getElementsByClassName('fahrenheit')[0].className = "fahrenheit active_temp";
    document.getElementsByClassName('celsius')[0].className = "celsius";
    changeWeather();
    changeForecast();
}

function ucFirst(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function search(event)
{
	if (event.keyCode === 13) {
		document.getElementById('search').click();
	}
}

function addZero(str) {
	if (String(str).length == 1) return '0' + str;
	return str;
}

async function init() {
	if (localStorage.getItem('lang') === 'ru') lang = 'ru';
	else lang = 'en';

	localStorage.setItem('city', 'Минск');
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(
		  (position) => {
			changeMap(position.coords.longitude, position.coords.latitude);
		  }
		);
	  } else {
		// Browser doesn't support Geolocation
		handleLocationError(false, infoWindow, map.getCenter());
	}

	if (localStorage.getItem('celsius') === 'true') celsius_click(); else
										 fahrenheit_click();
										
	// установка начальной картинки
	currBg = Math.round(Math.random() * 19) + 1;
	document.getElementById('body').style.backgroundImage = 'url(pics/day/' + currBg + '.jpg)';
	
	// срабатывание поиска при нажатии на Enter
	document.getElementById('request').addEventListener('keyup', search, false);
	
	changeWeather();
}

async function showTime(timezone) {
	let today = new Date();
	today.setTime(today.getTime() - 10800 * 1000 + timezone * 1000);
	
	if (currentWeather.timezone !== timezone) return;
	
	let dayOfTheWeek = (n) => {
		switch (n) {
			case 0: return lang === 'ru' ? 'Воскресенье' : 'Sunday';
			case 1: return lang === 'ru' ? 'Понедельник' : 'Monday';
			case 2: return lang === 'ru' ?'Вторник' : 'Tuesday';
			case 3: return lang === 'ru' ?'Среда' : 'Wednesday';
			case 4: return lang === 'ru' ?'Четверг' : 'Thursday';
			case 5: return lang === 'ru' ?'Пятница' : 'Friday';
			case 6: return lang === 'ru' ?'Суббота' : 'Saturday';
		}
	}
	
	let month = (n) => {
		switch (n) {
			case 0: return lang === 'ru' ? 'Январь' : 'January';
			case 1: return lang === 'ru' ? 'Февраль' : 'February';
			case 2: return lang === 'ru' ? 'Март' : 'March';
			case 3: return lang === 'ru' ?'Апрель' : 'April';
			case 4: return lang === 'ru' ? 'Май' : 'May';
			case 5: return lang === 'ru' ? 'Июнь' : 'June';
			case 6: return  lang === 'ru' ? 'Июль' : 'July';
			case 7: return lang === 'ru' ? 'Август' : 'August';
			case 8: return lang === 'ru' ? 'Сентябрь' : 'September';
			case 9: return lang === 'ru' ? 'Октябрь' : 'October';
			case 10: return lang === 'ru' ? 'Ноябрь' : 'November';
			case 11: return lang === 'ru' ? 'Декабрь' : 'December';
		}
	}
	
	document.getElementById('dateAndTime').textContent = dayOfTheWeek(today.getDay()) + ', ' +
							 addZero(today.getDate()) + ' ' +
							 month(today.getMonth()) + ' ' + 
                             addZero(today.getHours()) + ':' +
							 addZero(today.getMinutes()) + ':' +
							 addZero(today.getSeconds());

	document.getElementById('day1').textContent = dayOfTheWeek((today.getDay() + 1) % 7);
	document.getElementById('day2').textContent = dayOfTheWeek((today.getDay() + 2) % 7);
	document.getElementById('day3').textContent = dayOfTheWeek((today.getDay() + 3) % 7);
	
	setTimeout(showTime, 1000, timezone);
}

async function changeImage() { // изменение картинок
	currBg++;
	if (currBg >= 21) currBg = 1;
	document.getElementById('body').style.backgroundImage = 'url(pics/day/' + currBg + '.jpg)';
}

async function changeColor() { // изменение цвета текста
	if (document.getElementById('body').style.color === 'rgb(255, 255, 255)') {
		document.getElementById('body').style.color = 'rgb(0, 0, 0)';
	} else {
		document.getElementById('body').style.color = 'rgb(255, 255, 255)';
	}
}

async function fetchData(url) {
    let response = await fetch(url);
    if (response.status !== 200) {
        throw new Error('Не получилось получить данные о погоде.');
    }
    response = await response.json();
    return response;
}

async function getCountry(cut) {
    let regionNames = new Intl.DisplayNames([lang], {type: 'region'});
    return regionNames.of(cut);
}

async function changeWeather() {
	let city = 'Минск'; // интересуемый город
	let requestText = document.getElementById('request').value;
	if (requestText !== '') city = requestText; else
	if (localStorage.getItem('city') !== null) city = localStorage.getItem('city');
	localStorage.setItem('city', city);

        let units = celsius ? 'metric' : 'imperial';
	let currentURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&lang=' + lang + '&appid=' + key + '&units=' + units;
	try {
        currentWeather = await fetchData(currentURL);
    } catch (e) {
        alert(e);
        return;
    }
	
	showTime(currentWeather.timezone);
	document.getElementById('place').textContent = currentWeather.name + ', ' + await getCountry(currentWeather.sys.country);
	document.getElementById('tempriture').textContent = Math.round(currentWeather.main.temp) + '°';
    document.getElementById('cload').textContent = ucFirst(currentWeather.weather[0].description);
	document.getElementById('feelAs').textContent = (lang === 'ru' ? 'Чувствуется как ' : 'Feels like ') + Math.round(currentWeather.main.feels_like) + '°';
	document.getElementById('wind').textContent = (lang === 'ru' ? 'Ветер: ' : 'Wind ') + Math.round(currentWeather.wind.speed) + (lang === 'ru' ?  ' м/c' : ' m/s');
	document.getElementById('humidity').textContent = (lang === 'ru' ? 'Влажность: ' : 'Humidity ') + currentWeather.main.humidity + ' %';
	let pic = "pics/weather/" + currentWeather.weather[0].main.toLowerCase() + ".svg"
    document.getElementById('weatherPic').setAttribute("src", pic);
	
	changeForecast();
        changeMap(currentWeather.coord.lon, currentWeather.coord.lat);
}

async function changeForecast() {
	let city = localStorage.getItem('city');

        let units = celsius ? 'metric' : 'imperial';
	let forecastURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + city + '&lang=' + lang + '&appid=' + key + '&units=' + units;
	try {
        forecastWeather = await fetchData(forecastURL);
    } catch (e) {
        alert(e);
        return;
    }
	
	let findDay = (time) => {
		// 2021-05-07 18:00:00
		let date = new Date(time);
		let str_date = 1900 + date.getYear() + '-' + addZero((date.getMonth() + 1) % 12) + '-' + addZero(date.getDate()) + ' 15:00:00';
		let elem;
		for (let el of forecastWeather.list) {
			if (el.dt_txt === str_date) {
				elem = el;
				break;
			}
		}
		return elem;
	}
	
	document.getElementById('tempritureDay1').textContent = Math.round(findDay(Date.now() + MILLISECONDS_IN_DAY).main.temp) + '°';
	document.getElementById('tempritureDay2').textContent = Math.round(findDay(Date.now() + 2 * MILLISECONDS_IN_DAY).main.temp) + '°';
	document.getElementById('tempritureDay3').textContent = Math.round(findDay(Date.now() + 3 * MILLISECONDS_IN_DAY).main.temp) + '°';
    
	document.getElementById('weatherPicDay1').setAttribute("src", "pics/weather/" + findDay(Date.now() + MILLISECONDS_IN_DAY).weather[0].main.toLowerCase() + ".svg");
	document.getElementById('weatherPicDay2').setAttribute("src", "pics/weather/" + findDay(Date.now() + 2 * MILLISECONDS_IN_DAY).weather[0].main.toLowerCase() + ".svg");
	document.getElementById('weatherPicDay3').setAttribute("src", "pics/weather/" + findDay(Date.now() + 3 * MILLISECONDS_IN_DAY).weather[0].main.toLowerCase() + ".svg");
	document.getElementById('request').value = '';
}

let map = null;
let marker = null


async function changeMap(lon, lat)
{
  const position = [lat, lon];
  if (map === null) map = await L.map('map').setView(position, 15);
  else await map.setView(position, 15);

  // что-то типа рекламы
  // без этого карта работать не будет
  await L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)

  if (marker)
      await map.removeLayer(marker);
  // добавляем маркер с сообщением
  marker = await L.marker(position).addTo(map);
  

  let latS = lang === 'ru' ? 'Широта: ' : 'lattitude: ';
  let lonS = lang === 'ru' ? 'Долгота: ' : 'longitude: ';
  document.getElementById('lat').textContent = latS + lat;
  document.getElementById('lon').textContent = lonS + lon;
}

var recognizer = null;

function recognize()
{
	if (recognizer !== null) {
		document.getElementById('micro').className = 'micro';
		recognizer.stop();
		recognizer = null;
		return;
	}

    // Создаем распознаватель
    recognizer = new webkitSpeechRecognition();

    // Ставим опцию, чтобы распознавание началось ещё до того, как пользователь закончит говорить
    recognizer.interimResults = true;

    // Какой язык будем распознавать?
    recognizer.lang = 'ru-Ru';

    // Используем колбек для обработки результатов
    recognizer.onresult = function (event) {
      var result = event.results[event.resultIndex];
      document.getElementById('request').value = result[0].transcript;
      if (result.isFinal) {
        document.getElementById('search').click();
		document.getElementById('micro').className = 'micro';
		recognizer = null;
      }
    };

    // Начинаем слушать микрофон и распознавать голос
    recognizer.start();
	document.getElementById('micro').className = 'micro_active';
}