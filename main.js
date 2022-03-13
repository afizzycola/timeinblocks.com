import './style.css'
import examples from './examples'
import API from './api'
import OpenGraph from './open_graph'
import scrollIntoView from 'smooth-scroll-into-view-if-needed'


const examplesList = document.getElementById("examples-list")
const blocksList = document.getElementById("blocks-list") // to do blocks or cubes?
const datetimePicker = document.getElementById("datetime-picker")
const datetimeSubmit = document.getElementById("datetime-submit")
const blockNumber = document.getElementById("block-number")
const donationAddress = document.getElementById("donation-address")
const coverableContent = document.getElementById("coverable-container")
const infoOverlay = document.getElementById("info-overlay")
const apiOverlay = document.getElementById("api-overlay")

const api = new API()
let shownBlockNumber = 0;
let tipHeight = 0;

window.addEventListener('pageshow', () => {
  updateBlockNumberFromQueryParam();
})
setUpExamplesComponent()
setUpDateTimePicker()
setUpApiDocsbutton ()
setUpInfoButton()
setUpHomeButton()
setUpDonationSection()
const openGraph = new OpenGraph()
setTimeout(moveSlider, 1000)


//======function==========

function setUpExamplesComponent() {
  function getRandomSubarray(arr, size) {
    var shuffled = arr.slice(0), i = arr.length, min = i - size, temp, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        temp = shuffled[index];
        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }
    let unsortedresult = shuffled.slice(min)
    // we sort by blockHeight before returning the result
    return unsortedresult.sort((a,b) => (a.blockHeight > b.blockHeight) ? 1 : ((b.blockHeight > a.blockHeight) ? -1 : 0))
  }

  const randomExamplesList = getRandomSubarray(examples, 5)
  randomExamplesList.forEach((example) => {
    const exampleItem = document.createElement("div")
    exampleItem.classList.add("example-item", "button")
    exampleItem.textContent = example.title
    //attach action to update datetime and blockheight based on example clicked by user
    exampleItem.addEventListener('pointerdown', () => {
      //blockNumber.textContent = example.blockHeight.toLocaleString()
      setErrorOn(false)
      updateBlockNumber(example.blockHeight)
      //input format html datetime picker needs is "yyyy-MM-ddThh:mm" followed by optional ":ss" or ":ss.SSS"
      //hence .substring()
      datetimePicker.value = new Date(example.timestamp * 1000).toISOString().substring(0, 16) 
    })
    examplesList.appendChild(exampleItem)
  })
}

function updateBlockNumber(newBlocknumber) {
  //first work out if we are going to have to pass the 0th block
  if (newBlocknumber == shownBlockNumber && (newBlocknumber + shownBlockNumber !== 0 )) {
    blockNumber.textContent = shownBlockNumber.toLocaleString()
    return
  }
  const signAddition = Math.sign(newBlocknumber) +  Math.sign(shownBlockNumber)
  const passZero = (signAddition === 0)
  //second work out direction (1 to right, -1 to left)
  const ascending = (newBlocknumber > shownBlockNumber)
  const blockMargin = 10
  const numberOfBlocksToShow = 25
  const increments = (newBlocknumber - shownBlockNumber) / numberOfBlocksToShow
  let focusedCube = blocksList.querySelector('.focus')
  if(focusedCube) focusedCube.classList.remove('focus')

  let blockNumbers = []

  for (let i = 0; i < numberOfBlocksToShow; i++) {
    blockNumbers.push(Math.floor(shownBlockNumber + (i * increments)))

  }
  const upperBlockMargin = (tipHeight === newBlocknumber) ? 1 : blockMargin
  for (let i = blockMargin; i > - upperBlockMargin; i--) {
      blockNumbers.push(newBlocknumber - i)
  }
  if (passZero) {
      for (let i = -blockMargin; i < blockMargin; i++) {
          blockNumbers.push(i)
      }
  }
  if (ascending) {
    blockNumbers.sort((a, b) => a-b)
  } else {
    blockNumbers.sort((a, b) => b-a)
  }
  //remove duplicates
  blockNumbers = Array.from(new Set(blockNumbers))

  blockNumbers.forEach((blockNumber) => {
    const newCube = createCubeElement(blockNumber)
    if (blockNumber == newBlocknumber) newCube.classList.add("focus")
    if (blockNumber > -blockMargin && blockNumber < blockMargin) newCube.classList.add(`flyby-${blockNumber.toString()}`)
    if (ascending) {
      blocksList.append(newCube)
    } else {
      blocksList.prepend(newCube)
    }
  })
  shownBlockNumber = newBlocknumber
  blockNumber.textContent = shownBlockNumber.toLocaleString()
  if (passZero) {
    let sequences = [-4, -3, -2, -1, 0, 1, 2, 3, 4]
    if (!ascending) sequences = sequences.reverse()
  }
  
  Array(numberOfBlocksToShow).forEach(() => {
    if (ascending) {
      blocksList.removeChild(blocksList.firstChild)
    } else {
      blocksList.removeChild(blocksList.lastChild)
    }

  })
  updateTweetButton(shownBlockNumber, datetimePicker.value)
  openGraph.setBlockNumber(shownBlockNumber)
  updateQueryParams()
  moveSlider()
}

