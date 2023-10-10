const elems = {
    smart: ({
        tag,
        classList,
        childNodes = [],
        innerText,
    }) => {
        if (innerText && childNodes.length > 0) throw new Error('Cannot have both innerText and childNodes')

        const elem = document.createElement(tag ?? 'div')
        if (classList) elem.classList = classList
        for (const childNode of childNodes) {
            elem.appendChild(childNode)
        }
        if (innerText) elem.innerText = innerText
        return elem
    },
    line: () => elems.smart({ classList: 'line' }),
    busCard: (route) => elems.smart({
        tag: 'a',
        classList: 'bus-card',
        childNodes: [
            elems.smart({
                classList: 'bus-no-container',
                childNodes: [
                    elems.smart({
                        classList: 'bus-no',
                        innerText: route.route,
                    }),
                ],
            }),
            elems.smart({
                classList: 'bus-info',
                childNodes: [
                    elems.smart({
                        classList: 'bus-dest',
                        innerText: route.dest,
                    }),
                ],
            }),
        ],
    }),
    loading: () => elems.smart({
        classList: 'bus-card',
        innerText: 'Loading...',
    }),
}

class Route {
    constructor(fetchedRoute) {
        this.bound = fetchedRoute.bound
        this.dest = fetchedRoute.dest_en.toLowerCase()
        this.route = fetchedRoute.route
        this.service_type = fetchedRoute.service_type
        this.boundName = this.bound === 'I' ? 'inbound' : 'outbound'

        this.busCard = () => elems.smart({
            tag: 'a',
            classList: 'bus-card',
            childNodes: [
                elems.smart({
                    classList: 'bus-no-container',
                    childNodes: [
                        elems.smart({
                            classList: 'bus-no',
                            innerText: this.route,
                        }),
                    ],
                }),
                elems.smart({
                    classList: 'bus-info',
                    childNodes: [
                        elems.smart({
                            classList: 'bus-dest',
                            innerText: this.dest,
                        }),
                    ],
                }),
            ],
        })

        this.listItem = () => {
            const li = elems.smart({ tag: 'li' })
            const busCard = li.appendChild(this.busCard())
            busCard.onclick = () => this.detail()
            return li
        }

        this.detail = async () => {
            // init for loading
            page.clear()
            listElem.appendChild(this.busCard())
            listElem.appendChild(elems.loading())

            // fetch stops
            const stops = await this.stopList()

            const cards = []
            for (const stop of stops) cards.push(await stop.busCard())
            
            page.clear()
            const busCard = listElem.appendChild(this.busCard())
            busCard.onclick = () => page.home()

            for (const card of cards) listElem.appendChild(card)
        }

        this.stopList = async () => {
            const fetchedStops = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/route-stop/${this.route}/${this.boundName}/${this.service_type}`)
                .then(response => response.json())
                .then(data => data['data'])

            const allStops = []
            for (const stop of fetchedStops) allStops.push(new RouteStop(new StopItem(stop), this))
            return allStops
        }
    }
}

class StopItem {
    constructor(fetchedStop) {
        this.id = fetchedStop.stop

        this.name = async () => {
            const api = `https://data.etabus.gov.hk//v1/transport/kmb/stop/${this.id}`
            return await fetch(api)
                .then(response => response.json())
                .then(data => data['data']['name_en'].toLowerCase())
        }
    }
}

class RouteStop {
    constructor(stop, route) {
        this.stop = stop
        this.route = route

        this.nextBus = async () => {
            const data = await fetch(`https://data.etabus.gov.hk/v1/transport/kmb/eta/${this.stop.id}/${this.route.route}/${this.route.service_type}`)
                .then(response => response.json())
            if (!data['data'][0]) return "No buses"
            return parseETA(data['data'].filter(x => x['dir'] === this.route.bound)[0]['eta'])
        }

        this.busCard = async () => elems.smart({
            tag: 'a',
            classList: 'bus-card',
            childNodes: [
                elems.smart({
                    classList: 'stop-name',
                    innerText: await this.stop.name(),
                }),
                elems.smart({
                    classList: 'spacer-x',
                }),
                elems.smart({
                    classList: 'eta',
                    innerText: await this.nextBus(),
                }),
            ],
        })
    }
}

const parseETA = (eta) => {
    eta = Date.parse(eta)
    eta = (eta - new Date()) / 60000
    eta = Math.round(eta)
    if (eta < 1) return "Now"
    return eta
}