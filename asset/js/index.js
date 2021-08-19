const apiKey = "5ae2e3f221c38a28845f05b6619b387f994edf13cd3ab04e10bbcef9";
//radiud jangkauan data 50000m atau 50km
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
            .catch(function (err) {
                console.log("Error :-S", err);//display error
            });
    });
    // console.log(data)
}

const dataLength = 6;//display data count

let offset=0;
let lon=0;
let lat=0;
let count = 0;

function showDetailsData(data) {
    let det = document.getElementById("detail");
    let des = document.getElementById("modal-header")
    des.innerHTML="";
    det.innerHTML = "";
    if (data.preview) {
        det.innerHTML += `<img class="card-img-top" src="${data.preview.source}">`;
    }
    det.innerHTML += data.wikipedia_extracts
        ? data.wikipedia_extracts.html
        : data.info
            ? data.info.descr
            : "No description";

    det.innerHTML += `<p> location: </p> 
                <p>Country: ${data.address.country}</p>
                <p>Country Code: ${data.address.country_code}</p>
                <p>County: ${data.address.county}</p>
                <p>PostCode: ${data.address.postcode}</p>
                <p>Road: ${data.address.road}</p>
                <p>State:${data.address.state}</p>`
    des.innerHTML += `<h4 class="modal-title">${data.name}</h4>`

    det.innerHTML += `<p><a target="_blank" href="${data.otm}">Open In Map</a></p>`;
    console.log(data)
}

//function create element dom for dinamic data
function createItemList(item) {
    let a = document.createElement("button");
    a.className = "list-group-item list-group-item-action";
    a.dataset.target = "#myModal"
    a.dataset.toggle = "modal"
    a.setAttribute("data-id", item.xid);
    a.innerHTML = `<p>${getCategoryName(item.kinds)}</p><h5">${item.name}</h5>
        `;
    let xid = item.xid;

    a.addEventListener("click", function () {
        document.querySelectorAll("#list button").forEach(function (item) {
            item.classList.remove("active");
        });
        this.classList.add("active");
        let xid = this.getAttribute("data-id");
        apiGet("xid/" + xid).then(data => showDetailsData(data));
    });
    return a;
}

//after using place use radius for easyer filter daya in api by location and geoname
function loadList() {
    apiGet(
        "radius",
        `radius=50000&limit=${dataLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=json`
    ).then(function (data) {
        let list = document.getElementById("list");
        list.innerHTML = "";
        data.forEach(item => list.appendChild(createItemList(item)));
        console.log(data)
        let nextBtn = document.getElementById("next-button");
        if (count < dataLength) {
            nextBtn.style.visibility = "hidden";
        } else {
            nextBtn.style.visibility = "visible";
            nextBtn.innerText = `Next (${offset + dataLength} of ${count})`;
            if (dataLength + offset>=count) {
                nextBtn.disabled = true;
            }else if (dataLength + offset <= count) {
                nextBtn.disabled =false;
            }
        }
        //previus
        let preBtn = document.getElementById("previous-button");
        if (offset - dataLength<0) {
            preBtn.style.visibility = "hidden";
        } else {
            preBtn.style.visibility = "visible";
            preBtn.innerText = `Previous (${offset - dataLength} of ${count})`;
        }
       
    });
}



function loadItemData() {//use dataLength for limit display data
    apiGet(
        "radius",
        `radius=50000&limit=${dataLength}&offset=${offset}&lon=${lon}&lat=${lat}&rate=2&format=count`
    ).then(function (data) {
        // console.log(data)
        count = data.count;
        offset = 0;
        document.getElementById(
            "info"
        ).innerHTML += `<p>${count} Recommendation`
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

document
    .getElementById("next-button")
    .addEventListener("click", function(){
        offset += dataLength;
        loadList();
    });
document
    .getElementById("previous-button")
    .addEventListener("click", function(){
        offset -= dataLength;
        loadList();
    });