import fetch from 'node-fetch';

await calculateSum();

async function calculateSum() { // main function
    const validCountries = await getValidCountries(process.argv[2] || 0); //get the top 20 countries which meets the conditions
    let sum = 0;
    for (let i = 0; i < validCountries.length; i++) {
        let c1 = validCountries[i].latlng;
        for (let j = i + 1; j < validCountries.length; j++) {
            const c2 = validCountries[j].latlng;
            sum += distance({ c1, c2 })
        }
    }
    console.log(Math.round((sum + Number.EPSILON) * 100) / 100);
}

async function getValidCountries(populationLimit) { //get the top 20 countries which meets the given conditions
    const response = await fetch('https://cdn.jsdelivr.net/gh/apilayer/restcountries@3dc0fb110cd97bce9ddf27b3e8e1f7fbe115dc3c/src/main/resources/countriesV2.json');
    const countries = await response.json();
    const currencies = countries.reduce((total, country) => { return total.concat(country.currencies) }, []) //get the entire currency lists with duplicates of all countries
    const validCountries = countries.filter((country) => {
        return country.currencies.filter((currency) => {
            return currencies.filter((item) => { return item.code === currency.code }).length === 1; // return the currency that has no duplicates
        }).length > 0;
    }).filter((country) => {
        return country.population >= populationLimit //return the countries which are greater than given limit
    }).sort((a, b) => a.population - b.population).slice(0, 20) //return the top 20 countries
    return validCountries;
}

function distance({ c1 = [0, 0], c2 = [0, 0] }) { //calculate distance between two co-ordinates- adapted from geeksforgeeks

    const lon1 = c1[1] * Math.PI / 180;
    const lon2 = c2[1] * Math.PI / 180;
    const lat1 = c1[0] * Math.PI / 180;
    const lat2 = c2[0] * Math.PI / 180;

    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2), 2);
    let c = 2 * Math.asin(Math.sqrt(a));
    let r = 6371;
    const distance = c * r;
    return Math.round((distance + Number.EPSILON) * 100) / 100
}
