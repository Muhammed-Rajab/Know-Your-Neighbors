'use strict';

const log = console.log;

const tableErrorCol = document.querySelector('.table-error tr > td');

export class Renderer {
    
    static renderBorderSharingCountryElement(data, borderNo, id, handleMoreBtnClick) {
        const {name:{common:  countryName},flag: countryFlag,population: countryPopulation} = data;
    
        const row = document.createElement('tr');
        row.dataset.id = id;
        row.classList.add('table-row');
        row.classList.add('animate__animated');
        row.classList.add('animate__fadeInDown');
    
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
        countryMoreLinkTd.innerHTML = `<i class="fa-solid fa-angles-right more-link"></i>`;
        log(countryMoreLinkTd.querySelector('i'));
        countryMoreLinkTd.querySelector('i').addEventListener('click',handleMoreBtnClick);
        row.appendChild(countryMoreLinkTd);
    
        return row;
    }

    static renderTableError(error) {
        tableErrorCol.innerText = error;
    }

    static renderMoreCountryDetails(countryData) {
        
        const ifelse = (cond, yes, no = "") => cond ? yes : no;

        const {
            latlng: [lat, lng],
            area,
            capital = "",
            borders = [],
            continents = [],
            demonyms = {},
            flag: flagEmoji = "",
            flags,
            independent = false,
            languages = {},
            name: $name = {},
            population = "NA",
            timezones = [],
            unMember: isUNMember,
        } = countryData;

        log(countryData);

        log(area, capital, borders, continents, demonyms, flagEmoji, flags, independent, languages, $name, timezones, isUNMember);

        return `
        <header>
            <h1 class="more-country-title">
                <span class="more-country-flag-emoji">
                    ${flagEmoji}
                </span>
                <span class="more-country-name">
                    ${$name.common}
                </span>
            </h1>
        </header>
        <section>
            <ul class="more-country-details-list">
                <li>
                    Capital: ${ifelse(capital,capital)}
                </li>
                <li>
                    Area: ${
                        ifelse(area,new Intl.NumberFormat().format(area))} km<sup>2</sup>
                </li>
                <li>
                    Population: ${
                        ifelse(population, new Intl.NumberFormat().format(population))} people
                </li>
                <li>
                    Continents: ${ifelse(continents !== [],continents.join(', ')
                    )
                    }
                </li>
                <li>Official name: ${$name.official}</li>
                <li>Borders: ${
                    ifelse(borders !== [] && borders, continents.join(', '))
                }</li>
                <li>
                    Flag: <a href="${flags.svg}" target="_blank">svg</a> <a href="${flags.png}" target="_blank">png</a>
                </li>
                <li>Is an independent country? ${ifelse(independent, "Yes", "No")}</li>
                <li>Is a UN member? ${ifelse(isUNMember, "Yes", "No")}</li>
            </ul>
        </section>`
    }
};