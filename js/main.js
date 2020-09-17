'use strict';

// объявление переменных
const
	pagination = document.querySelector('.pagination'), // навигация по страницам
	modalСontent = document.querySelector('.modal__content'), // блок с описанием в мод. окне
	posterWrapper = document.querySelector('.poster__wrapper'), // изображение в мод. окне
	tvShowsHead = document.querySelector('.tv-shows__head'), // Заголовок Результат поиска
	preloader = document.querySelector('.preloader'), // preloader
	searchForm = document.querySelector('.search__form'), // форма поиска
	searchFormInput = document.querySelector('.search__form-input'), // поле поиска
	SERVER = 'https://api.themoviedb.org/3', // сервер сериалов
	API_KEY = 24%5 + 'e61d32c7f8095da04f6550d8cc3dd9' + 24%5, // api ключ
	modalTitle = document.querySelector('.modal__title'), // название фильма в мод. окне
	genresList = document.querySelector('.genres-list'), // блок жанр в мод. окне
	rating = document.querySelector('.rating'), // рейтинг в мод.окне
	description = document.querySelector('.description'), // описание фильма в мод. окне
	modalLink = document.querySelector('.modal__link'), // ссылка в мод. окне
	tvCardImg = document.querySelector('.tv-card__img'), // изображение в мод. окне
	tvShows = document.querySelector('.tv-shows'), // блок с карточками
	IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2',
	modal = document.querySelector('.modal'), // модальное окно
	tvShowList = document.querySelector('.tv-shows__list'), // список всех карточек
	dropdown = document.querySelectorAll('.dropdown'), // выпадающие пукты меню
	hamburger = document.querySelector('.hamburger'), // иконка гамбургер
	leftMenu = document.querySelector('.left-menu'); // левая полоска меню

const loading = document.createElement('div'); // создаем элемент - прелоадер
loading.className = 'loading'; // добавляем ему класс

// ассинхронное получение данных из БД
class DBService {
	getData = async (url) => { // принимаем путь до БД. async перед функцией гарантирует, что эта функция в любом случае вернёт промис (обещание).
		const res = await fetch(url); // ожидаем ответ от сервера БД и сохраняем в res, await, можно использовать только внутри async-функций.
		if (!res.ok) { // если статус ответа false
			throw new Error(`Ошибка по адресу ${url}, статус ошибки ${res.status}!`) // throw сбрасываем ошибку, сбрасываем выполнение кода, создаем ее описание
		}
		return await res.json(); // дождемся когда выполнится метод json() и вернем результат
	}
	getTestData = () => this.getData('test.json'); // метод получения данных из локальной БД (без API)
	getTestCard = () => this.getData('card.json'); // метод получения данных из локальной БД (без API)
	getSearchResult = query => { // метод доступа к серверу сериалов по api
		this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`;
		return this.getData(this.temp);
	};
	getPage = page => this.getData(this.temp + '&page=' + page); // метод получения следующей страницы
	getTvShow = id => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`); // метод получения данных сериала по id
	getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`); // метод получения топ сериалов
	getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`); // метод получения популярных сериалов
	getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`); // метод получения сериалов актуальных сегодня
	getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`); // метод получения сериалов актуальных неделю
}

const dbService = new DBService(); // обращение к классу присваиваем в dbService

