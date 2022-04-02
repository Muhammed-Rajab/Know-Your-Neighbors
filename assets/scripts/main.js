'use strict';
const log = console.log;

const rootEl = document.querySelector(':root');

const inputBox = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');

const table = document.querySelector('.results-table');
const tableBody = document.querySelector('.table-body');

class Renderer {
    
    static renderBorderSharingCountryElement(data, borderNo) {
        const {name:{common:  countryName},flag: countryFlag,population: countryPopulation} = data;
    
        const row = document.createElement('tr');
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
        countryMoreLinkTd.innerHTML = `<a href="#" class="more-link"><i class="fa-solid fa-angles-right"></i></a>`;
        row.appendChild(countryMoreLinkTd);
    
        return row;
    }
}

class App {
    
    borderNo = 1;
    isSearchingForCountry = false;

    constructor () {
        this.currentCountry = "";
        this.currentCountryData = {};
        this.currentCountryNeighboursData = [];

        // * Css variables
        rootEl.style.setProperty("--table-body-loading-screen-visibility", "none");

        // * Event listeners
        searchBtn.addEventListener('click', () => {
            
            if (this.isSearchingForCountry) {
                return;
            };
            
            this.toggleSearchBtn();
            this.toggleSearchState();
            this.toggleTableBodyLoadingScreen();
            this.onNewCountrySearch(inputBox.value);
        });
    }

    resetCurrentState() {
        this.borderNo = 1;
        this.currentCountryNeighbours = [];
    }

    toggleTableBodyLoadingScreen() {
        rootEl.style.setProperty("--table-body-loading-screen-visibility", rootEl.style.getPropertyValue("--table-body-loading-screen-visibility") === "none" ? "block" : "none");
    }

    toggleSearchBtn() {
        searchBtn.disabled = !searchBtn.disabled;
        searchBtn.querySelector('i').classList.toggle("fa-spinner");
        searchBtn.querySelector('i').classList.toggle("loading-animation");
    }

    toggleSearchState() {
        this.isSearchingForCountry = !this.isSearchingForCountry;
    }

    onNewCountrySearch(countryName) {
        this.resetCurrentState()
        this.currentCountry = countryName;
        this.__getCountrysNeighborData();
    }

    __getCountrysNeighborData() {
        
        fetch(`https://restcountries.com/v3.1/name/${this.currentCountry}`)
         .then(response => response.json())
         .then(data => {
            [this.currentCountryData] = data;
            this.__renderBorderCountriesList();
         }).finally(()=>{
            this.toggleSearchState();
            this.toggleSearchBtn();
            this.toggleTableBodyLoadingScreen();
        });
    }

    __renderBorderCountriesList() {
    
        const {borders: countryBorders} = this.currentCountryData;
    
        countryBorders.forEach(border => {
            fetch(`https://restcountries.com/v3.1/alpha/${border}`)
             .then(response => response.json())
             .then(data => {
                
                 // * When first promise is fulfilled or rejected
                if (this.borderNo === 1) tableBody.innerHTML = "";
                
                this.currentCountryNeighboursData.push(data[0]);
                tableBody.appendChild(Renderer.renderBorderSharingCountryElement(data[0], this.borderNo));
            })
            .finally(() => {
                this.borderNo++;

                if (this.borderNo === countryBorders.length){
                    // * When it's the last promise to be fulfilled or to be rejected
                }
            });
        });
    }
};

const app = new App();

inputBox.value = "usa";
searchBtn.click();