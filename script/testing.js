fetchedRoutes = null

function load() {
    getRouteList()
}

function getRouteList() {
    // var stop1 = "466111DE1A3E4656"
    // var route = "961"

    // var api = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stop1}/${route}/1`;
    // var api = `https://data.etabus.gov.hk/v1/transport/kmb/route/74B/O/1`;



    var api = `https://data.etabus.gov.hk/v1/transport/kmb/route`;
    // var api = `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/ctb`;
    // var api = `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/nwfb`;

    fetch(api)
        .then(response => response.json())
        .then(data => { routeListProcess(data) })
}

function routeFilter() {
    var filter = document.getElementById('filterInput').value.toUpperCase()
    var buses = document.getElementById('buses')
    var li = buses.getElementsByTagName('li')
    // console.log(li)


    for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName("a")[0];
        txtValue = a.textContent || a.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            li[i].style.display = "initial";
        } else {
            li[i].style.display = "none";
        }
    }
}

function routeListProcess(fetchedRoutes) {
    var boundAll = [null]
    var destAll = [null]
    var routeAll = [null]
    var serviceAll = [null]
    var boundName = [null]

    var dataLength = fetchedRoutes["data"].length

    // console.log(fetchedRoutes)

    for (i = 0; i < dataLength; i++) {
        boundAll[i] = fetchedRoutes["data"][i]["bound"]
        routeAll[i] = fetchedRoutes["data"][i]["route"]
        destAll[i] = (fetchedRoutes["data"][i]["dest_en"]).toLowerCase()
        serviceAll[i] = fetchedRoutes["data"][i]["service_type"]

        if (boundAll[i] == "I") {
            boundName[i] = "inbound"
        } else {
            boundName[i] = "outbound"
        }
    }

    // console.log(boundAll)


    for (i = 0; i < dataLength; i++) {
        if (routesHTML) {
            routesHTML = `${routesHTML}<li><div class="line"></div><a class="bus-card" onclick="routePage('${routeAll[i]}','${boundName[i]}','${boundAll[i]}','${serviceAll[i]}','${destAll[i]}')"><div class="bus-no-container"><div class="bus-no">${routeAll[i]}</div></div><div class="bus-info"><div class="bus-dest">${destAll[i]}</div></div></a></li>`
        } else {
            var routesHTML = `<li><a class="bus-card" onclick="routePage('${routeAll[i]}','${boundName[i]}','${boundAll[i]}','${serviceAll[i]}','${destAll[i]}')"><div class="bus-no-container"><div class="bus-no">${routeAll[i]}</div></div><div class="bus-info"><div class="bus-dest">${destAll[i]}</div></div></a></li>`
        }
    }

    document.getElementById("buses").innerHTML = routesHTML
}

// function testFunction(index, value) {
//     console.log(index)
//     console.log(value)
// }

function routePage(route, direction, bound, service_type, dest) {
    var stopsHTML = `<a class="bus-card" onclick="getRouteList()"><div class="bus-no-container"><div class="bus-no">${route}</div></div><div class="bus-info"><div class="bus-dest">${dest}</div></div></a>`
    document.getElementById("buses").innerHTML = stopsHTML + '<div class="line"></div><a class="bus-card">Loading...</a>'

    var api = `https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${route}/${direction}/${service_type}`;

    fetch(api)
        .then(response => response.json())
        .then(data => {
            // console.log(data)
            fetchedStops = data
            stopListProcess(fetchedStops, route, service_type, bound, dest)
        })


    // console.log("ye")
}

async function stopListProcess(fetchedStops, route, service_type, bound, dest) {
    var stopAll = [null]
    var stopName = [null]
    var eta1All = [null]
    var dataLength = fetchedStops["data"].length

    for (i = 0; i < dataLength; i++) {
        stopAll[i] = fetchedStops["data"][i]["stop"]
    }



    // console.log(stopAll)
    // console.log(route)
    // console.log(service_type)

    for (i = 0; i < dataLength; i++) {
        // var api = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopAll[i]}/${route}/${service_type}`;
        var api = `https://data.etabus.gov.hk//v1/transport/kmb/stop/${stopAll[i]}`;

        await fetch(api)
            .then(response => response.json())
            .then(data => {
                stopName[i] = data["data"]["name_en"].toLowerCase()
                // console.log(stopName[i])
                // stopListPop(stopName)
                // console.log("lolol")
                // fetchedRoutes = data
                // routeListProcess(fetchedRoutes)
            })
    }

    // console.log(stopName)

    var stopsHTML = `<a class="bus-card" onclick="getRouteList()"><div class="bus-no-container"><div class="bus-no">${route}</div></div><div class="bus-info"><div class="bus-dest">${dest}</div></div></a>`
    document.getElementById("buses").innerHTML = stopsHTML + '<div class="line"></div><a class="bus-card">Loading...</a>'

    for (i = 0; i < dataLength; i++) {
        var api = `https://data.etabus.gov.hk/v1/transport/kmb/eta/${stopAll[i]}/${route}/${service_type}`;
        // var api = `https://data.etabus.gov.hk//v1/transport/kmb/stop/${stopAll[i]}`;

        await fetch(api)
            .then(response => response.json())
            .then(data => {
                var good = true
                var k = 0

                if (data['data'][0]) {
                    for (j = 0; good; j++) {
                        // console.log(bound)
                        // console.log(data['data'][j]['dir'])

                        if (bound == data['data'][j]['dir']) {
                            good = false
                            // console.log("noop")
                        } else {
                            k++
                            // console.log(k)
                            // console.log("oop")
                        }

                    }

                    // console.log(k)
                    eta1All[i] = Date.parse(data['data'][k]['eta'])
                    eta1All[i] = (eta1All[i] - new Date()) / 60000
                    eta1All[i] = Math.round(eta1All[i])

                    if (eta1All[i] < 1) {
                        eta1All[i] = "Now"
                    }


                    // console.log(data['data'])
                    // console.log(eta1All[i])
                    // fetchedRoutes = data
                    // routeListProcess(fetchedRoutes)
                } else {
                    eta1All[i] = "No buses"
                }
            })

    }
    // console.log(eta1All)








    for (i = 0; i < dataLength; i++) {
        stopsHTML = `${stopsHTML}<li><div class="line"></div><a class="bus-card"><div class="stop-name">${stopName[i]}</div><div class="spacer-x"></div><div class="eta">${eta1All[i]}</div></a></li>`
    }

    document.getElementById("buses").innerHTML = stopsHTML










    // console.log(stopsHTML)
}