'use strict';
const log = console.log;

const rootEl = document.querySelector(':root');

const inputBox = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');

const table = document.querySelector('.results-table');
const tableBody = document.querySelector('.table-body');
const tableError = document.querySelector('.table-error');
const tableErrorCol = document.querySelector('.table-error tr > td');

const moreViewContainer = document.querySelector('.more-view-container');
const moreViewDetails = document.querySelector('.more-view-details-container');
const moreViewMap = document.querySelector('#map');

class Renderer {
    
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
}

class Elements {

    // * Toggling elements
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

    // Hide
    setTableErrorVisibility(visibility=false) {
        tableError.style.display = visibility ? "table-footer-group" : "none";
    }

    toggleMoreViewContainer() {
        moreViewContainer.classList.toggle('d-none');
        document.body.classList.toggle('oy-hidden');
        this.map.invalidateSize();
    }
};

class App extends Elements{
    
    map;
    borderNo = 1;
    isSearchingForCountry = false;
    APIKEY = "56vAHXvdXDhieM28ZOh7gEukLasgQ1HOONjSPgw9TOHsyw9c4wStF0i1qIXUXCKG";

    constructor () {

        super();

        this.currentCountry = "";
        this.currentCountryData = {};
        this.currentCountryNeighboursData = [];

        // * Css variables
        rootEl.style.setProperty("--table-body-loading-screen-visibility", "none");
        
        // * Initializing map
        navigator.geolocation.getCurrentPosition((e) => {
            
            const {coords: {latitude: lat,longitude: lng}} = e;

            this.map = L.map('map', {
                zoomControl: false
            }).setView([lat, lng], 4);

        }, () => {
            
            this.map = L.map('map', {
                zoomControl: false
            }).setView([0, 0], 4);

        });

        this.mapPinIcon = L.icon({
            iconUrl: 'assets/images/icons/map-pin.png',
            iconSize: [32, 52],
            iconAnchor: [22, 94],
            popupAnchor: [-3, -76],
            shadowSize: [68, 95],
            shadowAnchor: [22, 94]
        });

        // * Event listeners
        searchBtn.addEventListener('click', () => {
            
            if (this.isSearchingForCountry || inputBox.value.length === 0) return;
            
            this.setTableErrorVisibility(false);
            this.toggleSearchBtn();
            this.toggleSearchState();
            this.toggleTableBodyLoadingScreen();
            this.onNewCountrySearch(inputBox.value);
        });

        // * When escape key is pressed
        window.addEventListener('keydown', e => {
            if (e.key === "Escape") {
                if (!moreViewContainer.classList.contains('d-none')) {
                    this.toggleMoreViewContainer();
                }
            }
        });

    }

    resetCurrentState() {
        this.borderNo = 1;
        this.currentCountryNeighbours = [];
    }

    onNewCountrySearch(countryName) {
        this.resetCurrentState();
        this.currentCountry = countryName;
        this.__getCountrysNeighborData();
    }

    __getCountrysNeighborData() {
        
        fetch(`https://restcountries.com/v3.1/name/${this.currentCountry}`)
         .then(response => {
            if (!response.ok) {
                const err =  new Error(`Country named ${this.currentCountry} doesn't exists`);
                err.response = response;
                throw err;
            }
            return response.json();
         })
         .then(data => {
            [this.currentCountryData] = data;
            this.__renderBorderCountriesList();
         })
         .catch(e => {
            tableBody.innerHTML = ""
            Renderer.renderTableError(e.message);
            this.setTableErrorVisibility(true);
         })
         .finally(()=>{
            this.toggleSearchState();
            this.toggleSearchBtn();
            this.toggleTableBodyLoadingScreen();
        });
    }

    __renderBorderCountriesList() {
    
        const {borders: countryBorders} = this.currentCountryData;

        if(!countryBorders) {
            Renderer.renderTableError(`${this.currentCountry} doesn't share it's border with any other country`);
            this.setTableErrorVisibility(true);
            return;
        };
    
        countryBorders.forEach(border => {
            fetch(`https://restcountries.com/v3.1/alpha/${border}`)
             .then(response => response.json())
             .then(data => {
                
                 // * When first promise is fulfilled or rejected
                if (this.borderNo === 1) tableBody.innerHTML = "";

                const newDataID = Date.now();
                this.currentCountryNeighboursData.push({data: data[0], id: newDataID});
                tableBody.appendChild(Renderer.renderBorderSharingCountryElement(data[0], this.borderNo, newDataID, this.__handleMoreBtnClick.bind(this)));
            })
            .finally(() => {
                this.borderNo++;

                if (this.borderNo === countryBorders.length){
                    // * When it's the last promise to be fulfilled or to be rejected
                }
            });
        });
    }

    // * Handling actions when user wants more data about a country
    __handleMoreBtnClick(e) {
        const el = e.target;
        const parentTable = el.closest('.table-row');
        const dataID = parentTable.dataset.id;
        const countryData = this.currentCountryNeighboursData.filter(con => con.id === +dataID);

        if (!countryData || countryData.length === 0) return;
        
        this.__showMoreWindow(countryData[0]);
    }

    __showMoreWindow(data) {
        this.toggleMoreViewContainer();
        this.__renderMoreViewContainer(data);
    }

    __renderMoreViewContainer(data) {
        
        const {data: countryData} = data;
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
            languages: {},
            name: {},
            population = "NA",
            timezones = [],
            unMember: isUNMember,
        } = countryData;

        
        L.tileLayer(
            `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?lang=en&access-token=${this.APIKEY}`, {
              maxZoom: 22,
            }
        ).addTo(this.map);


        if  (!this.currMapPin) {
            this.currMapPin = L.marker([lat, lng], {icon: this.mapPinIcon}).addTo(this.map);
            this.currMapPin.on('click', (e) => {
                const {latlng:{
                    lat,lng
                }} = e;
                this.map.setView([lat, lng], 7)
            });
        }
        else 
            this.currMapPin.setLatLng([lat, lng]);
        
        this.map.setView([lat, lng], 4);
        
    }
};

const app = new App();

inputBox.value = "india";
searchBtn.click();