// Рендер карточек
const renderCard = (response, target) => {
	console.log(response);
	if (response.results.length) { // если результат пришел
		tvShowList.textContent =  ''; // очищаем блок карточек
		tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:'; // вставляем заголовок вывода
		response.results.forEach( ({ backdrop_path: backdrop, name: title, poster_path: poster, vote_average: vote, id }) => { // деструктурируем данные
			const posterImg = poster ? IMG_URL + poster : './img/no-poster.jpg'; // тернарный оператор: если постера нет то вставляем изображение заглушку
			const backdropImg = backdrop ? IMG_URL + backdrop : './img/no-poster.jpg'; // тернарный оператор: если постера нет то вставляем изображение заглушку
			const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''; // тернарный оператор: если рейтинга нет, то не выводим блок
			const card = document.createElement('li'); // создаем элемент списка
			card.className = 'tv-shows__item'; // задаем класс
			// вставляем в элемент верстку, сохраняем id сериала в аттрибут
			card.insertAdjacentHTML('afterbegin', ` 
			<a href="#" data-idshow="${id}" class="tv-card">
				${voteElem}
				<img class="tv-card__img"
					 src="${posterImg}"
					 data-backdrop="${backdropImg}"
					 alt="${title}">
				<h4 class="tv-card__head">${title}</h4>
			</a>
		`);
			loading.remove(); // удаляем прелоадер
			tvShowList.insertAdjacentElement('afterbegin', card); // вставляем элемент на страницу
		});
		pagination.textContent = '';
		console.log(target);
		if (response.total_pages > 1 && !target) {
			for (let i = 1; i <= response.total_pages; i++) {
				pagination.innerHTML += `
					<li><a href="#" class="pages">${i}</a></li>
				`;
			}
		}
	} else { // если результат пустой
		loading.remove(); // удаляем прелоадер
		tvShowsHead.textContent = 'Ничего не найдено'; // выводим заголовок вывода
	}
}

// эффект при наведении на карточку (смена изображений)
const changeImage = event => {
	const card = event.target.closest('.tv-shows__item'); // получаем карточку
	if (card) {
		const img = card.querySelector('.tv-card__img'); // получаем изображение
		// и дальше вариант 1 - через временную переменную
		// const drop = img.dataset.backdrop; // получаем значение аттрибута data-backdrop во временное хранилище
		// if (drop) { // если значение получено
		// 	img.dataset.backdrop = img.src; // заменяем значение аттрибута data-backdrop на src из img
		// 	img.src = drop; // а в src мы записываем значение из аттрибута data-backdrop
		// }
		// или вариант 2 - через деструктуризацию
		if (img.dataset.backdrop) { // если значение получено
			[img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]; // меняем значения местами
		}
	}
};

// сворачиваем пункты подменю
const closeDropdown = () => {
	dropdown.forEach(item => item.classList.remove('active'));
}

// открытие-закрытие меню при клике только по иконке гамбургер
hamburger.addEventListener('click', () => {
	leftMenu.classList.toggle('openMenu'); // выдвигаем-задвигаем левое меню
	hamburger.classList.toggle('open'); // меняем иконку гамбургер->крестик->гамбургер
	closeDropdown(); // сворачиваем пункты меню
});

// закрытие меню при клике мимо
document.addEventListener('click', event => {
	if (!event.target.closest('.left-menu')) { // если кликаем не по меню
		leftMenu.classList.remove('openMenu'); // закрываем левое меню
		hamburger.classList.remove('open'); // меняем крестик на гамбургер
		closeDropdown(); // сворачиваем пункты меню
	}
});

// действия при клике по левому меню
leftMenu.addEventListener('click', event => {
	event.preventDefault(); // отменяем перезагрузку страницы
	const target = event.target; // получаем элемент по которому кликнули
	const dropdown = target.closest('.dropdown'); // поднимаемся до dropdown
	if (dropdown) { // если успешно поднялись до dropdown
		dropdown.classList.toggle('active'); // раскрываем подменю
		leftMenu.classList.add('openMenu'); // выдвигаем меню
		hamburger.classList.add('open'); // меняем гамбургер на крестик
	}
	if (target.closest('#top-rated')) { // при клике по пункту меню Топ сериалы
		tvShows.append(loading); // вставляем прелоадер
		dbService.getTopRated().then((response) => renderCard(response, target)); // отправляем запрос на сервер через метод getTopRated
	}
	if (target.closest('#popular')) { // при клике по пункту меню Популярные
		tvShows.append(loading); // вставляем прелоадер
		dbService.getPopular().then((response) => renderCard(response, target)); // отправляем запрос на сервер через метод getPopular
	}
	if (target.closest('#today')) { // при клике по пункту меню Сегодня
		tvShows.append(loading); // вставляем прелоадер
		dbService.getToday().then((response) => renderCard(response, target)); // отправляем запрос на сервер через метод getToday
	}
	if (target.closest('#week')) { // при клике по пункту меню На неделю
		tvShows.append(loading); // вставляем прелоадер
		dbService.getWeek().then((response) => renderCard(response, target)); // отправляем запрос на сервер через метод getWeek
	}
	if (target.closest('#search')) { // при клике по пункту меню Поиск
		tvShowList.textContent = ''; // очищаем страницу
		tvShowsHead.textContent = '';  // очищаем заголовок вывода
	}
});

