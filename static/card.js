const justTesting = true;

// Global to store logged-in user
// If F5 / refresh, need to figure out by calling server & look at "session"
let g_userid = undefined;
let g_username = undefined;
let g_login_register_flag = true;

// Stripe input "elements" to allow capture of sensitive credit card data (.e.g. CVV numbers)
let elements;
let elementsList = [];

/////////////////////////////////////////
// color manipulation functions
/////////////////////////////////////////

function computeHSL(red, green, blue) {
  r = red / 255;
  g = green / 255;
  b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (max + min) / 2;
  let hue = 0;
  let sat = 0;
  if (max != min) {
    const c = max - min;
    sat = c / (1 - Math.abs(2 * lum - 1));
    if (max == r) {
      hue = ((g - b) / c) % 6;
    } else if (max == g) {
      hue = (b - r) / c + 2;
    } else if (max == b) {
      hue = (r - g) / c + 4;
    }
  }
  hue *= 60;
  return [hue, sat, lum];
}

function RGBFromString(colorSpec) {
  return colorSpec
    .substring(4, colorSpec.length - 1)
    .replace(/ /g, "")
    .split(",");
}

function computeHSLFromRGBString(colorSpec) {
  const rgb = RGBFromString(colorSpec);
  const hsl = computeHSL(...rgb);
  return hsl;
}

/* Used mainly to see whether to make card text White or Black */
/* Uses old NTSC mapping conversion from color to grayscale  */
function computeBrightness(red, green, blue) {
  r = red / 255;
  g = green / 255;
  b = blue / 255;
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;
  return brightness;
}

function computeBrightnessFromRGBString(colorSpec) {
  const rgb = RGBFromString(colorSpec);
  const brightness = computeBrightness(...rgb);
  return brightness;
}

///////////////////////////////////////////////////////////////////
// changing colors on card
///////////////////////////////////////////////////////////////////

let cardColor = "rgb(102,102,102)";
let logoColor = "rgb(191,191,191)";
let textColor = "white";
let focusColor = "rgb(255, 255, 255, 0.3)";

// save colors in case mouse enters color change table, then leaves
let saveCardColor = cardColor;
let saveLogoColor = logoColor;
let changeColor = false; // are we changing colors & table is up?
let changeColorObject; // changing card or logo color?

// Fine color changes are done with set of grids.
//    Each grid has slightly different hue.
//    Rows change color saturation
//    Columns change color lightness
let changeColorFine = false; // "fine" color table for small changes in color
let fineTables;
const numFineRows = 7;
const numFineCols = 7;
const numFineTables = 5;

function changeCardColor(color) {
  cardColor = color;
  // determine white or black for text, depending on brightness of background
  const bright = computeBrightnessFromRGBString(color);
  if (bright > 0.55) {
    textColor = "black";
    focusColor = "rgb(0, 0, 0, 0.2)";
  } else {
    textColor = "white";
    focusColor = "rgb(255, 255, 255, 0.3)";
  }
  // change text colors on input fields
  const inputs = document.querySelectorAll(".card, .card-input");
  inputs.forEach(function (input) {
    input.style.backgroundColor = color;
    input.style.color = textColor;
  });
  // change colors for stripe input elements
  // don't change color of CVV code, keeps gray background no matter what
  for (el of elementsList.slice(0, 2)) {
    el.update({
      style: {
        base: {
          color: textColor,
          ":focus": {
            backgroundColor: focusColor,
          },
        },
      },
    });
  }
}

function changeLogoColor(color) {
  logoColor = color;
  document.querySelector(".upper-path").style.fill = color;
  document.querySelector(".lower-path").style.fill = color;
}

function leavePalette() {
  console.log("leave palette");
  if (changeColorObject == "card") {
    changeCardColor(saveCardColor);
  } else {
    changeLogoColor(saveLogoColor);
  }
}

function makeColorPalette() {
  colorPalette = document.querySelector(".color-palette");
  // const subDiv = document.createElement("div");
  // colorPalette.innerHTML = `<div class="color-palette-spot" style="background-color: hsl(150,100%,50%)>efg</div>`;
  colorPalette.innerHTML += `<div class="color-palette-spot" style="top: 195px; left: 344px; background-color: ${cardColor}"></div>`;
  for (let dist = 1; dist <= 3; dist++) {
    let step = (3.14159 * 2) / dist / 6;
    let offset = 0;
    if (dist == 2) {
      offset = -step / 2;
    } else if (dist == 3) {
      offset = -step;
    }
    for (let angle = 0; angle < 3.14 * 2; angle += step) {
      let x = Math.round(344.0 + Math.cos(angle + offset) * 12 * dist);
      let y = Math.round(195.0 - Math.sin(angle + offset) * 12 * dist);
      // console.log("dist: ", dist, "angle: ", angle, "x,y", x, y);
      colorPalette.innerHTML += `<div class="color-palette-spot" style="top: ${y}px; left: ${x}px; background-color: hsl(${
        angle * 60
      },100%,50%)"></div>`;
    }
    // console.log("dist: ", dist);
  }

  // colorPalette.innerHTML += `<div class="color-palette-spot" style="top: 187px; background-color: hsl(240,100%,50%)"></div>`;
  for (let div of colorPalette.querySelectorAll("div")) {
    div.addEventListener("mouseover", function (e) {
      const color = e.target.style.backgroundColor; // change color to cell's color from table
      // console.log(baseHue, baseSat, baseLum);
      if (changeColorObject == "card") {
        saveCardColor = cardColor;
        const [baseHue, baseSat, baseLum] = computeHSLFromRGBString(cardColor);
        changeCardColor(color);
      } else {
        saveLogoColor = logoColor;
        const [baseHue, baseSat, baseLum] = computeHSLFromRGBString(logoColor);
        changeLogoColor(color);
      }
      // saveCardColorChange(color); // save change to attached saved cards, db, etc.
    });
    div.addEventListener("click", function (e) {
      console.log("click!");
      event.stopPropagation();
      const color = e.target.style.backgroundColor;
      if (changeColorObject == "card") {
        changeCardColor(color);
        saveCardColorChange(color);
        saveCardColor = color;
      } else {
        changeLogoColor(color);
        saveLogoColorChange(color);
        saveLogoColor = color;
      }
      if (selectedCard) {
        updateCard(selectedCard);
      }
      setUpPaletteColors(document.querySelector(".color-palette"), true); // leave center color alone
    });
    div.addEventListener("mouseleave", leavePalette);
  }

  console.log(colorPalette);
}

// to allow user to change card and logo colors
function makeColorTable() {
  colorTable = document.querySelector(".color-table");
  // console.log(colorTable);
  for (let hue of [0, 30, 60, 120, 180, 210, 240, 270]) {
    const tr = document.createElement("tr");
    for (let lum of [10, 15, 25, 40, 50, 70, 80, 90]) {
      // rainbow colors - saturation 100%
      // use fine color table to change saturation
      tr.innerHTML += `<td class="color-cell" style="background-color: hsl(${hue},100%,${lum}%)"></td>`;
    }
    colorTable.appendChild(tr);
  }
  const tr = document.createElement("tr");
  for (let lum of [0, 15, 25, 40, 50, 75, 90, 100]) {
    // shades of gray
    tr.innerHTML += `<td class="color-cell" style="background-color: hsl(0,0%,${lum}%)"></td>`;
  }
  colorTable.appendChild(tr);
  for (td of colorTable.querySelectorAll("td")) {
    td.addEventListener("mouseover", function (e) {
      const color = e.target.style.backgroundColor; // change color to cell's color from table
      if (changeColorObject == "card") {
        changeCardColor(color);
        saveCardColorChange(color); // save change to attached saved cards, db, etc.
      } else if (changeColorObject == "logo") {
        changeLogoColor(color);
        saveLogoColorChange(color);
      }
    });
  }
  colorTable.addEventListener("mouseleave", leaveTable);
}

function makeFineColorTables() {
  let tables = [];
  for (k = 0; k < numFineTables; k++) {
    const table = document.createElement("TABLE");
    table.style.display = "none";
    table.classList.add("fine-table");
    for (let i = 0; i < numFineRows; i++) {
      const tr = document.createElement("TR");
      table.appendChild(tr);
      for (let j = 0; j < numFineCols; j++) {
        const td = document.createElement("TD");
        // td.classList.add("color-cell");
        td.classList.add("fine-color-cell");
        tr.appendChild(td);
      }
    }
    document
      .querySelector(".portal")
      .insertBefore(table, document.querySelector(".address"));
    for (td of table.querySelectorAll("td")) {
      td.addEventListener("mouseover", function (e) {
        const color = e.target.style.backgroundColor;
        if (changeColorObject == "card") {
          changeCardColor(color);
          saveCardColorChange(color);
        } else if ((changeColorObject = "logo")) {
          changeLogoColor(color);
          saveLogoColorChange(color);
        }
      });
    }
    table.addEventListener("mouseleave", leaveTable);
    tables.push(table);
  }
  return tables;
}

// Select "variations on a theme" to fill fine color tables using base (current) color.
function setColorsInFineTables(baseColor) {
  // console.log("basecolor: ", baseColor);
  const [baseHue, baseSat, baseLum] = computeHSLFromRGBString(baseColor);
  const cells = document.querySelectorAll(".fine-color-cell");
  let cellNum = 0;
  for (let k = 0; k < numFineTables; k++) {
    for (let i = 0; i < numFineRows; i++) {
      for (let j = 0; j < numFineCols; j++) {
        const hue = baseHue + (k - (numFineTables - 1) / 2) * 8;
        const sat = baseSat - (i - (numFineRows - 1) / 2) * 0.15;
        const lum = baseLum + (j - (numFineCols - 1) / 2) * 0.03;
        const newColor = `hsl(${hue}, ${sat * 100}%, ${lum * 100}%)`;
        cells[cellNum].style.backgroundColor = newColor;
        cellNum++;
      }
    }
  }
}

// if mouse leaves color table, revert to original color
function leaveTable() {
  if (changeColor || changeColorFine) {
    if (changeColorObject == "card") {
      changeCardColor(saveCardColor);
      saveCardColorChange(saveCardColor);
    } else if (changeColorObject == "logo") {
      changeLogoColor(saveLogoColor);
      saveLogoColorChange(saveLogoColor);
    }
  }
}

function setUpLogoAndColors() {
  // logoHtml is stored in separate js file, a minor alteration from an SVG file
  const logoDiv = document.querySelector(".logo");
  logoDiv.innerHTML = logoHtml;
  logoDiv.style.width = "90px";
  logoDiv.style.height = "90px";
  changeCardColor(cardColor);
  changeLogoColor(logoColor);
}

/////////////////////////////////////////////////////////////////////
// functions to show & hide color tables
/////////////////////////////////////////////////////////////////////

function showColorTable() {
  document.querySelector("table").classList.toggle("hidden");
  changeColor = true;
}

function hideColorTable() {
  document.querySelector("table").classList.toggle("hidden");
  changeColor = false;
  if (selectedCard) {
    updateCard(selectedCard);
  }
}

