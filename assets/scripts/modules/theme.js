'use strict';

/*
    Onloading, check if theme key is present
        if present
            then set the key value as theme
        else
            set Key value as "dark"
            updateTheme to be dark
    
    when user toggles theme
        if new theme is light
            remove dark-body class
        if new theme is dark
            add dark-body class
*/

const getTheme = () => localStorage.getItem("theme");
const setTheme = (theme) => localStorage.setItem("theme", theme);

const updateTheme = () => {
    if (getTheme() === "dark")
        document.body.classList.add('dark-body');
    else
        document.body.classList.remove('dark-body');
};

{
    if (getTheme)updateTheme(getTheme);
    else setTheme("dark");

    updateTheme();
}

export {
    setTheme,
    getTheme,
    updateTheme,
};