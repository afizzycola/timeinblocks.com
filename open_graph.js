// currently doesnt work - WIP
export default class OpenGraph {
    constructor() {
        this.url = document.querySelector('[property="og:url"]')
        this.description = document.querySelector('[property="og:description"]')
        this.image = document.querySelector('[property="og:image"]') 
    }

    setBlockNumber(blockNumber) {
        this.url.setAttribute('content', `${window.location.host}/?blocknumber=${blockNumber}`)
        this.description.setAttribute('content', `Block Number ${blockNumber}`)
        this.image.setAttribute('content', `${import.meta.env.VITE_OG_URL}/${blockNumber}.png/?theme=dark`)
    }
}