// открытие модального окна
tvShowList.addEventListener('click', event => {
	event.preventDefault(); // отменяем перезагрузку страницы
	const target = event.target; // получаем элемент по которому кликнули
	const card = target.closest('.tv-card'); // поднимаемся до самой карточки
	if (card) { // если карточку получили
		// preloader.style.display = 'block'; // показываем прелоадер
		tvShows.append(loading);
		dbService.getTvShow(card.dataset.idshow).then( ({ poster_path: poster, name: title, genres, vote_average: vote, overview, homepage }) => {  // обращаемся к БД и получаем данные
			if (poster) { // если изображение есть то загружаем
				tvCardImg.src = IMG_URL + poster; // вставляем изображение фильма
				tvCardImg.alt = title;
				posterWrapper.style.display = ''; // показываем блок с изображением
				modalСontent.style.paddingLeft = ''; // возвращаем блок с описанием на место
			} else { // если изображение отсутствует
				posterWrapper.style.display = 'none'; // скрываем блок с изображением
				modalСontent.style.paddingLeft = '25px'; // сдвигаем блок с описанием влево
			}
			modalTitle.textContent = title; // заполняем название
			/* заполняем жанры - 1 вариант */
			// genresList.innerHTML = genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');

			/* заполняем жанры - 2 вариант */
			genresList.textContent = '';
			for (const item of genres) {
				genresList.innerHTML += `<li>${item.name}</li>`;
			}
			rating.textContent = vote; // заполняем рейтинг
			description.textContent = overview; // заполняем описание
			modalLink.textContent = homepage; // вставляем ссылку
			modalLink.href = homepage; // вставляем ссылку
		})
		.then(() => {
			document.body.style.overflow = 'hidden'; // убираем полосу прокрутки при мод. окне
			modal.classList.remove('hide'); // открываем мод. окно
		})
		.finally(() => { // finally выполняется в любом случае
			// preloader.style.display = ''; // скрываем прелоадер
			loading.remove(); // удаляем прелоадер
		})
	}
});

// закрытие мод. окна
modal.addEventListener('click', event => {
	if (event.target.closest('.cross') || event.target.classList.contains('modal')) { // если кликнули по крестику или мимо окна
		document.body.style.overflow = ''; // убираем значение hidden
		modal.classList.add('hide'); // закрываем мод. окно
	}
});

tvShowList.addEventListener('mouseover', changeImage); // наводим мышку на карточку
tvShowList.addEventListener('mouseout', changeImage); // уводим мышку с карточки

// поиск
searchForm.addEventListener('submit', event => {
	tvShowList.textContent = '';
	event.preventDefault(); // откл. перезагрузку страницы
	const value = searchFormInput.value.trim(); // получаем текст из поля поиска без лишних пробелов
	searchFormInput.value = ''; // очищаем поле поиска
	if (value) {
		tvShows.append(loading); // вставляем прелоадер в блок с карточками
		/* через класс DBService обращаемся к методу getSearchResult, getSearchResult передает в метод getData get запрос и ждет ответа (результат),
		getData по этому получает данные из БД, обрабатывает методом json(), и возвращает результат в getSearchResult, getSearchResult
		дождавшись передает результат в вызов DBService(), DBService() методом then передает результат в функцию renderCard*/
		dbService.getSearchResult(value).then(renderCard);
	}
});

// навигация по страницам
pagination.addEventListener('click', event => { // клик по навигации
	event.preventDefault(); // отключаем перезагрузку
	const target = event.target; // определяем по чему кликнули
	if (target.classList.contains('pages')) { // если по элементу с классом pages
		tvShows.append(loading); // показываем прелоадер
		dbService.getPage(target.textContent).then(renderCard); // отправляем номер страницы и отрисовываем карточки
	}
});