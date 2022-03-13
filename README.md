# Time->in->Blocks Web UI

[timeinblocks.com](https://timeinblocks.com) is a way of describing time in units of Bitcoin Blocks. The Genesis block is the equivalent of the birth of Christ or the UNIX epoch. Time is measured in block numbers including those:
- before the genesis block (BGB), represented as negative blocks;
- in the current mined era where we have mined blocks and;
- in the future where we still have blocks to mine.

## About this repo
Website front-end for [timeinblocks.com](https://timeinblocks.com) made from vanilla HTML, Javascript and CSS. Uses Vite for module bundling. We also use the API of the amazing [mempool.space](https://mempool.space) to get the current Bitcoin blockheight (tip).

## Install Instructions
Install Dependencies:
```
npm install
```

## Deployment
Add Environment Variables into a ```.env``` file. As we are using Vite, the vars need to be prefixed with "VITE_":

If running locally use:
```
npm run dev
```
If deploying into prod, use:
```
npm run build
```