function showFineColorTables() {
  document.querySelectorAll(".fine-table").forEach(function (table) {
    table.style.display = "inline";
    table.classList.toggle("hidden");
  });
  let baseColor;
  if (changeColorObject == "card") {
    baseColor = cardColor;
  } else if (changeColorObject == "logo") {
    baseColor = logoColor;
  }
  setColorsInFineTables(baseColor);
  changeColorFine = true;
}

function hideFineColorTables() {
  document.querySelectorAll(".fine-table").forEach(function (table) {
    table.style.display = "none";
    table.classList.toggle("hidden");
  });
  changeColorFine = false;
  if (selectedCard) {
    updateCard(selectedCard);
  }
}

// hide buttons to declutter when putting up color tables
function Toggle_Buttons() {
  const buttons = document.querySelectorAll(".control-button");
  for (let button of buttons) {
    button.classList.toggle("hidden");
  }
}

/////////////////////////////////////////////////////////////////////
// Initialize colors & tables
/////////////////////////////////////////////////////////////////////

setUpLogoAndColors();
setUpFocusEventsForInputFields();
makeColorTable();
makeColorPalette();
makeFineColorTables();

let saveName;

// set focus/blur events to show proper background color for input fields
function setUpFocusEventsForInputFields() {
  // console.log("set up focus events");
  let inputs = document.querySelectorAll(".card-input");
  inputs.forEach(function (input) {
    // console.log("set up focus events for ", input);
    input.addEventListener("focus", function (e) {
      // console.log("change focus on input: ", input);
      if (e.target.classList.contains("card-name-input")) {
        saveName = document.querySelector("#card-name").value;
        if (selectedCard && selectedCard.pmID && !cardInputsShown) {
          showTempMessage(
            "Sorry - can't edit customer name - already attached to card.",
            (dur = 4000)
          );
          return;
        }
      }
      if (e.target.classList.contains("card-bank-name")) {
        e.target.style.opacity = "55%";
      }
      input.style.backgroundColor = focusColor;
    });
    input.addEventListener("blur", function (e) {
      if (e.target.classList.contains("card-bank-name")) {
        e.target.style.opacity = "35%";
      }
      input.style.backgroundColor = cardColor;
      if (e.target.classList.contains("card-name-input")) {
        if (
          !havePM ||
          !(
            document.querySelector("#card-name").value.toUpperCase() ===
            saveName
          )
        ) {
          // have card name now, see if can secure card details...
          console.log("saved:   ", saveName);
          console.log(
            "current: ",
            document.querySelector("#card-name").value.toUpperCase()
          );
          tryAcquirePM();
        }
      }
      if (selectedCard) {
        updateCard(selectedCard);
      }
    });
  });
  inputs = document.querySelectorAll(".address-input");
  inputs.forEach(function (input) {
    input.addEventListener("blur", function (e) {
      changeSmallInputField(input);
      if (selectedCard) {
        updateCard(selectedCard);
      }
    });
  });
}

document.querySelector("#main-card").addEventListener("click", function (e) {
  // console.log("click for card, e.target.id:", e.target.id);
  if (e.target.closest("#logo")) {
    // already handled by logo click event handler
    return;
  }
  if (e.target.id == "main-card") {
    // only use right (more empty) area of card for click to change colors
    if (e.pageX < 300) {
      return;
    }
    // console.log("x: ", e.pageX, "y: ", e.pageY);
    // if close to, but not right on CVV input field, do favor for user & set focus there
    if (
      !chargeButtonEnabled &&
      e.pageY > 268 &&
      e.pageY < 315 &&
      e.pageX > 334 &&
      e.pageX < 406
    ) {
      elementsList[2].focus();
      return;
    }
    // e.stopPropagation();
    // console.log("here I am in condition");
    // changeColorObject = "card";
    // if (!changeColor && !changeColorFine) {
    //   saveCardColor = cardColor;
    //   showColorTable();
    //   Toggle_Buttons();
    // } else if (changeColor) {
    //   saveCardColor = cardColor;
    //   hideColorTable();
    //   showFineColorTables();
    // } else if (changeColorFine) {
    //   hideFineColorTables();
    //   changeColorFine = false;
    //   Toggle_Buttons();
    // }
    clickOnCard();
  }
});

document.querySelector("#logo").addEventListener("click", function (e) {
  // console.log("click for logo");
  clickOnLogo();
  // changeColorObject = "logo";
  // if (!changeColor && !changeColorFine) {
  //   saveLogoColor = logoColor;
  //   showColorTable();
  //   Toggle_Buttons();
  // } else if (changeColor) {
  //   saveLogoColor = logoColor;
  //   hideColorTable();
  //   showFineColorTables();
  // } else if (changeColorFine) {
  //   hideFineColorTables();
  //   changeColorFine = false;
  //   Toggle_Buttons();
  // }
});

// differentiate if credit card info has already been entered & saved
function showStaticCardInfo(card) {
  // console.log("show static");
  switchBrandLogo(card.brand);
  document.querySelector("#card-number").style.display = "none";
  document.querySelector("#card-exp").style.display = "none";
  document.querySelector("#card-cvv").style.display = "none";
  document.querySelector("#last4").style.display = "inline";
  document.querySelector("#static-exp").style.display = "inline";
  document.querySelector("#static-exp").innerText = card.exp;
  document.querySelector("#last4").innerHTML =
    "&#x2022; &#x2022; &#x2022; " + card.last4;
  cardInputsShown = false;
}

function clearCardInputs() {
  switchBrandLogo("none");
  for (let el of elementsList) {
    el.clear();
  }
  document.querySelector("#card-name").removeAttribute("readonly");
}

function showCardInputFields() {
  document.querySelector("#last4").style.display = "none";
  document.querySelector("#card-number").style.display = "inline";
  document.querySelector("#card-exp").style.display = "inline";
  document.querySelector("#card-cvv").style.display = "inline";
  document.querySelector("#static-exp").style.display = "none";
  cardInputsShown = true;
}

let last4Clicked = false;

// allow user to modify entered & stored credit card info if click twice on last4 area
function clickOnLast4(e) {
  // console.log("click on last4");
  if (!last4Clicked) {
    // on first click, highlight
    e.target.style.backgroundColor = focusColor;
    e.target.style.color = "rgb(128,0,0)";
    last4Clicked = true;
    e.handled = true;
    showTempMessage("Click LAST4 again to clear card details.", (dur = 5000));
  } else {
    // on second click, erase card info
    // console.log("erase pm");
    last4Clicked = false;
    selectedCardDiv.querySelector(".small-brand-logo-div").innerHTML = "&nbsp;";
    clearCardInputs();
    showCardInputFields();
    selectedCard.pmID = "";
    selectedCard.brand = undefined;
    selectedCard.last4 = undefined;
    selectedCard.exp = undefined;
    switchSmallBrandLogo("");
    selectedCardDiv.querySelector(".small-card-last4").innerHTML = "&nbsp";
    updateCard(selectedCard);
    cardGood = false;
    disableChargeButton();
    showTempMessage("Cleared..", (dur = 2000));
  }
}

// called when click somewhere else on page
function unclickOnLast4() {
  last4Div = document.querySelector(".last4");
  last4Div.style.backgroundColor = cardColor;
  last4Div.style.color = textColor;
  last4Clicked = false;
}

document.querySelector(".last4").addEventListener("click", clickOnLast4);

document.querySelector("#static-exp").addEventListener("click", function (e) {
  showTempMessage(
    "Sorry - can't edit expiration, already attached to card.",
    (dur = 5000)
  );
  e.handled = true;
});

//////////////////////////////////////////////////////////
// save cards (like in a wallet) for later reference
//////////////////////////////////////////////////////////

class Card {
  constructor() {
    this.name = document.querySelector("#card-name").value.toUpperCase();
    this.bankName = document.querySelector("#bank-name").value;
    this.addressName = document.querySelector("#address-name").value;
    this.addressStreet1 = document.querySelector("#street").value;
    this.addressStreet2 = document.querySelector("#city-state-zip").value;
    this.cardColor = cardColor;
    this.logoColor = logoColor;
    this.textColor = textColor;
    if (cardGood && unsavedPM) {
      this.pmID = unsavedPM.paymentMethod.id;
      this.brand = unsavedPM.paymentMethod.card.brand;
      this.last4 = unsavedPM.paymentMethod.card.last4;
      this.exp = makeExp(
        unsavedPM.paymentMethod.card.exp_month,
        unsavedPM.paymentMethod.card.exp_year
      );
      unsavedPM = undefined;
    }
    // this.brand = currentBrand;
  }
}

let selectedCardDiv;
let selectedCard;
let highlightedCardDiv = null;

// functions to reflect changes on main card to small reps

function saveCardColorChange(color) {
  changeSmallCardColor(color);
}

function saveLogoColorChange(color) {
  changeSmallLogoColor(color);
}

//////

function changeSmallCardColor(color) {
  if (selectedCard) {
    selectedCardDiv.style.backgroundColor = color;
    selectedCard.cardColor = color;
    const bright = computeBrightnessFromRGBString(color);
    let textColor;
    if (bright > 0.55) {
      textColor = "black";
    } else {
      textColor = "white";
    }
    selectedCard.textColor = textColor;
    for (let field of selectedCardDiv.querySelectorAll(".small-card-text")) {
      field.style.color = textColor;
    }
  }
}

function changeSmallLogoColor(color) {
  if (selectedCard) {
    const logoElement = selectedCardDiv.querySelector(".small-logo");
    logoElement.querySelector(".upper-path").style.fill = color;
    logoElement.querySelector(".lower-path").style.fill = color;
    selectedCard.logoColor = color;
  }
}

function changeSmallInputField(input) {
  if (selectedCard) {
    if (input.classList.contains("address-name-input")) {
      selectedCard.addressName = input.value;
    } else if (input.classList.contains("address-street-input")) {
      selectedCard.addressStreet1 = input.value;
    } else if (input.classList.contains("address-city-state-zip-input")) {
      selectedCard.addressStreet2 = input.value;
    }
  }
}

//////////////////

document.addEventListener("click", function (e) {
  // console.log("general click", e);
  if (last4Clicked) {
    if (e.handled) {
      return;
    } else {
      unclickOnLast4();
    }
  }
  if (e.target.closest("#main-card")) {
    // already handled in main-card click handler
    return;
  }
  if (e.target.closest(".small-card")) {
    // already handled in small-card click handler
    return;
  }
  if (last4Clicked) {
    console.log("clear last 4 click");
    last4Clicked = false;
    document.querySelector(".last4").style.color = textColor;
    document.querySelector(".last4").style.backgroundColor = cardColor;
  }
  if (changeColorObject == "logo") {
    clickOnLogo();
    changeColorObject = null;
  } else if (changeColorObject == "card") {
    clickOnCard();
    changeColorObject = null;
  }

  if (changeColor) {
    hideColorTable();
    Toggle_Buttons();
  } else if (changeColorFine) {
    hideFineColorTables();
    Toggle_Buttons();
  }
  // if (e.pageX > 430) {
  //   // if click empty area on right side where small cards are, then deselect all
  //   if (selectedCard) {
  //     deselectSmallCard();
  //     clearCard();
  //   }
  // }
});