async function setUpBlockNumberComponent() {
  const response = await api.getCurrentBlockTip()
  tipHeight = response.data
  shownBlockNumber = tipHeight
  blockNumber.textContent = shownBlockNumber.toLocaleString()
  const maxNoCubes = 25;
  for (let i = maxNoCubes - 1; i >= 0; i--) {
    const numberToAdd = shownBlockNumber - i
    const newCube = createCubeElement(numberToAdd)
    if (shownBlockNumber === numberToAdd) newCube.classList.add("focus")
    blocksList.appendChild(newCube)
  }
  // const cubes = document.querySelectorAll(".cube")
  // const observer = new IntersectionObserver((entries) => {
  //   entries.forEach((entry) => {
  //     console.log(entry.target)
  //   })
  // }, {threshold: 0})
  // cubes.forEach((cube) => {
  //   observer.observe(cube)
  // })
  updateTweetButton(shownBlockNumber, datetimePicker.value)
}

function setUpDateTimePicker() {
  datetimeSubmit.addEventListener('pointerdown', async () => {
    setErrorOn(false)
    const inputDateTime = datetimePicker.value
    //check its a valid date first
    const invalidDateTime = isNaN(Date.parse(inputDateTime))
    const loadingCube = createLoadingCubeElement()
    blockNumber.textContent = ""
    blockNumber.appendChild(loadingCube)
    let response
    try {
      response = await api.convertTimeToBlocks(inputDateTime)
    } catch {
      setErrorOn()
    }
    
    blockNumber.removeChild(blockNumber.lastChild)
    updateBlockNumber(response.data.blockHeight)
  })
  datetimePicker.value = new Date().toISOString().substring(0, 16) 
}

function createCubeElement(number) {
  const faceNames = [
    "front",
    "back",
    "right",
    "left",
    "top",
    "bottom"
  ]
  const typeMap = {
    "-1": "negative",
    "0": "zero",
    "1": "positive",
  }
  const type = typeMap[Math.sign(number).toString()]
  const newCube = document.createElement('div')
  newCube.classList.add("cube", type)
  faceNames.forEach((faceName) => {
    const newFaceElement = document.createElement('div')
    newFaceElement.classList.add("cube__face", `cube__face--${faceName}`)
    if(faceName === "front") newFaceElement.textContent = number.toLocaleString()
    newCube.appendChild(newFaceElement)
  })
  // This is the start of adding clock within the cubes
  // with inspiration from https://codepen.io/seheekim/pen/BKYGZp
  // const cylinder = document.createElement('div')
  // cylinder.classList.add("cylinder")
  // newCube.appendChild(cylinder)
  return newCube
}

function createLoadingCubeElement() {
  const faceNames = [
    "front",
    "back",
    "right",
    "left",
    "top",
    "bottom"
  ]
  const newCube = document.createElement('div')
  newCube.classList.add("cube", "positive", "mini")
  faceNames.forEach((faceName) => {
    const newFaceElement = document.createElement('div')
    newFaceElement.classList.add("cube__face", `cube__face--${faceName}`, "mini")
    newCube.appendChild(newFaceElement)
  })
  return newCube
}

function setUpDonationSection () {
  donationAddress.textContent = import.meta.env.VITE_DONATION_ADDRESS
}

function setUpApiDocsbutton () {
  const ApiDocsbutton = document.getElementById("api-docs-button")
  ApiDocsbutton.addEventListener("pointerdown", () => {
    if (infoOverlay.classList.contains('hide')) {
      coverableContent.classList.toggle("hide")
    }
    infoOverlay.classList.add("hide")
    apiOverlay.classList.toggle("hide")
  })
}

function setUpInfoButton () {
  const infoButton = document.getElementById("info-button")//.querySelector("span")
  infoButton.addEventListener("pointerdown", () => {
    if (apiOverlay.classList.contains('hide')) {
      coverableContent.classList.toggle("hide")
    }
    apiOverlay.classList.add("hide")
    infoOverlay.classList.toggle("hide")
  })
}

function setUpHomeButton () {
  const home = document.getElementById("home-button")
  home.addEventListener("pointerdown", () => {
    apiOverlay.classList.add("hide")
    infoOverlay.classList.add("hide")
    coverableContent.classList.remove("hide")
  })

}

function setErrorOn (setToOn = true) {
  const errorMessage = document.getElementById("error-message")
  if (setToOn) {
    datetimePicker.classList.add("error")
    errorMessage.classList.add("error")
    errorMessage.textContent = "An error occurred. Please try again."
  } else {
    datetimePicker.classList.remove("error")
    errorMessage.classList.remove("error")
  }
}

function moveSlider () {
  // const direction = 1
  //blocksList.classList.add("right-end")
  const focusedCube = document.querySelector(".focus")
  scrollIntoView(focusedCube, {
    behavior: 'smooth', 
    block: 'center', 
    inline: 'center',
  })
}

function updateBlockNumberFromQueryParam() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  const blocknumberValue = parseInt(urlSearchParams.get('blocknumber'))
  if (urlSearchParams.has('blocknumber') && Number.isInteger(blocknumberValue)) {
    updateBlockNumber(blocknumberValue);
  } else {
    setUpBlockNumberComponent()
  }
}

function updateQueryParams() {
  const urlSearchParams = new URLSearchParams(window.location.search);
  urlSearchParams.set('blocknumber', shownBlockNumber);
  window.history.replaceState({}, '', `?${urlSearchParams.toString()}`);
}

function updateTweetButton (blockNumber, time) {
  let datetimeObj = new Date(time)
  const dateTimeOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZoneName: 'short',
    hour: 'numeric',
    minute: 'numeric',
  }
  document.querySelector(".twitter-share-button").href = `https://twitter.com/intent/tweet?text=${datetimeObj.toLocaleString([], dateTimeOptions).replaceAll(",", " ")} is ${blockNumber} in blocktime. Convert your own time of interest into blocktime at&url=https://${window.location.host}?blocknumber=${blockNumber}`.replaceAll(" ", "%20")
}
