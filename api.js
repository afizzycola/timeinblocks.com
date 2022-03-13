import axios from 'axios';
export default class API {
    constructor() {
        const apiVersion = (import.meta.env.VITE_API_MODE === "TEST") ? 'test' :'v1';
        this._timeToBlocksInterface = axios.create({
            baseURL: `${import.meta.env.VITE_API_URL}/${apiVersion}`,
            headers: {
                'x-api-key': import.meta.env.VITE_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        this._blockExplorerInterface = axios.create({
            baseURL: "https://mempool.space/api/blocks/tip/height",
        });
    }

    getCurrentBlockTip () {
        return this._blockExplorerInterface.get('')
    }

    convertTimeToBlocks(datetime) {
        return this._timeToBlocksInterface.get(`/block-height?datetime=${datetime}`)
    }
}