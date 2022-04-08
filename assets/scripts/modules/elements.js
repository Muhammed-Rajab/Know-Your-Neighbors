'use strict';
const log = console.log;

// * Query selectors
const moreViewContainer = document.querySelector('.more-view-container');
const tableError = document.querySelector('.table-error');
const searchBtn = document.querySelector('.search-btn');
const tableBody = document.querySelector('.table-body');
const rootEl = document.querySelector(':root');


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
        
        moreViewContainer.classList.toggle('d-flex');
        
        moreViewContainer.classList.toggle('animate__fadeIn');
        moreViewContainer.classList.toggle('animate__fadeOut');
        
        // moreViewContainer.classList.toggle('d-none');

        document.body.classList.toggle('oy-hidden');
        this.toggleTableBody();
        this.map.invalidateSize();

    }

    toggleTableBody() {
        tableBody.classList.toggle('d-none');
    }
};

export {
    Elements
};