import axios from 'axios';

const refs = {
  form: document.querySelector('.js-form'),
  add: document.querySelector('.js-add'),
  cont: document.querySelector('.js-container'),
  list: document.querySelector('.js-list'),
};

refs.add.addEventListener('click', addField);
refs.form.addEventListener('submit', onSubmit);

function addField() {
  refs.cont.insertAdjacentHTML(
    'beforeend',
    '<input type="text" name="country" placeholder="Search country" />'
  );
}

async function onSubmit(ev) {
  ev.preventDefault();

  const formData = new FormData(ev.currentTarget);
  const countries = formData
    .getAll('country')
    .map(country => country.trim())
    .filter(country => country);

  try {
    const respCountries = await getCountries(countries);
    const capitals = respCountries.map(country => country.capital[0]);
    const respWeather = await getWeather(capitals);
    refs.list.innerHTML = createMarkup(respWeather);
  } catch (err) {}

  refs.form.reset();
}

async function getCountries(countries) {
  axios.defaults.baseURL = 'https://restcountries.com/v3.1/name/';
  const resps = countries.map(async country => axios.get(`${country}`));

  const data = await Promise.allSettled(resps);

  return data
    .filter(resp => resp.status === 'fulfilled')
    .map(resp => resp.value.data[0]);
}
async function getWeather(capitals) {
  axios.defaults.baseURL = 'http://api.weatherapi.com/v1';
  const resps = capitals.map(async capital =>
    axios.get('/current.json', {
      params: {
        key: 'b6bbf5ee5b904a2bb6374500242309',
        q: capital,
        lang: 'uk',
      },
    })
  );
  const data = await Promise.allSettled(resps);

  return data
    .filter(resp => resp.status === 'fulfilled')
    .map(resp => resp.value.data);
}
function createMarkup(capitals) {
  return capitals
    .map(
      ({
        location: { country, name },
        current: {
          temp_c,
          condition: { icon, text },
        },
      }) => ` <li class='card'>
        <img src="${icon}" alt="${text}" class='img' />
        <h3>${country}</h3>
        <h3>${name}</h3>
        <p>${temp_c} degr. C</p>
        <p>${text}</p>
      </li>`
    )
    .join('');
}
