let latInput = document.getElementById('input-lat');
let longInput = document.getElementById('input-long');
let citySelect = document.getElementById('city-select');

let s = new Scene("stage");



let cities = [
    [29.9511, 90.0715],         // New Orleans, LA
    [37.7749, 122.4194],        // San Francisco
    [40.6943, -73.9249],        // New York
    [19.4424, -99.1310],        // Mexico City
    [19.0170, 72.8570],         // Mumbai
    [-23.5587, -46.6250],       // Sao Paulo
    [35.6850, 139.7514],        // Tokyo
];


function setSeed()
{
    let lat = parseFloat(latInput.value);
    let long = parseFloat(longInput.value);

    s.setFlowerSeedFromLocation(lat, long);
}

function setCity()
{
    let cityIndex = citySelect.value;
    console.log(parseInt(cityIndex));

    if (cityIndex < 0 || cityIndex >= cities.length) return;

    latInput.value = cities[cityIndex][0];
    longInput.value = cities[cityIndex][1];

    setSeed();
}



/*
let r = new StableRandom();

let count = [];
let n;
for (let i=0; i < 10000; i++)
{
    // console.log(r.random());
    n = r.randInt(0,10);
    console.log(n);
    if (count[n] != undefined)
    {
        count[n]++;
    }
    else
    {
        count[n] = 1;
    }
    // count[n] = count[n] ? count[n]++ : 1;
}
console.log(count);
*/