function divForBrand(brand) {
  // console.log("get div from brand: ", brand);
  const brandDiv = document.createElement("div");
  if (brand == "mastercard") {
    brandDiv.innerHTML = `<div class="small-brand-logo-div">
      <img
       class="small-mastercard-logo"
        src="static/images/mastercard.svg"
     ></img>
    </div>`;
  } else if (brand == "visa") {
    brandDiv.innerHTML = `<div class="small-brand-logo-div">
      <img
       class="small-visa-logo"
        src="static/images/visa.svg"
     ></img>
    </div>`;
  } else if (brand == "discover") {
    brandDiv.innerHTML = `<div class="small-brand-logo-div">
      <img
       class="small-discover-logo"
        src="static/images/discover.svg"
     ></img>
    </div>`;
  } else if (brand == "amex") {
    brandDiv.innerHTML = `<div class="small-brand-logo-div">
      <img
       class="small-amex-logo"
        src="static/images/amex.svg"
     ></img>
    </div>`;
  } else return null;
  return brandDiv;
}

let savedCards = [];
let cardInputsShown = true;

// if user clicks on small card rep on right, allow user to see & edit that stored card
function loadCard(card) {
  document.querySelector("#card-name").value = card.name;
  document.querySelector("#bank-name").value = card.bankName;
  document.querySelector("#address-name").value = card.addressName;
  document.querySelector("#street").value = card.addressStreet1;
  document.querySelector("#city-state-zip").value = card.addressStreet2;
  changeCardColor(card.cardColor);
  changeLogoColor(card.logoColor);
  if (card.pmID) {
    showStaticCardInfo(card);
    enableChargeButton();
    havePM = true;
    document.querySelector("#card-name").setAttribute("readonly", true);
  } else {
    clearCardInputs();
    showCardInputFields(card);
    disableChargeButton();
    havePM = false;
    document.querySelector("#card-name").removeAttribute("readonly");
  }
}

function selectCard(card) {
  // console.log("select card: ", card);
  if (selectedCard && selectedCard.pmID) {
    // console.log("select new, clear inputs");
    clearCardInputs();
  }
  selectedCard = card;
  if (selectedCardDiv) {
    selectedCardDiv
      .querySelector(".small-card-outline")
      .classList.toggle("small-card-outline-selected");
  }
  selectedCardDiv = card.div;
  selectedCardDiv
    .querySelector(".small-card-outline")
    .classList.toggle("small-card-outline-selected");
  last4Clicked = false;
}

function selectAndLoadCard(card) {
  if (selectedCard == card) {
    return;
  }
  if (changeColorObject) {
    const palette = document.querySelector(".color-palette");
    palette.classList.add("hidden");
    changeColorObject = null;
  }
  selectCard(card);
  loadCard(card);
  showPayments();
}

function cardFiltered(card) {
  const filterString = document.querySelector("#filter").value.toUpperCase();
  // console.log("filter: ", filterString, "spec: ", card.spec);
  const cardSpec = card.spec;
  if (cardSpec.indexOf(filterString) == -1) {
    // console.log("filtered");
    return true;
  } else {
    // console.log("not filtered");
    return false;
  }
}

function hideAndShowCardsForFilter() {
  for (let card of savedCards) {
    const filterIt = cardFiltered(card);
    const visible = card.div.shown;
    if (filterIt && visible) {
      // console.log("hide: ", card.bankName);
      card.div.style.opacity = 0;
      let pastIt = false;
      for (let card2 of savedCards) {
        if (card == card2) {
          pastIt = true;
          card.div.position -= 0.5;
        } else if (pastIt) {
          card2.div.position--;
          card2.div.style.transform = `translate(0px, ${
            card2.div.position * 112
          }px)`;
        }
      }
      card.div.shown = false;
      card.div.style.pointerEvents = "none";
    } else if (!filterIt && !visible) {
      card.div.style.opacity = 1;
      console.log("show: ", card.bankName);
      let pastIt = false;
      for (let card2 of savedCards) {
        if (card == card2) {
          pastIt = true;
          card.div.position += 0.5;
          card2.div.style.transform = `translate(0px, ${
            card2.div.position * 112
          }px)`;
        } else if (pastIt) {
          card2.div.position++;
          card2.div.style.transform = `translate(0px, ${
            card2.div.position * 112
          }px)`;
        }
      }
      card.div.shown = true;
      card.div.style.pointerEvents = "auto";
    }
  }
}

function hideAndShowCardsForFilterBad() {
  for (let card of savedCards) {
    const filterIt = cardFiltered(card);
    const visible = card.div.shown;
    if (filterIt && visible) {
      console.log("hide: ", card.bankName);
      card.div.style.opacity = 0;
      for (let card2 of savedCards) {
        if (card != card2) {
          if (card2.div.position > card.div.position) {
            card2.div.position--;
            card2.div.style.transform = `translate(0px, ${
              card2.div.position * 112
            }px)`;
          }
        }
      }
      card.div.shown = false;
      card.div.style.pointerEvents = "none";
    } else if (!filterIt && !visible) {
      card.div.style.opacity = 1;
      for (let card2 of savedCards) {
        if (card != card2) {
          if (card2.div.position >= card.div.position) {
            card2.div.position++;
            card2.div.style.transform = `translate(0px, ${
              card2.div.position * 112
            }px)`;
          }
        }
      }
      card.div.shown = true;
      card.div.style.pointerEvents = "auto";
    }
  }
}

document.querySelector("#filter").addEventListener("keyup", function () {
  // console.log("filter keydown");
  hideAndShowCardsForFilter();
});

function getCardSpec(card) {
  let spec = (
    card.name +
    " " +
    card.bankName +
    " " +
    card.addressStreet1 +
    " " +
    card.addressStreet2 +
    " " +
    card.addressName
  ).toUpperCase();
  if (card.last4 != undefined && card.last4 != -1) {
    spec += (" " + card.last4).toUpperCase() + " " + card.exp;
  }
  // console.log(spec);
  return spec;
}

function highlightCardDiv(cardDiv) {
  // console.log("set opacity (highlight) for ", cardDiv.card);
  cardDiv.style.opacity = 1;
  cardDiv.style.zIndex = "20";
  cardDiv.style.boxShadow = "0 0 35px 20px #fffa";
}

function dehighlightCardDiv(cardDiv) {
  // console.log("dehighlight: ", cardDiv);
  if (!cardDiv.shown) {
    return;
  }
  // console.log("set opacity (dehighlight) for ", cardDiv.card);
  cardDiv.style.opacity = 1;
  cardDiv.style.zIndex = 0;
  cardDiv.style.boxShadow = "0 0 35px 20px #fff0";

  // setTimeout(() => {
  //   cardDiv.style.zIndex = 0;
  // }, 200);
}

let mouseIsDown = false;
let mouseDownX = 0;
let mouseDownY = 0;
let mouseCardDiv = null;
let dragCardIndex = 0;

function checkSmallCardPlacements(mouseY) {
  const nodeList = document.querySelectorAll(".small-card");
  // console.log("check: ", dragIndex, " ", mouseY);
  for (const node of nodeList) {
    if (node.shown) {
      if (mouseCardDiv.position > node.position) {
        if (mouseY < node.midY + 30) {
          if (node.flowOffset != 1) {
            console.log(node.card.bankName, " goes down");
            node.flowOffset = 1;
            node.style.transform = `translate(0px, ${
              (node.position + 1) * 112
            }px)`;
          }
        } else if (node.flowOffset != 0) {
          console.log(node.card.bankName, " goes back up");
          node.flowOffset = 0;
          node.style.transform = `translate(0px, ${node.position * 112}px)`;
        }
      } else if (mouseCardDiv.position < node.position) {
        // console.log(node.cardIndex, " is lower");
        if (mouseY > node.midY - 30) {
          if (node.flowOffset != -1) {
            console.log(node.card.bankName, " goes up");
            node.flowOffset = -1;
            node.style.transform = `translate(0px, ${
              (node.position - 1) * 112
            }px)`;
          }
        } else if (node.flowOffset != 0) {
          console.log(node.card.bankName, " goes back down");
          node.flowOffset = 0;
          node.style.transform = `translate(0px, ${node.position * 112}px)`;
        }
      }
    }
  }
}

function setUpSmallCardGeometries() {
  const nodeList = document.querySelectorAll(".small-card");
  // console.log("nodelist: ", nodeList);
  let count = 0;
  let position = 0;
  for (const node of nodeList) {
    node.cardIndex = count;
    if (node.hidden) {
      node.midY = -999;
    } else {
      node.midY = 112 * node.position + 211;
      position++;
    }
    node.flowOffset = 0;
    count++;
    // console.log(
    //   " pos: ",
    //   node.position,
    //   "     midY: ",
    //   node.midY,
    //   "hidden: ",
    //   node.hidden,
    //   "bank: ",
    //   node.card.bankName
    // );
  }
}

function showNodes() {
  const nodeList = document.querySelectorAll(".small-card");
  for (const node of nodeList) {
    console.log(
      "card-index: ",
      node.cardIndex,
      "index: ",
      node.card.index,
      "position: ",
      node.position,
      " name: ",
      node.card.bankName,
      "midY: ",
      node.midY
    );
  }
}

function reIndex() {
  for (let i = 0; i < savedCards.length; i++) {
    savedCards[i].index = i;
    updateCard(savedCards[i]);
  }
}

function makeVisiblesArray(nodelist) {
  let a = [];

  for (const node of nodelist) {
    const index = node.cardIndex + node.moveIndex;
    a[index] = !node.hidden;
    console.log("setting ", index, " to ", a[index]);
  }
  return a;
}

function getNewOffset(node, a, flowOffset) {
  console.log("node: ", node, "array: ", a);
  console.log("flow: ", flowOffset);
  let acc = 0;
  let flowOffsetLeft = flowOffset;
  let currentPosition = node.cardIndex + node.moveIndex;
  console.log("cur: ", currentPosition);
  while (
    flowOffsetLeft != 0 &&
    currentPosition >= 0 &&
    currentPosition <= 100
  ) {
    console.log("flow left: ", flowOffsetLeft);
    if (flowOffset > 0) {
      currentPosition++;
      acc++;
      if (a[currentPosition]) {
        flowOffsetLeft--;
      }
    } else {
      currentPosition--;
      acc--;
      if (a[currentPosition]) {
        flowOffsetLeft++;
      }
    }
  }
  console.log("accumulated flow move: ", acc);
  return acc;
}

// stable (bubble) sort cards depending on new positions
// important in order to preserve changed positions with filtering going
function reSortSavedCards() {
  console.log("re-sorting");
  let wasSwap;
  const size = savedCards.length;
  for (let i = 0; i < size; i++) {
    wasSwap = false;
    for (let j = 0; j < size - 1; j++) {
      // console.log("comparing ", j, " with ", j + 1);
      if (savedCards[j].div.position > savedCards[j + 1].div.position) {
        // console.log("flipping ", j, " with ", j + 1);
        const temp = savedCards[j];
        savedCards[j] = savedCards[j + 1];
        savedCards[j + 1] = temp;
        wasSwap = true;
      }
    }
    if (!wasSwap) {
      return;
    }
  }
}

