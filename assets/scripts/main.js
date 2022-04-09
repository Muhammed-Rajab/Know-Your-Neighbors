'use strict';
const log = console.log;

// * Importing modules
import { Renderer } from "./modules/render.js";
import { Elements } from "./modules/elements.js";

const rootEl = document.querySelector(':root');
const toggleThemeBtn = document.querySelector('.toggle-theme');

const inputBox = document.querySelector('.search-box');
const searchBtn = document.querySelector('.search-btn');

const table = document.querySelector('.results-table');
const tableBody = document.querySelector('.table-body');
const tableErrorCol = document.querySelector('.table-error tr > td');

const moreViewContainer = document.querySelector('.more-view-container');
const moreViewDetails = document.querySelector('.more-view-details-container');

/* Other Eventlisteners */
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle('dark-body');
    const themeIcon = toggleThemeBtn.querySelector('i');
    themeIcon.classList.toggle("fa-moon");
    themeIcon.classList.toggle("fa-sun");
});

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
        
        // * Initializing map and map assets
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
                if (moreViewContainer.classList.contains('d-flex')) {
                    this.toggleMoreViewContainer();
                }
            }
        });

    }

    resetCurrentResults() {
        this.borderNo = 1;
        this.currentCountryNeighbours = [];
    }

    onNewCountrySearch(countryName) {
        this.resetCurrentResults();
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
                tableBody.appendChild(Renderer.renderBorderSharingCountryElement(data[0], this.borderNo, newDataID, this.__handleMoreArrowClick.bind(this)));
            })
            .finally(() => {
                this.borderNo++;

                if (this.borderNo === countryBorders.length){
                    // * When it's the last promise to be fulfilled or to be rejected
                }
            });
        });
    }

    __handleMoreArrowClick(e) {
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
        
        const {latlng: [lat, lng]} = countryData;

        L.tileLayer(
            `https://tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?lang=en&access-token=${this.APIKEY}`, {
              maxZoom: 22,
            }
        ).addTo(this.map);

        // L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        //     maxZoom: 18,
        //     id: 'mapbox/streets-v11',
        //     tileSize: 512,
        //     zoomOffset: -1,
        //     accessToken: "pk.eyJ1Ijoic2hlaGF0ZXNteXVzZXJuYW1lIiwiYSI6ImNsMXJyYnhhMDA3dTczZHBsdmt4cXMxMTAifQ.xhojAmwJ-yvTQK0WLzWA_g"
        // }).addTo(this.map);

        if  (!this.currMapPin) {
            
            this.currMapPin = L.marker([lat, lng], {icon: this.mapPinIcon})
                .bindTooltip(`Lat: ${lat} Lng: ${lng}`, {
                    direction: "top",
                    className: "tooltip-current-country-more-marker"
                }).addTo(this.map);
            
            this.currMapPin.on('click', (e) => {
                const {latlng:{
                    lat,lng
                }} = e;
                this.map.setView([lat, lng], 7)
            });
        }
        else {
            this.currMapPin.setLatLng([lat, lng]);
        }
        
        this.map.setView([lat, lng], 4);

        moreViewDetails.innerHTML = Renderer.renderMoreCountryDetails(countryData);
        
    }
};

const app = new App();

inputBox.value = "india";
searchBtn.click();