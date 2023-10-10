function load() {
    page.home()
}

const listElem = document.getElementById('buses')

const page = {
    clear: () => { while (listElem.firstChild) listElem.firstChild.remove() },
    home: () => {
        getRouteList()
    },
}

function getRouteList() {
    // var api = `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/ctb`;
    // var api = `https://rt.data.gov.hk/v1/transport/citybus-nwfb/route/nwfb`;

    fetch('https://data.etabus.gov.hk/v1/transport/kmb/route')
        .then(response => response.json())
        .then(fetchedRoutes => {
            page.clear()
            for (const fetchedRoute of fetchedRoutes['data']) {
                listElem.appendChild(new Route(fetchedRoute).listItem())
            }
        })
}

function routeFilter() {
    const query = document.getElementById('filterInput').value.toUpperCase()
    for (const item of listElem.getElementsByTagName('li')) {
        const a = item.getElementsByTagName('a')[0]
        const txtValue = a.textContent || a.innerText
        item.style.display = (txtValue.toUpperCase().indexOf(query) > -1) ? 'initial' : 'none'
    }
}