function updatedMoveds() {
  const size = savedCards.length;
  for (let i = 0; i < size; i++) {
    if (savedCards[i].moved) {
      console.log(savedCards[i].bankName, " moved.");
      savedCards[i].index = i;
      updateCard(savedCards[i]);
    }
  }
}

// create DOM rep for small card in "wallet" at right
function makeCardDiv(card, isNew) {
  const div = document.createElement("div");
  div.innerHTML = `
    <div class="small-card-outline"> </div>
    <div class="small-hstreet-logo" id="logo">
      <div class="small-logo"></div>
    </div>
    <div class="small-card-bank-name small-card-text"> </div>
    <div class="small-card-last4 small-card-text"> &nbsp;</div>
    <div class="small-card-exp small-card-text"> &nbsp;</div>
    <div class="small-card-name small-card-text"> </div>`;
  div.classList.add("small-card");
  // console.log(div);
  card.div = div;
  div.card = card;
  div.position = card.index;
  div.shown = true;
  div.style.transition =
    "box-shadow 0.2s ease, transform 0.6s ease, opacity 0.5s ease";
  if (isNew) {
    div.style.transform = `translate(0px, ${div.position * 112}px)`;
  } else {
    div.style.transform = `translate(0px, 0px)`;
    setTimeout(() => {
      div.style.transform = `translate(0px, ${div.position * 112}px)`;
    }, 50);
  }
  div.style.backgroundColor = card.cardColor;
  const logoElement = div.querySelector(".small-logo");
  logoElement.innerHTML = logoHtml;
  logoElement.style.width = "36px";
  logoElement.style.height = "36px";
  logoElement.querySelector(".upper-path").style.fill = card.logoColor;
  logoElement.querySelector(".lower-path").style.fill = card.logoColor;
  div.querySelector(".small-card-name").innerText = card.name;
  if (card.bankName.length > 8) {
    div.querySelector(".small-card-bank-name").style.fontSize = "0.9em";
  }
  div.querySelector(".small-card-bank-name").innerText = card.bankName;

  if (card.last4 && card.last4 != "-1") {
    div.querySelector(".small-card-last4").innerHTML =
      "&#x2022; &#x2022; &#x2022; " + card.last4;
    div.querySelector(".small-card-exp").innerText = card.exp;
  }
  for (let field of div.querySelectorAll(".small-card-text")) {
    field.style.color = card.textColor;
  }
  if (card.brand) {
    // console.log("brand: ", card.brand);
    const brandDiv = divForBrand(card.brand);
    if (divForBrand) {
      div.appendChild(brandDiv);
    }
  }
  div.addEventListener("mousedown", function (e) {
    // console.log("click on div");
    const cardDiv = e.target.closest(".small-card");
    mouseIsDown = true;
    mouseCardDiv = cardDiv;
    mouseDownX = e.pageX;
    mouseDownY = e.pageY;
    dragCardIndex = Math.trunc((mouseDownY - 155) / 112.0);
    console.log(
      "mouse down: ",
      mouseDownX,
      " ",
      mouseDownY,
      "index: ",
      dragCardIndex
    );
    // cardDiv.style.transform = `translate(0px, ${cardDiv.position * 112}px)`;
    cardDiv.style.transition = "box-shadow 0.2s ease, opacity 0.5s ease"; // null out slow transform/translate motion, make immediate
    setUpSmallCardGeometries();
  });
  div.addEventListener("mouseup", function (e) {
    // const visiblesArray = makeVisiblesArray(
    //   document.querySelectorAll(".small-card")
    // );

    // let filter = document.querySelector("#filter").value;
    // console.log("filter: ", filter);
    const cardDiv = e.target.closest(".small-card");
    if (true) {
      // console.log("click on div");
      const nodeList = document.querySelectorAll(".small-card");
      let acc = 0;
      for (const node of nodeList) {
        node.card.moved = false;
      }
      for (const node of nodeList) {
        if (node != cardDiv && node.shown) {
          if (node.flowOffset) {
            node.position += node.flowOffset;
            console.log(
              "position ",
              node.position,
              " for ",
              node.card.bankName
            );
            acc += node.flowOffset;
            if (node.flowOffset) {
              node.card.moved = true;
              if (false) {
                node.card.index = node.position;
                updateCard(node.card);
              }
            }
          }
        }
      }
      console.log("offset tot: ", acc);
      cardDiv.position += -acc;
      console.log(
        "position ",
        cardDiv.position,
        " for ",
        cardDiv.card.bankName
      );
      if (acc != 0) {
        // let newOffset = getNewOffset(cardDiv, visiblesArray, acc);
        cardDiv.card.moved = true;
        if (false) {
          cardDiv.card.index = cardDiv.position;
          updateCard(cardDiv.card); // sync with db for proper indexes
        }
      }
      reSortSavedCards();
      updatedMoveds();
      mouseCardDiv = null;
    }
    cardDiv.style.transform = `translate(0px, ${cardDiv.position * 112}px)`;
    cardDiv.style.transition =
      "box-shadow 0.2s ease, transform 0.6s ease, opacity 0.5s ease";
    mouseIsDown = false;
    // showNodes();
    console.log("mouse up");
  });
  div.addEventListener("click", function (e) {
    // console.log("click on div");
    const cardDiv = e.target.closest(".small-card");
    if (selectedCardDiv) {
      dehighlightCardDiv(selectedCardDiv);
    }
    if (!cardDiv) {
      return;
    }
    if (!selectedCard) {
      if (
        document.querySelector("#card-name").value ||
        document.querySelector("#bank-name").value ||
        document.querySelector("#street").value ||
        document.querySelector("#city-state-zip").value ||
        unsavedPM
      ) {
        const confirmed = confirm("This will erase current edits. Continue?");
        if (!confirmed) {
          return;
        }
      }
    }
    selectAndLoadCard(cardDiv.card);
    cardDiv
      .querySelector(".small-card-outline")
      .classList.toggle("small-card-outline-selected");
    if (selectedCardDiv) {
      selectedCardDiv
        .querySelector(".small-card-outline")
        .classList.toggle("small-card-outline-selected");
    }
    highlightCardDiv(cardDiv);
  });
  document.querySelector(".saved-cards").appendChild(div);
  card.spec = getCardSpec(card);
  // if (cardFiltered(card)) {
  //   div.classList.add("hidden");
  // }
  div.moveIndex = 0;
  return div;
}

function saveCard(card, isNew) {
  savedCards.push(card);
  card.index = savedCards.length - 1;
  makeCardDiv(card, isNew);
}

function deselectSmallCard() {
  if (selectedCardDiv) {
    selectedCardDiv
      .querySelector(".small-card-outline")
      .classList.toggle("small-card-outline-selected");
    selectedCardDiv = undefined;
    selectedCard = undefined;
    if (!cardInputsShown) {
      showCardInputFields();
    }
    disableChargeButton();
    last4Clicked = false;
    document.querySelector(".receipts").innerHTML = "";
  }
}

function newCard() {
  // if (cardGood) {
  //   const token = await generateStripeToken();
  //   c.token = token;
  // }
  if (selectedCard) {
    deselectSmallCard();
  }
  clearCard();
  c = new Card();
  saveCard(c, true); // isNew
  selectCard(c);
  postNewCard(g_userid, c);

  const newCard = document.querySelector(".new-card");
  newCard.style.transform = `translate(0px, ${savedCards.length * 112}px)`;
}

document.querySelector("#save").addEventListener("click", function (e) {
  // console.log("save card");
  // save new card
  c = new Card();
  // if (cardGood) {
  //   const token = await generateStripeToken();
  //   c.token = token;
  // }
  if (selectedCard) {
    deselectSmallCard();
  }
  saveCard(c, true); // isNew
  selectCard(c);
  postNewCard(g_userid, c);

  const newCard = document.querySelector(".new-card");
  newCard.style.transform = `translate(0px, ${savedCards.length * 112}px)`;

  // } else {
  //   // updating already saved card, may need new token
  //   const token = await generateStripeToken();
  //   selectedCard.token = token;
  //   // update last 4 on saved small
  //   selectedCardDiv.querySelector(".small-card-last4").innerHTML =
  //     "&#x2022; &#x2022; &#x2022; " + token.last4;
  // }
  // deselectSmallCard();
  // clearCard();
});

function clearCard() {
  let cardColor = "rgb(206,206,206)";
  let logoColor = "rgb(152,152,152)";
  let textColor = "white";
  let focusColor = "rgb(255, 255, 255, 0.3)";
  changeCardColor(cardColor);
  changeLogoColor(logoColor);
  if (selectedCard) {
  }
  for (let input of document.querySelectorAll(".card-input")) {
    input.value = "";
  }
  for (let input of document.querySelectorAll(".address-input")) {
    input.value = "";
  }
  document.querySelector("#amount").value = "";
  clearCardInputs();
  showCardInputFields();
}

function reindexCards() {
  let i = 0;
  for (let card of savedCards) {
    card.index = i;
    i++;
  }
}

document.querySelector("#delete").addEventListener("click", function (e) {
  if (selectedCard) {
    deleteCard(selectedCard);
    const index = selectedCard.index;
    // console.log("index: ", index);
    savedCards.splice(index, 1);
    // console.log("saved cards", savedCards);
    reindexCards(); // need to reassign index values
    selectedCardDiv.remove();
    for (let card of savedCards) {
      if (card.index >= index) {
        card.div.position--;
        card.div.style.transform = `translate(0px, ${
          card.div.position * 112
        }px)`;
      }
    }
    if (!document.querySelector("#filter").value && savedCards.length > 0) {
      if (index == savedCards.length) {
        selectAndLoadCard(savedCards[index - 1]);
      } else {
        selectAndLoadCard(savedCards[index]);
      }
    } else {
      deselectSmallCard();
      clearCard();
    }
    const newCard = document.querySelector(".new-card");
    newCard.style.transform = `translate(0px, ${savedCards.length * 112}px)`;
    return;
  }
});

// using arrow keys to select card or move cards around

function selectNextCard() {
  let newIndex;
  if (!selectedCard) {
    newIndex = 0;
  } else if (selectedCard.index == savedCards.length - 1) {
    deselectSmallCard();
    clearCard();
    return;
  } else {
    newIndex = selectedCard.index + 1;
  }
  selectAndLoadCard(savedCards[newIndex]);
}

function selectPreviousCard() {
  let newIndex;
  if (!selectedCard) {
    newIndex = savedCards.length - 1;
  } else if (selectedCard.index == 0) {
    deselectSmallCard();
    clearCard();
    return;
  } else {
    newIndex = selectedCard.index - 1;
  }
  selectAndLoadCard(savedCards[newIndex]);
}

