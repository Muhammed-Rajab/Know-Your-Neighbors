'use strict';
const log = console.log;

let borderNo = 1;
const table = document.querySelector('.results-table');
const tableBody = document.querySelector('.table-body');

function renderBorderSharingCountryElement(data) {
    const {
        name:{common:  countryName},
        flag: countryFlag,
        population: countryPopulation
    } = data;

    const row = document.createElement('tr');
    row.classList.add('table-row');

    const tdClasses = ['country-no', 'country-name', 'country-flag', 'country-population'];
    const tdInnerText = ['#'+borderNo, countryName, countryFlag, new Intl.NumberFormat().format(countryPopulation)];

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

    const allRequests = [];

    countryBorders.forEach((border, idx) => {
        fetch(`https://restcountries.com/v3.1/alpha/${border}`)
        .then(response => {
            allRequests.push(response);
            return response.json();
        })
        .then(data => {
            tableBody.appendChild(renderBorderSharingCountryElement(data[0]));
        })
        .finally(()=>borderNo++);
    });

    Promise.allSettled(allRequests)
    .then(()=>{
        table.style.opacity = 1;
    });
};

function getCountrysNeighborData(countryName) {
    borderNo = 1;
   fetch(`https://restcountries.com/v3.1/name/${countryName}`)
    .then(response => response.json())
    .then(data => renderBorderCountriesList(data[0]));
};

getCountrysNeighborData("india");