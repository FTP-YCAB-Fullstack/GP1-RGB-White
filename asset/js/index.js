const apiKey = "5ae2e3f221c38a28845f05b6619b387f994edf13cd3ab04e10bbcef9";

//function to get url api and api key by place
function apiGet(method, query) {
    return new Promise(function (resolve) {
        var otmAPI =
            "https://api.opentripmap.com/0.1/en/places/" +
            method +
            "?apikey=" +
            apiKey;
        if (query !== undefined) {
            otmAPI += "&" + query;
        }
        fetch(otmAPI)
            .then(response => response.json())//json response output
            .then(data => resolve(data))
            .catch(function (err) {//error handling
                console.log("Error :-S", err);
            });
    });
    // console.log(data)
}

const dataLength = 6;//display data count

let offset;
let lon;
let lat;

//function create element dom for dinamic data
function createItemList(item) {
    let a = document.createElement("a");
    a.className = "list-group-item list-group-item-action";
    a.setAttribute("data-id", item.xid);
    a.innerHTML = `<h5">${item.name}</h5>
      <p>${getCategoryName(item.kinds)}</p>`;
    return a;
}

//after using place use radius for easyer filter daya in api by location and geoname
function loadList() {
    apiGet(
        "radius",
        `radius=10000&limit=${dataLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=json`
    ).then(function (data) {
        let list = document.getElementById("list");
        list.innerHTML = "";
        data.forEach(item => list.appendChild(createItemList(item)));
        console.log(data)
       
    });
}



function loadItemData() {//use dataLength for limit display data
    apiGet(
        "radius",
        `radius=1000&limit=${dataLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=count`
    ).then(function (data) {
        // console.log(data)
        count = data.count;
        offset = 0;
        document.getElementById(
            "info"
        )
        loadList();
    });
}



document
    .getElementById("form-search")
    .addEventListener("submit", function (event) {
        let name = document.getElementById("textbox").value;
        //insert geoname for search by city
        apiGet("geoname", "name=" + name).then(function (data) {
            let message = "Data Not Found";
            if (data.status == "OK") {
                message = data.name + ", " + getCountryName(data.country);
                lon = data.lon;//get and insert data ion and let to variable
                lat = data.lat;
                loadItemData();
            }
            document.getElementById("info").innerHTML = `<p>${message}</p>`;
        });
        event.preventDefault();
    });