function pushCardDown() {
  if (!selectedCard || selectedCard.index == savedCards.length - 1) {
    return;
  }
  if (document.querySelector("#filter").value) {
    showTempMessage(
      "Sorry - can't shift cards with filter in place.",
      (dur = 2000)
    );
    return;
  }
  // console.log("push card down");
  selectedCardDiv.parentNode.insertBefore(
    selectedCardDiv,
    selectedCardDiv.nextSibling.nextSibling
  );
  {
    const ind = selectedCard.index;
    const tempCard = savedCards[ind];
    savedCards[ind] = savedCards[ind + 1];
    savedCards[ind + 1] = tempCard;
    savedCards[ind].index = ind;
    savedCards[ind + 1].index = ind + 1;
    updateCard(savedCards[ind]); // sync with db for proper indexes
    updateCard(savedCards[ind + 1]);
  }
}

function pushCardUp() {
  if (!selectedCard || selectedCard.index == 0) {
    return;
  }
  if (document.querySelector("#filter").value) {
    showTempMessage(
      "Sorry - can't shift cards with filter in place.",
      (dur = 2000)
    );
    return;
  }
  // console.log("push card up");
  selectedCardDiv.parentNode.insertBefore(
    selectedCardDiv,
    selectedCardDiv.previousSibling
  );
  {
    const ind = selectedCard.index;
    const tempCard = savedCards[ind];
    savedCards[ind] = savedCards[ind - 1];
    savedCards[ind - 1] = tempCard;
    savedCards[ind].index = ind;
    savedCards[ind - 1].index = ind - 1;
    updateCard(savedCards[ind]); // sync with db for proper indexes
    updateCard(savedCards[ind - 1]);
  }
}

document.addEventListener("keydown", function (e) {
  // if (e.key == "c") {
  //   console.log("pressed c");
  //   doPressC();
  // } else if (e.key == "d") {
  //   doPressD();
  // }
  if (e.key == "ArrowDown") {
    if (e.shiftKey) {
      // console.log("shift down");
      pushCardDown();
    } else {
      // console.log("arrow down");
      e.preventDefault();
      selectNextCard();
    }
  } else if (e.key == "ArrowUp") {
    if (e.shiftKey) {
      // console.log("shift up");
      pushCardUp();
    } else {
      // console.log("arrow down");
      e.preventDefault();
      selectPreviousCard();
    }
  }
});

const paletteTable = [
  [10, 0, 0],
  [0, 0, 0.02],
  [0, 0.15, 0],
  [-10, 0, 0],
  [0, 0, -0.02],
  [0, -0.15, 0],
  [25, 0, 0],
  [40, 0, 0],
  [0, 0, 0.05],
  [0, 0, 0.1],
  [0, 0.4, 0],
  [0, 0.6, 0],
  [-25, 0, 0],
  [-40, 0, 0],
  [0, 0, -0.05],
  [0, 0, -0.1],
  [0, -0.4, 0],
  [0, -0.6, 0],
  /* fixed, below here */
  [0, 0, 0.4],
  [0, 1, 0.85],
  [0, 1, 0.5],
  [0, 1, 0.25],
  [30, 1, 0.85],
  [30, 1, 0.5],
  [30, 1, 0.25],
  [60, 1, 0.5],
  [60, 1, 0.85],
  [120, 1, 0.25],
  [120, 1, 0.5],
  [120, 1, 0.85],
  [240, 1, 0.25],
  [240, 1, 0.5],
  [215, 1, 0.85],
  [270, 1, 0.5],
  [270, 1, 0.85],
  [0, 0, 0.7],
];

function handleColorForPaletteSpot(div, i, [hue, sat, lum]) {
  // div.style.backgroundColor = "#888";
  if (i <= 18) {
    const newHue = hue + paletteTable[i - 1][0];
    const newSat = sat + paletteTable[i - 1][1];
    const newLum = lum + paletteTable[i - 1][2];
    div.style.backgroundColor = `hsl(${newHue}, ${newSat * 100}%, ${
      newLum * 100
    }%)`;
  } else {
    const newHue = paletteTable[i - 1][0];
    const newSat = paletteTable[i - 1][1];
    const newLum = paletteTable[i - 1][2];
    div.style.backgroundColor = `hsl(${newHue}, ${newSat * 100}%, ${
      newLum * 100
    }%)`;
  }
}

function setUpPaletteColors(palette, leaveCenter) {
  // leaveCenter, on clicking, leave center to go back, if needed later
  // console.log(palette);
  let color;
  console.log("object: ", changeColorObject);
  if (changeColorObject == "card") {
    color = cardColor;
  } else {
    color = logoColor;
  }
  if (!leaveCenter) {
    const centerDiv = palette.querySelector("div");
    centerDiv.style.backgroundColor = color;
  }
  base = computeHSLFromRGBString(color);
  console.log(base);
  const allDivs = palette.querySelectorAll("div");
  for (let i = 1; i < 37; i++) {
    handleColorForPaletteSpot(allDivs[i], i, base);
  }
}

// function doPressC() {
//   const palette = document.querySelector(".color-palette");
//   changeColorObject = "card";
//   if (palette.classList.contains("hidden")) {
//     setUpPaletteColors(palette);
//     palette.classList.remove("hidden");
//   } else {
//     palette.classList.add("hidden");
//     changeColorObject = null;
//   }
// }

function clickOnCard() {
  console.log("click on card");
  const palette = document.querySelector(".color-palette");
  changeColorObject = "card";
  if (palette.classList.contains("hidden")) {
    setUpPaletteColors(palette, false); // change center color
    palette.classList.remove("hidden");
    switchBrandLogo(null);
  } else {
    palette.classList.add("hidden");
    changeColorObject = null;
    switchBrandLogo(selectedCard.brand);
  }
}

// function doPressD() {
//   const palette = document.querySelector(".color-palette");
//   changeColorObject = "logo";
//   if (palette.classList.contains("hidden")) {
//     setUpPaletteColors(palette);
//     palette.classList.remove("hidden");
//     switchBrandLogo(null);
//   } else {
//     palette.classList.add("hidden");
//     switchBrandLogo(selectedCard.brand);
//   }
// }

function clickOnLogo() {
  const palette = document.querySelector(".color-palette");
  changeColorObject = "logo";
  if (palette.classList.contains("hidden")) {
    setUpPaletteColors(palette, false); // change center color
    palette.classList.remove("hidden");
    switchBrandLogo(null);
  } else {
    palette.classList.add("hidden");
    switchBrandLogo(selectedCard.brand);
  }
}

///////////////////////////////////////////////////////////////////////////

// some functions to help user on front-end (3-line addresses, '$' in charge amount field, etc.)

let streetInputLines = 1;

function countChars(char, str) {
  let acc = 0;
  for (i = 0; i < str.length; i++) {
    if (str[i] == char) {
      acc++;
    }
  }
  return acc;
}

function fixForOneLineStreetInput() {
  document.querySelector("#address-name").style.top = "0px";
  document.querySelector("#street").style.top = "1px";
  document.querySelector("#street").rows = 1;
  document.querySelector("#city").style.top = "-2px";
}

function fixForTwoLinesStreetInput() {
  document.querySelector("#address-name").style.top = "-5px";
  document.querySelector("#street").style.top = "-6px";
  document.querySelector("#street").rows = 2;
  document.querySelector("#city").style.top = "-12px";
}

document.querySelector("#street").addEventListener("keyup", function () {
  const numberOfLines =
    countChars("\n", document.querySelector("#street").value) + 1;
  if (numberOfLines != streetInputLines) {
    if (numberOfLines == 2) {
      fixForTwoLinesStreetInput();
    } else if (numberOfLines == 1) {
      fixForOneLineStreetInput();
    }
    streetInputLines = numberOfLines;
  }
  // console.log("editing in street address", numberOfLines);
});

