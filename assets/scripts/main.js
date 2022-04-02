'use strict';
const log = console.log;

const tableBody = document.querySelector('.table-body');

function renderBorderSharingCountryElement(data, index) {
    const {
        name:{
            common:  countryName
        },
        flag: countryFlag,
        population: countryPopulation
    } = data;

    const row = document.createElement('tr');
    row.classList.add('row');

    const tdClasses = ['country-no', 'country-name', 'country-flag', 'country-population'];
    const tdInnerText = ['#'+index, countryName, countryFlag, new Intl.NumberFormat().format(countryPopulation)];

    tdClasses.forEach((class_, idx) => {
        const td = document.createElement('td');
        td.innerText = tdInnerText[idx];
        td.classList.add(class_);
        row.appendChild(td);
    });

    const countryMoreLinkTd = document.createElement('td');
    countryMoreLinkTd.classList.add('country-more');
    countryMoreLinkTd.innerHTML = `<a href="#" class="more-link"><i class="fa-solid fa-angles-right"></i></a>`;
    row.appendChild(countryMoreLinkTd);

    return row;
};

function renderBorderCountriesList(data) {
    
    const {borders: countryBorders} = data;

    countryBorders.forEach((border, idx) => {
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
        .then(response => response.json())
        .then(data => {
            log(data[0]);
            tableBody.appendChild(renderBorderSharingCountryElement(data[0], idx + 1));
        });
    });
};

function getCountrysNeighborData(countryName) {
    /*
        TODO: Fetches data from countryName
        TODO: Gets border countries if successful
            TODO: Loop through borders and fetch their data
            TODO: Store them incase if user wants to know more about em
            TODO: Render the list to user
        TODO: Else show error
    */
   fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    .then(response => response.json())
    .then(data => renderBorderCountriesList(data[0]));
};

getCountrysNeighborData("germany");