function capString(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function capitalize(str) {
  const words = str.split(" ");
  const capped = words.map(function (word) {
    // console.log(word);
    return capString(word);
  });
  const joined = capped.join(" ");
  return joined;
}

function checkAddressName() {
  const cardName = document.querySelector("#card-name").value.toUpperCase();
  const addrName = document.querySelector("#address-name").value.toUpperCase();
  // console.log(cardName, addrName);
  if (
    addrName == "" ||
    addrName === cardName.slice(0, -1) ||
    addrName.slice(0, -1) === cardName
  ) {
    if (cardName.toUpperCase() === cardName) {
      document.querySelector("#address-name").value = capitalize(cardName);
    } else {
      document.querySelector("#address-name").value = cardName;
    }
  }
}

function saveCardName(name) {
  if (selectedCard && selectedCard.pmID) {
    return;
  }
  const newName = name.toUpperCase();
  // console.log("save card name: ", newName);
  if (selectedCard) {
    selectedCard.name = newName;
    selectedCard.addressName = document.querySelector(
      ".address-name-input"
    ).value;
    selectedCardDiv.querySelector(".small-card-name").innerText = newName;
  }
}

function saveCardBankName(name) {
  if (selectedCard) {
    selectedCard.bankName = name;
    if (name.length > 8) {
      selectedCardDiv.querySelector(".small-card-bank-name").style.fontSize =
        "0.9em";
    } else {
      selectedCardDiv.querySelector(".small-card-bank-name").style.fontSize =
        "1.2em";
    }
    selectedCardDiv.querySelector(".small-card-bank-name").innerText = name;
  }
}

document.querySelector("#card-name").addEventListener("keydown", function (e) {
  checkAddressName();
});

document.querySelector("#card-name").addEventListener("keyup", function (e) {
  checkAddressName();
  saveCardName(e.target.value);
});

document
  .querySelector(".card-bank-name")
  .addEventListener("keyup", function (e) {
    saveCardBankName(e.target.value);
  });

function checkAmount() {
  // console.log("check amount");
  amountElement = document.querySelector("#amount");
  // amountElement.value = "$ 45.00";
  if (amountElement.value[0] != "$") {
    amountElement.value = "$" + amountElement.value;
  }
  if (amountElement.value[1] != " ") {
    amountElement.value = "$ " + amountElement.value.slice(1, 99);
  }
}

document.querySelector("#amount").addEventListener("keydown", function (e) {
  checkAmount();
});

///////////////////////////////////////////////////////////////////

// Functions related to Stripe interface, what to do when hit charge button, etc.

let stripe;
if (justTesting) {
  stripe = Stripe(
    "pk_test_51OtXzDBKOM7KLRhMXwT5XSCqJINN8uorbh2JoLWcNP3IJpJnfVWjkD5kBqzQyoJgXpJsfdr8Sh0RnreDORfqauVE00TxpI2nFw"
  );
} else {
  stripe = Stripe(
    "pk_live_51OtXzDBKOM7KLRhMaRHRNKwHdNVhZPxYt0PkUsGFxX6RLinIRZgsfflHUhuIoigwqFqRFYc8vCqMzGIC4zWJsBZB00HtDFLvla"
  );
}

// for testing
//  stripe = Stripe(
//   "pk_test_51OtXzDBKOM7KLRhMXwT5XSCqJINN8uorbh2JoLWcNP3IJpJnfVWjkD5kBqzQyoJgXpJsfdr8Sh0RnreDORfqauVE00TxpI2nFw"
// );

// for live:
// const stripe = Stripe(
//   "pk_live_51OtXzDBKOM7KLRhMaRHRNKwHdNVhZPxYt0PkUsGFxX6RLinIRZgsfflHUhuIoigwqFqRFYc8vCqMzGIC4zWJsBZB00HtDFLvla"
// );

let currentBrand;

function switchBrandLogo(brand) {
  let cardLogo = document.querySelector("#amex-logo");
  currentBrand = brand;
  if (brand == "amex") {
    cardLogo.classList.remove("hidden");
  } else {
    cardLogo.classList.add("hidden");
  }
  cardLogo = document.querySelector("#visa-logo");
  if (brand == "visa") {
    cardLogo.classList.remove("hidden");
  } else {
    cardLogo.classList.add("hidden");
  }
  cardLogo = document.querySelector("#discover-logo");
  if (brand == "discover") {
    cardLogo.classList.remove("hidden");
  } else {
    cardLogo.classList.add("hidden");
  }
  cardLogo = document.querySelector("#mastercard-logo");
  if (brand == "mastercard") {
    cardLogo.classList.remove("hidden");
  } else {
    cardLogo.classList.add("hidden");
  }
}

function switchSmallBrandLogo(brand) {
  // console.log("switch small brand logo", brand);
  if (selectedCard) {
    {
      const currentDiv = selectedCardDiv.querySelector(".small-brand-logo-div");
      if (currentDiv) {
        currentDiv.remove();
      }
      // console.log("draw new brand");
      const brandDiv = divForBrand(brand);
      // console.log("brand div: ", brandDiv);
      if (brandDiv) {
        selectedCardDiv.appendChild(brandDiv);
        selectedCard.brand = brand;
      }
    }
  }
}

let cardNumberGood = false;
let cardCVVGood = false;
let cardExpGood = false;
let cardGood = false;

let havePM = false;
let unsavedPM = undefined;
let chargeButtonEnabled = false;

function enableChargeButton() {
  const chargeButton = document.querySelector("#charge");
  chargeButton.style.color = "white";
  // chargeButton.style.backgroundColor = "rgb(192, 250, 192)";
  // console.log("enabling charge button");
  chargeButtonEnabled = true;
}

function disableChargeButton() {
  const chargeButton = document.querySelector("#charge");
  chargeButton.style.color = "rgb(255, 64, 64)";
  // chargeButton.style.backgroundColor = "rgb(255, 192, 192)";
  chargeButtonEnabled = false;
}

function gotNameOnCard() {
  return document.querySelector("#card-name").value != "";
}

// make expiration string from month & year strings
function makeExp(month, year) {
  const exp = month + "/" + (year + "").slice(-2);
  return exp;
}
function tryAcquirePM() {
  console.log("try acquire PM");
  if (cardNumberGood && cardCVVGood && cardExpGood && gotNameOnCard()) {
    setTimeout(async function () {
      showTempMessage("Securing card details...");
      const pm = await generateStripePM();
      console.log("generated pm: ", pm.paymentMethod.id);
      const name = document.querySelector("#card-name").value.toUpperCase();
      const custID = await getCustomerID(name);
      console.log("got customer ID: ", custID);
      const res = await connectCustomerToPM(custID, pm.paymentMethod.id);
      if (res != true && "error" in res) {
        showTempMessage("Failure - " + res.error, (dur = 10000));
        cardGood = false;
        disableChargeButton();
        return;
      }
      console.log("connected customer to payment method");
      showTempMessage("Card details secured.", (dur = 5000));
      // document.querySelector("#card-name").setAttribute("readonly", true);
      havePM = true;
      cardGood = true;
      enableChargeButton();
      if (selectedCard) {
        // console.log("pm: ", pm);
        selectedCard.pmID = pm.paymentMethod.id;
        selectedCard.brand = pm.paymentMethod.card.brand;
        selectedCard.last4 = pm.paymentMethod.card.last4;
        selectedCard.exp = makeExp(
          pm.paymentMethod.card.exp_month,
          pm.paymentMethod.card.exp_year
        );
        selectedCardDiv.querySelector(".small-card-last4").innerHTML =
          "&#x2022; &#x2022; &#x2022; " + selectedCard.last4;
        selectedCardDiv.querySelector(".small-card-exp").innerText =
          selectedCard.exp;
        switchSmallBrandLogo(selectedCard.brand);
        updateCard(selectedCard); // to DB
      } else {
        unsavedPM = pm;
      }
    }, 500); // wait half sec before securing card details w/customer
  }
}

function makeStripeElements() {
  elements = stripe.elements();
  const style = {
    base: {
      fontWeight: "500",
      fontSize: "20px",
      color: "white",
      ":focus": {
        backgroundColor: "rgb(255,255,255,0.3)",
      },
    },
  };
  const cvvStyle = {
    base: {
      fontSize: "16px",
      fontStyle: "italic",
      backgroundColor: "#aaa",
      color: "#333",
      textAlign: "center",
      ":focus": {
        backgroundColor: "rgb(210,230,210)",
      },
    },
  };
  const cardNumber = elements.create("cardNumber", {
    style: style,
    placeholder: "XXXX XXXX XXXX XXXX",
  });
  cardNumber.mount("#card-number");
  cardNumber.on("change", function (event) {
    if (event.brand) {
      switchBrandLogo(event.brand);
      // switchSmallBrandLogo(event.brand);
    }
    if (event.error) {
      cardNumberGood = false;
    }
    cardNumberGood = event.complete;
    tryAcquirePM();
  });
  const cardExpiry = elements.create("cardExpiry", { style: style });
  cardExpiry.mount("#card-exp");
  const cardCvc = elements.create("cardCvc", {
    style: cvvStyle,
    placeholder: "CVV",
  });
  cardExpiry.on("change", function (event) {
    if (event.error) {
      console.log("card exp error: ", event.error);
    }
    cardExpGood = event.complete;
    tryAcquirePM();
  });
  cardCvc.mount("#card-cvv");
  cardCvc.on("change", function (event) {
    if (event.error) {
      console.log("card exp error: ", event.error);
    }
    cardCVVGood = event.complete;
    tryAcquirePM();
  });
  elementsList = [cardNumber, cardExpiry, cardCvc];
}

makeStripeElements();

async function generateStripePM() {
  let customerName;
  if (selectedCard) {
    customerName = selectedCard.name;
  } else {
    customerName = document.querySelector("#card-name").value.toUpperCase();
  }
  const res = await stripe.createPaymentMethod({
    type: "card",
    card: elementsList[0],
    billing_details: {
      name: customerName,
    },
  });
  return res;
}

async function getStripeCustomers() {
  try {
    const res = await axios.get("customers");
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function postNewStripeCustomer(name) {
  try {
    const res = await axios.post(
      "customers",
      { name: name },
      { headers: { "Content-Type": "application/json" } }
    );
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

let customerIDList = [];
let customerIDListInited = false;

async function getCustomerIDListFromStripe() {
  const res = (await getStripeCustomers()).data.data;
  const idList = res.map(function (x) {
    return { name: x.name, id: x.id };
  });
  return idList;
}

async function getCustomerID(name) {
  if (!customerIDListInited) {
    customerIDList = await getCustomerIDListFromStripe();
    customerIDListInited = true;
  }
  let foundID = undefined;
  for (let x of customerIDList) {
    if (x.name === name) {
      foundID = x.id;
      // console.log("found customer ID", x);
    }
  }
  if (foundID) {
    return foundID;
  } else {
    // showTempMessage("Processing... (adding new customer)");
    const newCust = await postNewStripeCustomer(name);
    const newID = newCust.data.id;
    customerIDList.push({ name: name, id: newID });
    return newID;
  }
}

async function getCustomerPMs(id) {
  // console.log("get customer PMs for id: ", id);
  try {
    const res = await axios.get(`customer-payment-methods/${id}`);
    if (res.data.data) {
      return res.data.data.map((x) => x.id);
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

let customerPMsList = {};

async function stripeAttachPM(id, pm) {
  try {
    const res = await axios.get(`attach-payment-method/${id}/${pm}`);
    console.log("res: ", res);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function connectCustomerToPM(custID, pm) {
  console.log("connect customer to pm: ", custID, pm);
  let pms = customerPMsList[custID];
  if (pms == undefined) {
    pms = await getCustomerPMs(custID);
    customerPMsList[custID] = pms;
    // console.log("got current connections from stripe", pms);
  }
  if (pms && pms.indexOf(pm) >= 0) {
    console.log("found, already connected");
    return true;
  }
  // showTempMessage("Processing... (attaching payment method)");
  res = await stripeAttachPM(custID, pm);
  // console.log("res from connect to pm:", res);
  if ("error" in res.data) {
    console.log("got error at connect customer to pm");
    return res.data;
  } else {
    if (customerPMsList[custID] == undefined) {
      customerPMsList[custID] = [];
    }
    customerPMsList[custID].push(pm);
    // console.log("connected it");
    return true;
  }
}

let chargeResult;

async function postNewCharge(amount, name, pm) {
  try {
    const res = await axios.post(
      "charge",
      { amount: amount, customerID: name, pm: pm },
      { headers: { "Content-Type": "application/json" } }
    );
    chargeResult = res;
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function postRefund(amount, payment) {
  try {
    console.log("post refund for: ", amount, payment);
    const res = await axios.post(
      "refund",
      { amount: amount, id: payment.id },
      { headers: { "Content-Type": "application/json" } }
    );
    chargeResult = res;
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

let lastProcessedCharge = null;

document.querySelector("#charge").addEventListener("click", async function (e) {
  // console.log("clicked Charge");
  if (selectedPayment) {
    const amount = Number(document.querySelector("#amount").value.slice(2)); // remove leading '$
    if (amount > 0) {
      postRefund(amount, selectedPayment.payment);
    }
    return;
  }
  const amount = Number(document.querySelector("#amount").value.slice(2)); // remove leading '$ '
  if (chargeButtonEnabled && amount > 0) {
    let name;
    let pmID;
    if (selectedCard) {
      name = selectedCard.name;
      pmID = selectedCard.pmID;
    } else {
      name = document.querySelector("#card-name").value.toUpperCase();
      pmID = unsavedPM.paymentMethod.id;
    }
    if (name == "") {
      showTempMessage("Please enter name on card.");
      document.querySelector("#card-name").focus();
      return;
    }
    // console.log("res: ", res);
    showTempMessage("Processing... (processing charge)");
    const custID = await getCustomerID(name);
    const res2 = await postNewCharge(amount, custID, pmID);
    // console.log("res2: ", res2);
    if (res2.data.error) {
      const msg = res2.data.error;
      showTempMessage(msg);
      document.querySelector("#amount").value = "";
    } else {
      lastProcessedCharge = res2.data;
      const msg = `Processed charge for ${
        "$" + document.querySelector("#amount").value.slice(2)
      }`;
      showTempMessage(msg);
      document.querySelector("#amount").value = "";
      addChargeToPayments(lastProcessedCharge);
    }
  } else {
    if (!chargeButtonEnabled) {
      if (!cardNumberGood) {
        showTempMessage("Please enter a valid card number.");
        elementsList[0].focus();
      } else if (!cardExpGood) {
        showTempMessage("Please enter the card expiration date.");
        elementsList[1].focus();
      } else if (!cardCVVGood) {
        showTempMessage("Please enter the card CVV.");
        elementsList[2].focus();
      } else if (document.querySelector("#card-name").value == "") {
        showTempMessage("Please enter name on card.");
        document.querySelector("#card-name").focus();
        return;
      }
    } else if (amount == 0) {
      showTempMessage("Please enter amount.", (dur = 3000));
      document.querySelector("#amount").focus();
    }
  }
});

////////////////////////////////////////////////////////////////////////////////////
// functions to show temp messages re cards, or login/logout, or help boxes
////////////////////////////////////////////////////////////////////////////////////

let msgNum = 0;

async function showTempMessage(msg, dur = 10000) {
  const msgDiv = document.querySelector("#message");
  msgDiv.innerText = msg;
  msgDiv.classList.remove("hidden");
  msgNum++;
  const thisNum = msgNum;
  setTimeout(function () {
    if (msgNum == thisNum) {
      // only erase if no new msgs have been posted
      msgDiv.innerText = "";
      msgDiv.classList.add("hidden");
    }
  }, dur);
}

let loginMsgNum = 0;

async function showTempLoginMessage(msg, dur = 5000) {
  const msgDiv = document.querySelector("#login-message");
  if (msg == "") {
    msgDiv.classList.add("hidden");
    return;
  }
  msgDiv.innerText = msg;
  msgDiv.classList.remove("hidden");
  loginMsgNum++;
  const thisNum = loginMsgNum;
  setTimeout(function () {
    if (loginMsgNum == thisNum) {
      // only erase if no new msgs have been posted
      msgDiv.innerText = "";
      msgDiv.classList.add("hidden");
    }
  }, dur);
}

let infoBoxNum = 0;
let tempInfoBoxShown = false;

async function showTempInfoBox(msg, x, y, width = "50px", dur = 3000) {
  const msgDirDiv = document.querySelector("#dir-message");
  msgDirDiv.style.width = width;
  msgDirDiv.style.top = `${y - 155}px`; // offsets to place small box near mouse
  msgDirDiv.style.left = `${x - 10}px`;
  msgDirDiv.innerText = msg;
  msgDirDiv.classList.remove("hidden");
  infoBoxNum++;
  const thisNum = infoBoxNum;
  tempInfoBoxShown = true;
  setTimeout(function () {
    if (infoBoxNum == thisNum) {
      // only erase if no new msgs have been posted
      msgDirDiv.innerText = "";
      if (tempInfoBoxShown) {
        msgDirDiv.classList.add("hidden");
        tempInfoBoxShown = false;
      }
    }
  }, dur);
}

//////////////////////////////////////////////////////////////////////////
// functions to read / update credit card database to sync with front-end
//////////////////////////////////////////////////////////////////////////

function createWalletCard(userid, card) {
  const pmID = card.pmID ? card.pmID : "";
  const last4 = card.pmID ? card.last4 : -1;
  const exp = card.pmID ? card.exp : "";
  const brand = card.pmID ? card.brand : "";
  const walletCard = {
    userid: userid,
    name: card.name,
    bankname: card.bankName,
    last4: last4,
    exp: exp,
    brand: brand,
    pmID: pmID,
    addr_name: card.addressName,
    addr_line1: card.addressStreet1,
    addr_line2: card.addressStreet2,
    card_color: card.cardColor,
    logo_color: card.logoColor,
    text_color: card.textColor,
    index: card.index,
  };
  // console.log("walletCard: ", walletCard);
  return walletCard;
}

async function postNewCard(userid, card) {
  const walletCard = createWalletCard(userid, card);
  try {
    const res = await axios.post("api/cards", walletCard, {
      headers: { "Content-Type": "application/json" },
    });
    card.userid = userid;
    card.id = res.data.card.id;
    // console.log("res: ", res);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function updateCard(card) {
  try {
    // showTempMessage("Updating card...", (dur = 1000));
    const walletCard = createWalletCard(card.userid, card);
    const res = await axios.post(`api/cards/${card.id}`, walletCard, {
      headers: { "Content-Type": "application/json" },
    });
    // showTempMessage("Updated card.", 1000);
    card.spec = getCardSpec(card);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function listCardsForUser(userid) {
  try {
    const res = await axios.get(`api/cards/${userid}`);
    // console.log("cards: ", res.data.cards);
    return res.data.cards;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function cardFromWalletCard(walletCard) {
  const card = {
    id: walletCard.id,
    userid: walletCard.userid,
    name: walletCard.name,
    bankName: walletCard.bankname,
    last4: walletCard.last4,
    exp: walletCard.exp,
    brand: walletCard.brand,
    pmID: walletCard.pmID,
    addressName: walletCard.addr_name,
    addressStreet1: walletCard.addr_line1,
    addressStreet2: walletCard.addr_line2,
    cardColor: walletCard.card_color,
    logoColor: walletCard.logo_color,
    textColor: walletCard.text_color,
  };
  return card;
}

async function showCardsForUser(userid) {
  const walletCards = await listCardsForUser(userid);
  for (let walletCard of walletCards) {
    const card = cardFromWalletCard(walletCard);
    saveCard(card, false);
  }
  const newCard = document.querySelector(".new-card");
  newCard.style.transform = `translate(0px, ${savedCards.length * 112}px)`;
  if (savedCards.length > 0) {
    selectAndLoadCard(savedCards[0]);
  } else {
    // ow blank slate, no saved cards
    selectedCardDiv = undefined;
    selectedCard = undefined;
    if (!cardInputsShown) {
      clearCardInputs();
      showCardInputs();
    }
    disableChargeButton();
  }
}

document
  .querySelector(".new-card")
  .addEventListener("click", async function (e) {
    e.stopPropagation();
    console.log("new card");
    newCard();
  });

async function deleteCard(card) {
  try {
    const res = await axios.post(`api/cards/${card.id}/delete`, {
      headers: { "Content-Type": "application/json" },
    });
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

///////////////////////////////////////////////////////////////////
////////////  LOGIN / SIGNUP / LOGOUT buttons & actions
///////////////////////////////////////////////////////////////////

//  interface (using Axios) to flask server relating to login/logout

// on refresh, need to find out session info, i.e. current logged-in user or none
async function getCurrentUserID() {
  try {
    const res = await axios.get("current-userid");
    // console.log("current: ", res.data);
    return res.data.userid;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// right now, needed just to insert username on page to show who's logged in
async function getUsername(id) {
  res = await axios.get(`/api/username/${id}`);
  return res.data.username;
}

async function newSignUp(username, password) {
  try {
    const res = await axios.post(
      "signup",
      { username: username, password: password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    // console.log("newsignup res:", res);
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function loginToServer(username, password) {
  // console.log("login for: ", username);
  try {
    const res = await axios.post(
      "login",
      { username: username, password: password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

async function logoutFromServer(userid) {
  try {
    const res = await axios.post(
      "logout",
      { userid: userid },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// once user is logged in, set up portal interface properly,
// show cards, hide some buttons, reveal some buttons, etc.
function setUpDOMForUser(userid) {
  document.querySelector("#password").classList.add("hidden");
  document.querySelector("#pw-label").classList.add("hidden");
  document.querySelector("#login-button").classList.add("hidden");
  document.querySelector("#login").classList.add("hidden");
  document.querySelector("#register").classList.add("hidden");
  document.querySelector("#console").classList.remove("hidden");
  document.querySelector("#console").innerText =
    "Console " + "(" + g_username + ")";
  console.log("username: ", g_username);
  document.querySelector("#user-form").classList.add("hidden");
  // document.querySelector("#sign-up-button").classList.add("hidden");
  document.querySelector("#logout-button").classList.remove("hidden");
  document.querySelector("#logout").classList.remove("hidden");
  document.querySelector("#eye").classList.add("hidden");
  document.querySelector(".portal").classList.remove("hidden");
  clearCard();
  for (let el of elementsList) {
    el.clear();
  }
  showCardsForUser(userid);
  getPaymentsPromise();
}

function clearDOMOnLogout() {
  document.querySelector("#username").removeAttribute("readonly");
  document.querySelector("#username").value = "";
  document.querySelector("#password").value = "";
  document.querySelector("#filter").value = "";
  document.querySelector("#logout-button").classList.add("hidden");
  document.querySelector("#login").classList.remove("hidden");
  document.querySelector("#register").classList.remove("hidden");
  document.querySelector("#logout").classList.add("hidden");
  document.querySelector("#console").classList.add("hidden");
  document.querySelector("#user-form").classList.remove("hidden");
  document.querySelector("#eye").classList.remove("hidden");
  document.querySelector("#password").classList.remove("hidden");
  document.querySelector("#pw-label").classList.remove("hidden");
  document.querySelector("#login-button").classList.remove("hidden");
  // document.querySelector("#sign-up-button").classList.remove("hidden");
  document.querySelector(".portal").classList.add("hidden");
  // remove small cards from DOM & savedCards objects
  const smallCards = document.querySelectorAll(".small-card");
  for (let card of smallCards) {
    card.remove();
  }
  document.querySelector("#username").focus();
}

async function signupButton(e) {
  e.preventDefault();
  if (g_userid == -1) {
    document.querySelector("#username").setAttribute("readonly", true);
    const username = document.querySelector("#username").value;
    if (username == "") {
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    const password = document.querySelector("#password").value;
    // console.log("username: ", username);
    if (password == "") {
      showTempLoginMessage("Sorry, you must supply a password.");
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    let res = await newSignUp(username, password);
    // console.log("res from login to server: ", res);
    if (res.data == "user already exists") {
      showTempLoginMessage("Sorry, that username is already in use.");
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    showTempLoginMessage("");
    g_userid = res.data.userid;
    g_username = username;
    console.log("username set to: ", username);
    setUpDOMForUser(g_userid);
  }
}

async function loginButton(e) {
  e.preventDefault();
  if (g_userid == -1) {
    document.querySelector("#username").setAttribute("readonly", true);
    const username = document.querySelector("#username").value;
    if (username == "") {
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    const password = document.querySelector("#password").value;
    // console.log("username: ", username);
    let res = await loginToServer(username, password);
    if (res.data == "no such user") {
      // console.log("NO SUCH USER");
      showTempLoginMessage("Sorry, no such user.");
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    if (res.data == "wrong password") {
      showTempLoginMessage("Sorry, wrong password.");
      document.querySelector("#username").removeAttribute("readonly");
      return;
    }
    showTempLoginMessage("");
    // console.log("res from login to server: ", res);
    g_userid = res.data.userid;
    g_username = username;
    console.log("username set to: ", username);
    setUpDOMForUser(g_userid);
  }
}

async function enterButton(e) {
  if (g_login_register_flag) {
    return loginButton(e);
  } else {
    return signupButton(e);
  }
}

async function logoutButton(e) {
  e.preventDefault();
  let res = await logoutFromServer(g_userid);
  savedCards = [];
  g_userid = -1;
  clearDOMOnLogout();
}

let pwShow = false;

function showPwButton(e) {
  e.preventDefault();
  console.log("show/hide");
  if (pwShow) {
    document.getElementById("password").type = "password";
    document.querySelector(
      "#eye"
    ).innerHTML = `<img src="static/images/closed-eye.svg">`;
  } else {
    document.getElementById("password").type = "text";
    document.querySelector(
      "#eye"
    ).innerHTML = `<img src="static/images/open-eye.svg">`;
  }
  pwShow = !pwShow;
}

function setUpButtons() {
  document
    .querySelector("#login-button")
    .addEventListener("click", enterButton);
  // document
  //   .querySelector("#sign-up-button")
  //   .addEventListener("click", signupButton);
  document
    .querySelector("#logout-button")
    .addEventListener("click", logoutButton);
  document.querySelector("#eye").addEventListener("click", showPwButton);
}

async function checkAndLoadUser() {
  g_userid = await getCurrentUserID();
  console.log("check and load: userid: ", g_userid);
  if (g_userid != -1) {
    if (setUpFocusEventsForInputFields) {
      g_username = await getUsername(g_userid);
      document.querySelector("#username").value = g_username;
      document.querySelector("#username").setAttribute("readonly", true);
      setUpDOMForUser(g_userid);
    }
  } else {
    document.querySelector("#username").focus(); // not logged in: put cursor on username input box
  }
}

function init() {
  setUpButtons();
  checkAndLoadUser();
}

init(); // on refresh, check if was logged-in, then show user's stuff

////////////////////////////////////////////////////////////////////////
//    Mouse-sensitive help, bring up info box is mouse stops somewhere
////////////////////////////////////////////////////////////////////////

let clock = 0; // for keeping track of passed time
let mouseRestObj; // object mouse is sitting on
let mouseObjTime; // last time mouse moved on object
let mouseWait = 3200; // num milliseconds to wait before showing help
let checkInterval = 300; // don't check every instant, only so often
let restHandled = false; // flag to show that msg was posted, i.e. don't keep posting
let mouseRestX, mouseRestY; // where mouse last moved to & presumably has stayed

document.addEventListener("mousemove", function (e) {
  if (e.handled) {
    return;
  }

  if (mouseIsDown) {
    const offset = mouseCardDiv.position * 112;
    mouseCardDiv.style.transform = `translate(0px, ${
      e.pageY - mouseDownY + offset
    }px)`;

    checkSmallCardPlacements(e.pageY);
    // console.log("mouse down: ", mouseDownX, " ", mouseDownY);
  }

  if (e.target.closest(".small-card") != highlightedCardDiv) {
    if (highlightedCardDiv) {
      dehighlightCardDiv(highlightedCardDiv);
    }
    if (e.target.closest(".small-card")) {
      highlightedCardDiv = e.target.closest(".small-card");
      // console.log("setting highlighted to ", highlightedCardDiv.card);
      highlightCardDiv(highlightedCardDiv);
      document.querySelector("#shadowbox").style.backgroundColor = "#0009";
    }
  }
  if (!e.target.closest(".small-card")) {
    highlightedCardDiv = null;
    document.querySelector("#shadowbox").style.backgroundColor = "#0000";
  }
  if (selectedCard && e.target.closest(".small-card") == selectedCardDiv) {
    // console.log("on selected small card");
    mouseObjTime = clock;
    mouseRestObj = "small-card";
    restHandled = false;
    mouseRestX = e.clientX;
    mouseRestY = e.clientY;
  } else {
    // mouse has moved off operative objects, so hide message box
    if (tempInfoBoxShown) {
      const msgDirDiv = document.querySelector("#dir-message");
      msgDirDiv.classList.add("hidden");
      dirMessageShown = false;
    }
    mouseRestObj = null;
  }
  // console.log("mouse move");
});

document.querySelector(".card").addEventListener("mousemove", function (e) {
  if (e.handled) {
    return;
  }
  if (e.pageX < 300) {
    return;
  }
  e.handled = true;
  mouseObjTime = clock;
  mouseRestObj = "card";
  restHandled = false;
  mouseRestX = e.clientX;
  mouseRestY = e.clientY;
  // console.log("mouse move onto card at", tickNum);
});

document.querySelector(".logo").addEventListener("mousemove", function (e) {
  e.handled = true;
  mouseObjTime = clock;
  mouseRestObj = "logo";
  restHandled = false;
  mouseRestX = e.clientX;
  mouseRestY = e.clientY;
  // console.log("mouse move onto logo at", tickNum);
});

function handleMouseRest(restObj) {
  restHandled = true; // here, assume will be handled
  if (restObj == "card") {
    // console.log("handle rest on card");
    showTempInfoBox("click on card to change color", mouseRestX, mouseRestY);
  } else if (restObj == "logo") {
    // console.log("handle rest on logo");
    showTempInfoBox("click on logo to change color", mouseRestX, mouseRestY);
  } else if (restObj == "small-card") {
    // console.log("handle rest on small-card");
    showTempInfoBox(
      "<Shift-UpArrow> or \n<Shift-DownArrow> \nto change card order",
      mouseRestX,
      mouseRestY,
      (width = "120px")
    );
  } else {
    restHandled = false; // if fall through, guess wasn't handled
  }
}

function tick() {
  clock += checkInterval;
  if (mouseRestObj && !restHandled && clock - mouseObjTime > mouseWait) {
    // console.log("mouse sat long enough");
    handleMouseRest(mouseRestObj);
  }
  // console.log("tick: ", tickNum, mouseRestObj);
}

tickInterval = setInterval(tick, checkInterval);

//////////////////////////////////////////////////////////////////////

let paymentsPromise = null;

async function getPaymentsPromise() {
  try {
    const res = axios.get("payments");
    paymentsPromise = res;
    return res;
  } catch (error) {
    console.log(error);
    return null;
  }
}

let newPayments = [];

async function seePaymentsForSelectedCard() {
  try {
    const pmID = selectedCard.pmID;
    let payments = (await paymentsPromise).data.data;
    if (newPayments.length) {
      payments = newPayments.concat(payments);
    }
    const filPayments = payments.filter(
      (payment) => payment.payment_method === pmID
    );
    return filPayments;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function padZeros(n) {
  return String(n).padStart(2, "0");
}

function formatDateForReceipt(secs) {
  const d = new Date(secs * 1000);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const date = d.getDate();
  let hour = d.getHours();
  const min = d.getMinutes();
  let am = true;
  if (hour == 0) {
    hour = 12;
  } else if (hour == 12) {
    am = false;
  } else if (hour > 12) {
    hour -= 12;
    am = false;
  }
  const str = `${padZeros(month)}/${padZeros(date)}/${year} ${padZeros(
    hour
  )}:${padZeros(min)} ${am ? "AM" : "PM"}`;
  return str;
}

function abbrevForBrand(brand) {
  let abbrev = "";

  if (brand === "visa") {
    abbrev = "VISA";
  } else if (brand == "mastercard") {
    abbrev = "MC";
  } else if (brand == "discover") {
    abbrev = "DISC";
  } else if (brand == "amex") {
    abbrev = "AMEX";
  }
  return abbrev;
}

for (r of document.querySelectorAll(".receipt")) {
  r.addEventListener("mouseover", function (e) {
    e.target.style.backgroundColor = "#ff8";
    // console.log("over receipt");
  });
  r.addEventListener("mouseleave", function (e) {
    e.target.style.backgroundColor = "snow";
    // console.log("not over receipt");
  });
}

let payments = null;

async function showPayments() {
  // console.log("show payments");
  document.querySelector(".receipts").innerHTML = "";
  payments = await seePaymentsForSelectedCard();
  payments.map((p) => {
    const div = makePaymentDiv(p);
    document.querySelector(".receipts").appendChild(div);
  });
  // console.log(payments);
  selectedPayment = null;
  const button = document.querySelector(".charge-button");
  button.innerText = "Charge";
}

let selectedPayment = null;
const DEF_REC_COLOR = "#eee";
const HIGHLIGHT_REC_COLOR = "#eff";
const SELECT_REC_COLOR = "#cff";
const SELECT_HIGH_REC_COLOR = "#cff";

function makePaymentDiv(payment) {
  const div = document.createElement("div");
  div.innerHTML = `
    ${formatDateForReceipt(payment.created)}<br/>
          CARD #: ${abbrevForBrand(selectedCard.brand)} ${
    selectedCard.last4
  }<br/>
          TOTAL: $${(payment.amount / 100).toFixed(2)}<br/>`;
  div.payment = payment;
  div.classList.add("receipt");
  div.addEventListener("click", function (e) {
    // console.log("click");
    if (e.target == selectedPayment) {
      selectedPayment = null;
      e.target.style.backgroundColor = HIGHLIGHT_REC_COLOR;
      const button = document.querySelector(".charge-button");
      button.innerText = "Charge";
    } else {
      if (selectedPayment) {
        selectedPayment.style.backgroundColor = DEF_REC_COLOR;
      }
      e.target.style.backgroundColor = SELECT_HIGH_REC_COLOR;
      selectedPayment = e.target;
      const button = document.querySelector(".charge-button");
      button.innerText = "Refund";
    }
  });
  div.addEventListener("mouseover", function (e) {
    if (e.target == selectedPayment) {
      e.target.style.backgroundColor = SELECT_HIGH_REC_COLOR;
    } else {
      e.target.style.backgroundColor = HIGHLIGHT_REC_COLOR;
    }
    // console.log("payment: ", e.target.payment);
    // selectedPayment = e.target.payment;
    // console.log("over receipt");
  });
  div.addEventListener("mouseleave", function (e) {
    if (e.target == selectedPayment) {
      e.target.style.backgroundColor = SELECT_REC_COLOR;
    } else {
      e.target.style.backgroundColor = DEF_REC_COLOR;
    }
    // selectedPayment = null;
    // console.log("not over receipt");
  });
  return div;
}

function addChargeToPayments(payment) {
  payments.unshift(payment);
  if (newPayments.length) {
    newPayments.unshift(payment);
  } else {
    newPayments = [payment];
  }
  const div = makePaymentDiv(payment);
  document.querySelector(".receipts").prepend(div);
}

document.querySelector("#login").addEventListener("click", function (e) {
  console.log("clicked login");
  document.querySelector("#login-button").innerText = "Login";
  document.querySelector("#login").classList.add("highlight");
  document.querySelector("#register").classList.remove("highlight");
  g_login_register_flag = !g_login_register_flag;
});

document.querySelector("#register").addEventListener("click", function (e) {
  console.log("clicked register");
  document.querySelector("#login-button").innerText = "Register";
  document.querySelector("#login").classList.remove("highlight");
  document.querySelector("#register").classList.add("highlight");
  g_login_register_flag = !g_login_register_flag;
});

document.querySelector("#logout").addEventListener("click", function (e) {
  console.log("clicked logout");
  logoutButton(e);
});
