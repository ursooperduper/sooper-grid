// ------------------------------------------------------------------------ */
//   Date:     October 26 2025
//   Title:    Grid 5 TOOL (SooperGrid)
//   Author:   Sarah Kuehnle (@ursooperduper)
// ------------------------------------------------------------------------- */

/* WEB ELEMENTS ------------------------------------------------------------ */
let wRecurseAmt          = document.getElementById("recurseAmt");
let wRecurseVal          = document.getElementById("recurseVal");
let wCellPadAmt          = document.getElementById("cellPadAmt");
let wCellPadVal          = document.getElementById("cellPadVal"); 
let wPerlinBGClr         = document.getElementById("cbPerlinBGClr");
let wPerlinShapesClr1    = document.getElementById("cbPerlinShapesClr1");
let wSecondShapeSet      = document.getElementById("cbSecondShapeSet");
let wPerlinShapesClr2    = document.getElementById("cbPerlinShapesClr2");
let wSameClrsSecondShape = document.getElementById("cbSecondShapeSetClrsSame");
let wColorsInPalAmt      = document.getElementById("rngNumColors");
let wColorsInPalVal      = document.getElementById("rngNumColorsVal");
let wSelectShapeSet      = document.getElementById("selShapeSet");
let wSelectIndShape      = document.getElementById("selIndividualShape");

/* GLOBALS ----------------------------------------------------------------- */
let noiseRandomSeed;
let seed;
let rez3                      = 0.004;                           
let noiseScale                = 0.003;                     
let noiseScale2               = 0.004;                    
let noiseOffset               = 500;                      
let noiseValue;   
let colorIndex;   
let selectedColor;    
let usePerlinBGTilesClr       = false;            
let usePerlinShapesClr1       = false;            
let usePerlinShapesClr2       = false;            
let useSecondShapeSet         = false;            
let useSameClrsSecondShape    = true;
let numClrs;                                   
let palCount;   
let strokeWt                  = 1;
let strokeSet                 = false;

/* COLOR ------------------------------------------------------------------- */
let clrArr                    = [];
let palFiles                  = "data/color/colors-full-4-shortened.json";
let palList;        
let loadSuccessCounter        = 0;
let numPalFiles;
let randomPal;
let pCt                       = 0;
let revPalList                = [];

/* SHAPES ------------------------------------------------------------------ */
let recurseCt                 = 6; 
let cellPad                   = 2; 
let pickCirc, pickCirc2, pickCirc3, pickCirc4, pickRect, pickRect2, pickRect3, pickPlus, pickTri, pickTri2, pickTri3, pickTriPinwheel, pickArc, pickArc2, pickArc3, pickDiamondRect, pickFunMix1, pickFunMix2, pickFunMix3, pickCircSemi, pickSemiAllSides, pickSemiTopBottom, pickSemiLeftRight, pickArcSemi, pickCircBar, pickTriArc, pickCircRect, pickCircTri, pickPetals, pickCircPetals, pickCheckerboard, pickDoubleArc;
let pickOpts;
let pick;
let pickType; // "shape-set", "random-shape-set", "individual-shape", "random-individual-shape";
let pickOption; // name of the shape or shape set
let pickRandomShape;
let pickedSet;

/* ------------------------------------------------------------------------- */
function preload() {
  palList = loadJSON(palFiles);
}

function setup(){
  let d = displayDensity();
  pixelDensity(d);

  // w = min(windowWidth, windowHeight);
  w = 800;
  let c = createCanvas(w, w, SVG);
  c.parent("canvasWrapper");

  pad            = w/32;
  pickType       = "shape-set";
  pickOption     = 0;
  
  numClrs = wColorsInPalAmt.value;
  wColorsInPalVal.value = numClrs;
  
  // console.log("Num colors: " + numClrs);

  randomPalette();
  noStroke();

  // Grid sections
  // Recursion controls
  recurseCt = wRecurseAmt.value;
  wRecurseVal.value = recurseCt;

  cellPad = 2;
  cellPad = int(wCellPadAmt.value);
  wCellPadVal.value = cellPad;
  
  wRecurseAmt.oninput = function() {
    recurseCt = wRecurseAmt.value;
    wRecurseVal.value = recurseCt;
    updateGrid();
  }


  wCellPadAmt.oninput = function() {
    cellPad = int(wCellPadAmt.value);
    wCellPadVal.value = cellPad;
    updateGrid();
  }

  // Shape set settings sections
  wSelectShapeSet.oninput = function() {
    pickType = "shape-set";
    pickOption = wSelectShapeSet.value;
    updateGrid();
  }

  wSelectIndShape.oninput = function() {
    pickType = "individual-shape";
    pickOption = int(wSelectIndShape.value);
    updateGrid();
  }

  wPerlinBGClr.oninput = function() {
    if (wPerlinBGClr.checked) {
      usePerlinBGTilesClr = true;
    } else {
      usePerlinBGTilesClr = false;
    }
    updateGrid();
  }

  wPerlinShapesClr1.oninput = function() {
    if (wPerlinShapesClr1.checked) {
      usePerlinShapesClr1 = true;
    } else {
      usePerlinShapesClr1 = false;
    }
    updateGrid();
  }

  wColorsInPalAmt.oninput = function() {
    numClrs = wColorsInPalAmt.value;
    wColorsInPalVal.value = numClrs;
    randomPalette();
    updateGrid();
  }

  // Generate initial seed first
  generateSeed();
  
  // Then draw the initial grid
  updateGrid();

  noLoop();
}

function draw() {
  // Always ensure we have a seed and set the random seeds
  if (!seed || seed === undefined) {
    generateSeed();
  }
  
  // Always set the random seeds to ensure consistent generation
  randomSeed(seed);
  noiseSeed(seed);
  
  background(color(random(clrArr)));
  createCell(pad, pad, w-pad * 2, w-pad * 2, recurseCt);
}

function createCell(posX, posY, wid, hei, depth) {
  if (depth > 0) {
    createCell(posX, posY, wid/2, hei/2, depth - int(random([1,2])));
    createCell(posX + wid/2, posY, wid/2, hei/2, depth - int(random([1,2])));
    createCell(posX, posY + hei/2, wid/2, hei/2, depth - int(random([1,2])));
    createCell(posX + wid/2, posY + hei/2, wid/2, hei/2, depth - int(random([1,2])));
  } else {
    // noStroke();
    // noFill(); 
    // stroke(0);
    // strokeWeight(1);
    // fill(color(random(clrArr)));
    // fillGradient(
    //   'linear', {
    //     'from' : [posX, posY],
    //     'to'   : [posX + wid, posY + hei],
    //     'steps': [
    //       [color(random(clrArr)), 0],
    //       [color('#FFFFFF'), 1]
    //     ]
    //   }
    // );

    let adjustedPosX = posX + cellPad;
    let adjustedPosY = posY + cellPad;
    let adjustedWid = wid - cellPad * 2;
    let adjustedHei = hei - cellPad * 2;

    // Generate a random boolean value to determine whether to rotate the cell
    // let shouldRotate = random([true, false]);

    // if (shouldRotate) {
    //   push();
    //   translate(posX + wid / 2, posY + hei / 2); // Move the origin to the center of the cell
    //   rotate(PI / 4); // Rotate by 45 degrees (PI / 4 radians)
    //   translate(-(posX + wid / 2), -(posY + hei / 2)); // Move the origin back
    // }
    
    if (usePerlinBGTilesClr) {
      noiseValue = noise((adjustedPosX + noiseOffset) * noiseScale, (adjustedPosY + noiseOffset) * noiseScale);
      noiseValue = clamp(noiseValue, 0.3, 0.7);
      colorIndex = floor(map(noiseValue, 0.3, 0.7, 0, clrArr.length-1));
      if (colorIndex < 0) {
        colorIndex = 0;
      }
      fill(color(clrArr[colorIndex]));
    } else {
      fill(color(random(clrArr)));
    }

    rect(adjustedPosX, adjustedPosY, adjustedWid, adjustedHei);

    if (usePerlinShapesClr1) {
      noiseValue = noise((adjustedPosX + noiseOffset + 250) * noiseScale2, (adjustedPosY + noiseOffset + 250) * noiseScale2);
      noiseValue = clamp(noiseValue, 0.3, 0.7);
      colorIndex = floor(map(noiseValue, 0.3, 0.7, 0, clrArr.length-1));
      if (colorIndex < 0) {
        colorIndex = 0;
      }
      fill(color(clrArr[colorIndex]));
    } else {
      fill(color(random(clrArr)));
    }

    // fillGradient(
    //   'linear', {
    //     'from' : [posX, posY],
    //     'to'   : [posX + wid, posY + hei],
    //     'steps': [
    //       [color(random(clrArr)), 0],
    //       [color('#FFFFFF'), 1]
    //     ]
    //   }
    // );

    pickShape(adjustedPosX, adjustedPosY, adjustedWid, adjustedHei);
  

    if (useSecondShapeSet) {
      // fill(color(random(clrArr)));
      if (!useSameClrsSecondShape) {
        if (usePerlinShapesClr2) {
          noiseValue = noise((adjustedPosX + noiseOffset + 250) * noiseScale2, (adjustedPosY + noiseOffset + 250) * noiseScale2);
          noiseValue = clamp(noiseValue, 0.3, 0.7);
          colorIndex = floor(map(noiseValue, 0.3, 0.7, 0, clrArr.length-1));
          if (colorIndex < 0) {
            colorIndex = 0;
          }
          let clrSh1 = color(clrArr[colorIndex]);
          clrSh1.setAlpha(100);
          fill(clrSh1);
        } else {
          let clrSh2 = color(random(clrArr));
          clrSh2.setAlpha(100);
          fill(clrSh2);
        }
        pickShape(adjustedPosX, adjustedPosY, adjustedWid, adjustedHei);
      }
    }

    // fillGradient(
    //   'linear', {
    //     'from' : [posX, posY],
    //     'to'   : [posX + wid, posY + hei],
    //     'steps': [
    //       [color('#FFFFFF'), 0],
    //       [color(random(clrArr)), 1]
    //     ]
    //   }
    // );
    //
    
    // if (shouldRotate) {
    //   pop(); // Restore the original transformation state
    // }
  }
}

function pickShape(posX, posY, wid, hei) {
  // console.log("Pick type: " + pickType);
  // All the different sets of shapes
  pickRandomShape = int(random(1, 67));

  pickCirc          = [2,  3];
  pickCirc2         = [2,  3,  4,  18, 39, 40];
  pickCirc3         = [2,  3,  4,  18, 39, 40, 63, 64, 65, 66];
  pickCirc4         = [63, 64, 65, 66, 67];
  pickRect          = [1,  5,  10, 11, 12, 13, 14, 15, 16, 17];
  pickRect2         = [1,  5,  10, 11, 12, 13, 14, 15, 16, 17, 19, 22, 23, 26, 32];
  pickRect3         = [13, 15, 16, 17];
  pickPlus          = [22, 23, 24];
  pickTri           = [6,  7,  8,  9];
  pickTri2          = [6,  7,  8,  9,  20, 21];
  pickTri3          = [6,  7,  8,  9,  20, 21, 60];
  pickTriPinwheel   = [60];
  pickArc           = [27, 28, 29, 30];
  pickArc2          = [33, 34];
  pickArc3          = [35, 36, 37, 38, 56, 57, 58, 59];
  pickDiamondRect   = [14, 19, 31];
  pickFunMix1       = [4,  6,  7,  8,  9,  14, 19, 32, 18];
  pickFunMix2       = [2,  3,  6,  7,  8,  9,  39, 32];
  pickFunMix3       = [6,  7,  8,  9,  32, 39];
  pickCircSemi      = [2,  3,  35, 36, 37, 38, 40];
  pickSemiAllSides  = [35, 36, 37, 38];
  pickSemiTopBottom = [35, 36];
  pickSemiLeftRight = [37, 38];
  pickArcSemi       = [27, 28, 29, 30, 35, 36, 37, 38];
  pickCircBar       = [2,  3,  22, 23];
  pickTriArc        = [1,  6,  7,  8,  9,  35, 36, 37, 38];
  pickCircRect      = [39, 1,  2,  3,  4,  5,  18, 10, 11, 14];
  pickCircTri       = [2,  6,  7,  8,  9,  40];
  pickPetals        = [41, 42];
  pickCircPetals    = [43, 40, 2,  3,  4];
  pickCheckerboard  = [49, 50, 51];
  pickDoubleArc     = [56, 57, 58, 59];
  //          0         1          2          3          4         5          6          7         8        9         10        11               12       13        14        15               16           17           18           19            20                21                 22                 23           24           25          26            27           28          29              30                31
  pickOpts = [pickCirc, pickCirc2, pickCirc3, pickCirc4, pickRect, pickRect2, pickRect3, pickPlus, pickTri, pickTri2, pickTri3, pickTriPinwheel, pickArc, pickArc2, pickArc3, pickDiamondRect, pickFunMix1, pickFunMix2, pickFunMix3, pickCircSemi, pickSemiAllSides, pickSemiTopBottom, pickSemiLeftRight, pickArcSemi, pickCircBar, pickTriArc, pickCircRect, pickCircTri, pickPetals, pickCircPetals, pickCheckerboard, pickDoubleArc];
  
  switch (pickType) {
    case "shape-set":
      pick          = random(pickOpts[pickOption]);
      break;
    case "random-shape-set":
      pick          = random(pickOpts[pickedSet]);
      break;
    case "individual-shape":
      pick          = pickOption;
      break;
    case "random-individual-shape":
      pick          = pickOption;
      break;
    default:
      pickedSet     = int(random(0, pickOpts.length));  
      pick          = random(pickOpts[pickedSet]);
      break;
  }
  
  switch (pick) {
    case 1:   // basic rectangle, full width
      rect(posX, posY, wid, hei);
      break;
    case 2 :  // basic circle, almost full width (1/4 gap)
      ellipseMode(CENTER);
      ellipse(posX+wid/2,posY+hei/2,wid-wid/4,hei-hei/4);
      break;
    case 3 :  // basic circle, half size
      ellipseMode(CENTER);
      ellipse(posX+wid/2, posY+hei/2, wid/2, hei/2);
      break;
    case 4 :  // basic circle, almost full size, with inner circle 
      ellipseMode(CENTER);
      ellipse(posX+wid/2, posY+hei/2, wid-wid/4, hei-hei/4);
      fill(color(random(clrArr)));
      ellipse(posX+wid/2, posY+hei/2, wid/2, hei/2);
      break;
    case 5 :  // half height rectangle, from top
      rect(posX, posY, wid, hei/2);
      break;
    case 6 :  // triangle, from top left
      push();
        translate(posX + wid/2, posY + hei/2);
        let n3 = noise(posX*rez3,posY*rez3)+0.033;
        let ang = floor(map(n3,0.3,0.7,0,4));
        rotate(PI*0.5*ang); 
        triangle(0 - wid/2, 0 - hei/2, wid - wid/2, 0 - hei/2, 0 - wid/2, hei - hei/2);
      pop();
      break;
    case 7 :  // triangle, from top right
      triangle(posX, posY, posX + wid, posY, posX + wid, posY + hei);
      break;
    case 8 :  // triangle, from bottom right
      triangle(posX + wid, posY, posX + wid, posY + hei, posX, posY + hei);
      break;
    case 9 :  // triangle, from bottom left
      triangle(posX, posY, posX, posY + hei, posX + wid, posY + hei);
      break;
    case 10 : // half height rectangle, from bottom
      rect (posX, posY + hei/2, wid, hei/2);
      break;
    case 11 : // half width rectangle, right
      rect(posX + wid/2, posY, wid/2, hei); 
      break;
    case 12 : // half width rectangle, left
      rect(posX, posY, wid/2, hei); 
      break;
    case 13 : // 1/4 size rectangle, bottom right
      rect(posX + wid/2, posY + hei/2, wid/2, hei/2);
      break;
    case 14 : // rectangle, with inner rectangle
      rect(posX, posY, wid, hei);
      fill(color(random(clrArr)));
      // rectMode(CENTER);
      rect(posX + wid/2, posY + hei/2, wid/2, hei/2);
      rectMode(CORNER);
      break;
    case 15 : // 1/4 size rectangle, top left
      rect(posX, posY, wid/2, hei/2);
      break;
    case 16 : // 1/4 size rectangle, top right
      rect(posX + wid/2, posY, wid/2, hei/2);
      break;
    case 17:  // 1/4 size rectangle, bottom left
      rect(posX, posY + hei/2, wid/2, hei/2); 
      break;
    case 18 : // basic circle, almost full size, with two inner circles
      ellipseMode(CENTER);
      ellipse(posX+wid/2, posY+hei/2, wid/2, hei/2);
      fill(color(random(clrArr)));
      ellipse(posX+wid/2, posY+hei/2, wid/3, hei/3);
      fill(color(random(clrArr)));
      ellipse(posX+wid/2, posY+hei/2, wid/6, hei/6);
      break;
    case 19 : // rectangle, with two inner rectangles
      rect(posX, posY, wid, hei);
      fill(color(random(clrArr)));
      rectMode(CENTER);
      rect(posX + wid/2, posY + hei/2, wid/2, hei/2);
      fill(color(random(clrArr)));
      rect(posX + wid/2, posY + hei/2, wid/4, hei/4);
      rectMode(CORNER);
      break;
    case 20 : // triangle, half height, from top
      triangle(posX, posY, posX + wid, posY, posX + wid/2, posY + hei/2);
      break;
    case 21 : // triangle, half height, from bottom
      triangle(posX, posY + hei, posX + wid, posY + hei, posX + wid/2, posY + hei/2);
      break;
    case 22 : // 1/4 size retangle, center full height
      rectMode(CENTER);
      rect(posX + wid/2, posY + hei/2, wid/4, hei);
      rectMode(CORNER);
      break;
    case 23 : // 1/4 size rectangle, center full width
      rectMode(CENTER);
      rect(posX + wid/2, posY + hei/2, wid, hei/4);
      rectMode(CORNER);
      break;
     case 24 : // plus sign
      rectMode(CENTER);
      rect(posX + wid/2, posY + hei/2, wid/4, hei);
      rect(posX + wid/2, posY + hei/2, wid, hei/4);
      rectMode(CORNER);
      break;
    case 25 : // square, with inner circle, 2/2 grid
      for (let cols = 0; cols < 2; cols++) {
        for (let rows = 0; rows < 2; rows++) {
          let cellSize = wid / 2;
          let x = cols * cellSize;
          let y = rows * cellSize;
          fill(color(random(clrArr)));
          rect(x + posX, y + posY, cellSize, cellSize);
          fill(color(random(clrArr)));
          ellipse((x + posX) + cellSize/2, (y + posY) + cellSize/2, cellSize - cellSize/2, cellSize - cellSize/2);
        }
      }
      break;
    case 26 : // square, with inner square, 2x2 grid
      for (let cols = 0; cols < 2; cols++) {
        for (let rows = 0; rows < 2; rows++) {
          let cellSize = wid / 2;
          let x = cols * cellSize;
          let y = rows * cellSize;
          fill(color(random(clrArr)));
          rect(x + posX, y + posY, cellSize, cellSize);
          fill(color(random(clrArr)));
          rectMode(CENTER);
          rect((x + posX) + cellSize/2, (y + posY) + cellSize/2, cellSize - cellSize/2, cellSize - cellSize/2);
          rectMode(CORNER);
        }
      }
      break;
    case 27 : // 1/4 circle, top left
      arc(posX, posY, wid, hei, 0, PI/2); 
      break;
    case 28 : // 1/4 circle, top right
      arc(posX + wid, posY, wid, hei, PI/2, PI); 
      break;
    case 29 : // 1/4 circle, bottom right
      arc(posX + wid, posY + hei, wid, hei, PI, PI + PI/2); 
      break;
    case 30 : // 1/4 circle, bottom left
      arc(posX, posY + hei, wid, hei, PI + PI/2, TWO_PI);
      break;
    case 31 : // diamond, with inner diamond
      quad(posX, posY + hei/2, posX + wid/2, posY, posX + wid, posY + hei/2, posX + wid/2, posY + hei);
      fill(color(random(clrArr)));
      quad(posX + wid/4, posY + hei/2, posX + wid/2, posY + hei/4, posX + wid - wid/4, posY + hei/2, posX + wid/2, posY + hei - hei/4);
      break;
    case 32: // checkboard, but with random colors
      let cellSize = wid / 4;
      for (let cols = 0; cols < 4; cols++) {
        for (let rows = 0; rows < 4; rows++) {
          let x = cols * cellSize;
          let y = rows * cellSize;
          fill(color(random(clrArr)));
          // fillGradient(
          //   'linear', {
          //     'from' : [posX, posY],
          //     'to'   : [posX + wid, posY + hei],
          //     'steps': [
          //       [color('#FFFFFF'), 0],
          //       [color(random(clrArr)), 1]
          //     ]
          //   }
          // );
          rect(x + posX, y + posY, cellSize, cellSize);
        }
      } 
      break;
    case 33 :// 1/4 arc, top right, bottom left
      arc(posX, posY + hei, wid, hei, PI + PI/2, TWO_PI);
      fill(color(random(clrArr)));
      arc(posX + wid, posY, wid, hei, PI/2, PI);
      break;
    case 34 :  // 1/4 arc, top left, bottom right
      arc(posX, posY, wid, hei, 0, PI/2);
      fill(color(random(clrArr)));
      arc(posX + wid, posY + hei, wid, hei, PI, PI + PI/2);
      break;
    case 35 : // semi-circle, from bottom
      arc(posX + wid/2, posY + hei, wid, hei, PI, TWO_PI); 
      break;
    case 36 : // semi-circle, from top
      arc(posX + wid/2, posY, wid, hei, 0, PI); 
      break;
    case 37 : // semi-circle, from right
      arc(posX + wid, posY + hei/2, wid, hei, PI/2, PI + PI/2);
      break;
    case 38 : // semi-circle, from left
      arc(posX, posY + hei/2, wid, hei, PI + PI/2, PI/2);
      break;
    case 39 : // circle, with small inner circle
      ellipseMode(CENTER);
      ellipse(posX+wid/2, posY+hei/2, wid-wid/4, hei-hei/4);
      fill(color(random(clrArr)));
      ellipse(posX+wid/2, posY+hei/2, wid/4, hei/4);
      break;
    case 40 : // small circle
      ellipse(posX+wid/2, posY+hei/2, wid/4, hei/4);
      break;
    case 41 : // petal from bottom right to top left
      let insetadjust = wid/6;
      let adPx = posX + insetadjust;
      let adPy = posY + insetadjust;
      let adW = wid - (insetadjust * 2);
      let adH = hei - (insetadjust * 2);
      beginShape();
        vertex(adPx, adPy);
        bezierVertex(adPx, adPy + adH/2, adPx + adW/2, adPy + adH, adPx + adW, adPy + adH);
        bezierVertex(adPx + adW, adPy + adH/2, adPx + adW/2, adPy, adPx, adPy);
      endShape();
      break;
    case 42 : // petal from bottom left to top right
      let insetadjust2 = wid/6;
      let adPx2 = posX + insetadjust2;
      let adPy2 = posY + insetadjust2;
      let adW2 = wid - (insetadjust2 * 2);
      let adH2 = hei - (insetadjust2 * 2);
      beginShape();
      vertex(adPx2 + adW2, adPy2);
      bezierVertex(adPx2 + adW2, adPy2 + adH2/2, adPx2 + adW2/2, adPy2 + adH2, adPx2, adPy2 + adH2);
      bezierVertex(adPx2, adPy2 + adH2/2, adPx2 + adW2/2, adPy2, adPx2 + adW2, adPy2);
      endShape();
      break;
    case 43 : // petals crossed
      let insetadjust3 = wid/6;
      let adPx3 = posX + insetadjust3;
      let adPy3 = posY + insetadjust3;
      let adW3 = wid - (insetadjust3 * 2);
      let adH3 = hei - (insetadjust3 * 2);
      beginShape();
      vertex(adPx3, adPy3);
      bezierVertex(adPx3, adPy3 + adH3/2, adPx3 + adW3/2, adPy3 + adH3, adPx3 + adW3, adPy3 + adH3);
      bezierVertex(adPx3 + adW3, adPy3 + adH3/2, adPx3 + adW3/2, adPy3, adPx3, adPy3);
      endShape();

      beginShape();
      vertex(adPx3 + adW3, adPy3);
      bezierVertex(adPx3 + adW3, adPy3 + adH3/2, adPx3 + adW3/2, adPy3 + adH3, adPx3, adPy3 + adH3);
      bezierVertex(adPx3, adPy3 + adH3/2, adPx3 + adW3/2, adPy3, adPx3 + adW3, adPy3);
      endShape();
      break;
    case 44 : // small triangle, top left
      triangle(posX, posY, posX + wid/2, posY, posX, posY + hei/2);
      break;
    case 45 : // small triangle, bottom left
      triangle(posX, posY + hei, posX + wid/2, posY + hei, posX, posY + hei/2);
      break;
    case 46 : // small triangle, top right
      triangle(posX + wid, posY, posX + wid/2, posY, posX + wid, posY + hei/2);
      break;
    case 47 : // small triangle, bottom right
      triangle(posX + wid, posY + hei, posX + wid/2, posY + hei, posX + wid, posY + hei/2);
      break;
    case 48: // checkboard with alternating colors 8x8
      let color1 = color(random(clrArr)); // First color
      let color2 = color(random(clrArr)); // Second color
      let cellSet = [2,4,8];
      let cellNum = random(cellSet);
      let cellSizeCheck = wid / cellNum;

      for (let cols = 0; cols < cellNum; cols++) {
        for (let rows = 0; rows < cellNum; rows++) {
          let x = cols * cellSizeCheck;
          let y = rows * cellSizeCheck;
          if ((cols + rows) % 2 == 0) {
            fill(color1);
          } else {
            fill(color2);
          }
          rect(x + posX, y + posY, cellSizeCheck, cellSizeCheck);
        }
      }
      break;
    case 49: // checkboard with alternating colors, 4x4
      let color1a = color(random(clrArr)); // First color
      let color2a = color(random(clrArr)); // Second color
      let cellSizeChecka = wid / 4;

      for (let cols = 0; cols < 4; cols++) {
        for (let rows = 0; rows < 4; rows++) {
          let x = cols * cellSizeChecka;
          let y = rows * cellSizeChecka;
          if ((cols + rows) % 2 == 0) {
            fill(color1a);
          } else {
            fill(color2a);
          }
          rect(x + posX, y + posY, cellSizeChecka, cellSizeChecka);
        }
      }
      break;
    case 50: // checkboard with alternating colors 2x2
      let color1b = color(random(clrArr)); // First color
      let color2b = color(random(clrArr)); // Second color
      let cellSizeCheckb = wid / 2;

      for (let cols = 0; cols < 2; cols++) {
        for (let rows = 0; rows < 2; rows++) {
          let x = cols * cellSizeCheckb;
          let y = rows * cellSizeCheckb;
          if ((cols + rows) % 2 == 0) {
            fill(color1b);
          } else {
            fill(color2b);
          }
          rect(x + posX, y + posY, cellSizeCheckb, cellSizeCheckb);
        }
      }
      break;
    case 51 : // checkboard with alternating colors 8x8
      let color1c = color(random(clrArr)); // First color
      let color2c = color(random(clrArr)); // Second color
      let cellSizeCheckc = wid / 8;

      for (let cols = 0; cols < 8; cols++) {
        for (let rows = 0; rows < 8; rows++) {
          let x = cols * cellSizeCheckc;
          let y = rows * cellSizeCheckc;
          if ((cols + rows) % 2 == 0) {
            fill(color1c);
          } else {
            fill(color2c);
          }
          rect(x + posX, y + posY, cellSizeCheckc, cellSizeCheckc);
        }
      }
      break;
    case 52 : // 1/4 circle, top left
      arc(posX, posY, wid/2, hei/2, 0, PI/2); 
      break;
    case 53 : // 1/4 circle, top right
      arc(posX + wid, posY, wid/2, hei/2, PI/2, PI); 
      break;
    case 54 : // 1/4 circle, bottom right
      arc(posX + wid, posY + hei, wid/2, hei/2, PI, PI + PI/2); 
      break;
    case 55 : // 1/4 circle, bottom left
      arc(posX, posY + hei, wid/2, hei/2, PI + PI/2, TWO_PI);
      break;
    case 56 : // double arc, top left
      arc(posX, posY, wid, hei, 0, PI/2); 
      fill(color(random(clrArr)));
      arc(posX, posY, wid/2, hei/2, 0, PI/2); 
      break;
    case 57 : // double arc, top right
      arc(posX + wid, posY, wid, hei, PI/2, PI); 
      fill(color(random(clrArr)));
      arc(posX + wid, posY, wid/2, hei/2, PI/2, PI); 
      break;
    case 58 : // double arc, bottom right
      arc(posX + wid, posY + hei, wid, hei, PI, PI + PI/2);
      fill(color(random(clrArr)));
      arc(posX + wid, posY + hei, wid/2, hei/2, PI, PI + PI/2);
      break;
    case 59 : // double arc, bottom left
      arc(posX, posY + hei, wid, hei, PI + PI/2, TWO_PI);
      fill(color(random(clrArr)));
      arc(posX, posY + hei, wid/2, hei/2, PI + PI/2, TWO_PI);
      break;
    case 60 : // pinwheel triangles
      triangle(posX, posY, posX + wid/2, posY + hei/2, posX, posY + hei/2);
      // fill(color(random(clrArr)));
      triangle(posX + wid/2, posY, posX + wid, posY, posX + wid/2, posY + hei/2);
      // fill(color(random(clrArr)));
      triangle(posX + wid/2, posY + hei/2, posX + wid, posY + hei/2, posX + wid, posY + hei);
      // fill(color(random(clrArr)));
      triangle(posX + wid/2, posY + hei/2, posX + wid/2, posY + hei, posX, posY + hei);
      break;
    case 61 : // horizontal bars
      let color1d = color(random(clrArr)); // First color
      let color2d = color(random(clrArr)); // Second color
      let barHeight = hei / 4;
      for (let i = 0; i < barHeight-1; i++) {
        if (i % 2 == 0) {
          fill(color1d);
        } else {
          fill(color2d);
        }
        rect(posX, posY + barHeight * i, wid, barHeight);
      }
      break;
    case 62 : // vertical bars
      let color1e = color(random(clrArr)); // First color
      let color2e = color(random(clrArr)); // Second color
      let barWidth = wid / 4;
      for (let i = 0; i < barWidth-1; i++) {
        if (i % 2 == 0) {
          fill(color1e);
        } else {
          fill(color2e);
        }
        rect(posX + barWidth * i, posY, barWidth, hei);
      }
      break;
    case 63 : // small circle, top left
      ellipseMode(CORNER);
      ellipse(posX + wid/8, posY + hei/8, wid/4, hei/4);
      ellipseMode(CENTER);
      break;
    case 64 : // small circle, top right
      ellipseMode(CORNER);
      ellipse(posX + wid/8 + wid/2, posY + hei/8, wid/4, hei/4);
      ellipseMode(CENTER);
      break;
    case 65 : // small circle, bottom left
      ellipseMode(CORNER);
      ellipse(posX + wid/8, posY + hei/8 + hei/2, wid/4, hei/4);
      ellipseMode(CENTER);
      break;
    case 66 : // small circle, bottom right
      ellipseMode(CORNER);
      ellipse(posX + wid/8 + wid/2, posY + hei/8 + hei/2, wid/4, hei/4);
      ellipseMode(CENTER);
      break;
    default:   // basic rectangle, full width
      rect(posX, posY, wid, hei);
      break;
  }
} 

function conCircle(x, y, d){
	push();
	while(d > 0){
		fill(random(clrArr));
    ellipseMode(CENTER);
    ellipse(x, y, d);
    rectMode(CENTER);
    rect(x, y, d, d);
		d -= 12;
	}
	pop();
}


/* ------------------------------------------------------------------------- */
/* COLOR PALETTES ---------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

function randomPalette() {
  palCount = Object.keys(palList.palettes);
  
  // Clear the array before rebuilding it
  revPalList.length = 0;
  
  for (i = 0; i < palCount.length; i++) {
    let palCol = palList.palettes[i].numColors;
    if (palCol == numClrs) {
      revPalList.push(i);
    }
  }
  
  // Use Math.random() instead of p5's random() to avoid seed interference
  let randomIndex = Math.floor(Math.random() * revPalList.length);
  randomPal = revPalList[randomIndex];

  // console.log("Number of colors requestd: " + numClrs);

  clrArr.length = 0;
  // console.log("Pick: " + palList.palettes[randomPal].name);
  for (let x = 0; x < palList.palettes[randomPal].numColors; x++) {
    let clr = color(palList.palettes[randomPal].colors[x]);
    clrArr.push(clr);
  }
}

function pickPaletteByNumClrs(clrCt) {
  let pCt = 0;

  console.log("TEST");

  for (i = 0; i < palCount.length; i++) {
    let palCol = palList.palettes[i].numColors;
    if (palCol == 2) {
      console.log("TEST");
      pCt++;
    }
  }
}


/* ------------------------------------------------------------------------- */
/* HELPER FUNCTIONS -------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

function success() {
  loadSuccessCounter++;
  if (loadSuccessCounter == numPalFiles) {
    console.log("All images loaded.");
    randomPalette();
  }
}

function failure(event) {
  console.log("NOOOOOOO!", event);
}

function generateSeed() {
  // Create a seed using timestamp to ensure it's always a whole number
  let currSeed = Math.floor(Date.now() + Math.random() * 1000);
  seed = currSeed;
  
  // Set the random seeds for p5.js
  randomSeed(seed);
  noiseSeed(seed);
  
  // Update the seed display in the UI
  let seedInput = document.getElementById("seedInput");
  if (seedInput) {
    seedInput.value = seed;
  }
}

// function keyPressed() {
//   console.log("Key pressed:", key);
//   if (key == 's' || key == 'S') {
//     console.log("S key detected - calling saveAnSVG()");
//     saveAnSVG();
//   }
//   if (key == 'n' || key == 'N') {
//     console.log("N key detected - calling savePNG()");
//     savePNG();
//   }
//   if (key == 'r' || key == 'R') {
//     console.log("R key detected - calling randomLayoutAndClr()");
//     randomLayoutAndClr();
//   }
//   if (key == 'p' || key == 'P') {
//     console.log("P key detected - calling randomGridRecursion()");
//     randomGridRecursion();
//   }
//   if (key == 'c' || key == 'C') {
//     console.log("C key detected - calling randomizeCellPadding()");
//     randomizeCellPadding();
//   }
//   if (key == 'o' || key == 'O') {
//     console.log("O key detected - calling randomColorPalette()");
//     randomColorPalette();
//   }
// }

function clamp(val, min, max) {
  return val < min ? min : (val > max ? max : val);
}

function updateGrid() {
  revPalList.length = 0;
  redraw();
}

function saveAnSVG() {
  let numPalRegex   = /(\S+--\d+)(.png)/;
  let clrPal        = numPalRegex.exec(palList.palettes[randomPal].name);  
  let fileName = "grid-" + "-pal-" + clrPal[1] + "-" + seed;
  
  // For p5.js-svg library, we need to save without extension
  save(fileName);
}

function savePNG() {
  let numPalRegex   = /(\S+--\d+)(.png)/;
  let clrPal        = numPalRegex.exec(palList.palettes[randomPal].name);
  let fileName = "grid-" + "-pal-" + clrPal[1] + "-" + seed + ".png";
  save(fileName);
}

function randomGridRecursion() {
  removeElements();
  background(color(random(clrArr)));
  let randomRecursion = Math.floor(Math.random() * 8) + 2; // Random between 2-9
  recurseCt = randomRecursion;
  wRecurseVal.value = randomRecursion;
  wRecurseAmt.value = randomRecursion;
  createCell(pad, pad, w-pad * 2, w-pad * 2, randomRecursion);
}

function randomLayoutAndClr() {
  removeElements();
  clrArr.length = 0;
  randomPalette();
  background(color(random(clrArr)));
  createCell(pad, pad, w-pad * 2, w-pad * 2, recurseCt);
}

function randomColorPalette() {
  // Check if palList is loaded
  if (!palList) {
    console.error("palList is null or undefined");
    return;
  }
  
  if (!palList.palettes) {
    console.error("palList.palettes is null or undefined");
    return;
  }
  
  if (palList.palettes.length === 0) {
    console.error("palList.palettes is empty");
    return;
  }
  
  // Use JavaScript's Math.random() instead of p5's random() to avoid seed interference
  randomPal = Math.floor(Math.random() * palList.palettes.length);
  
  // Check if the selected palette exists
  if (!palList.palettes[randomPal]) {
    console.error("Selected palette doesn't exist:", randomPal);
    return;
  }
  
  // Update numClrs to match the selected palette
  numClrs = palList.palettes[randomPal].numColors;
  
  // Update the UI controls to reflect the new number of colors
  wColorsInPalAmt.value = numClrs;
  wColorsInPalVal.value = numClrs;
  
  // Clear and rebuild the color array
  clrArr.length = 0;
  for (let x = 0; x < palList.palettes[randomPal].numColors; x++) {
    let clr = color(palList.palettes[randomPal].colors[x]);
    clrArr.push(clr);
  }
  
  updateGrid();
}

function randomShapeSet() {
  pickType = "random-shape-set";
  pickedSet = Math.floor(Math.random() * pickOpts.length); 
  wSelectShapeSet.value = pickedSet
  updateGrid();
}

function randomIndividualShape() {
  pickType = "random-individual-shape";
  
  // Get all available option values from the select element
  let availableOptions = [];
  for (let i = 0; i < wSelectIndShape.options.length; i++) {
    availableOptions.push(parseInt(wSelectIndShape.options[i].value));
  }
  
  // Pick a random option from the available ones using Math.random() to avoid seed interference
  let randomIndex = Math.floor(Math.random() * availableOptions.length);
  pickOption = availableOptions[randomIndex];
  
  // Update the select element
  wSelectIndShape.value = pickOption;
  updateGrid();
}

function randomizeCellPadding() {
  // Generate a random cell padding between 0 and 8 using Math.random() to avoid seed interference
  let randomPadding = Math.floor(Math.random() * 9);
  cellPad = randomPadding;
  
  // Update the UI controls to reflect the new value
  wCellPadAmt.value = randomPadding;
  wCellPadVal.value = randomPadding;
  
  updateGrid();
}

function setCellPad(newCellPad) {
  cellPad = newCellPad;
  updateGrid();
}

function refreshGrid() {
  // Generate a new grid with current settings by creating a new seed
  // This will give you a different layout while keeping all current settings
  console.log("Refreshing grid with current settings");
  generateSeed();  // Generate new random seed
  updateGrid();    // Redraw with the new seed
}

function copySeedToClipboard() {
  const seedInput = document.getElementById("seedInput");
  if (seedInput && seedInput.value) {
    // Try using the modern Clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(seedInput.value).then(() => {
        console.log("Seed copied to clipboard:", seedInput.value);
        // Optional: Show a brief visual feedback
        showCopyFeedback();
      }).catch(err => {
        console.error("Failed to copy seed:", err);
        // Fallback to older method
        fallbackCopyToClipboard(seedInput);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyToClipboard(seedInput);
    }
  }
}

function fallbackCopyToClipboard(element) {
  element.select();
  element.setSelectionRange(0, 99999); // For mobile devices
  try {
    document.execCommand('copy');
    console.log("Seed copied to clipboard (fallback):", element.value);
    showCopyFeedback();
  } catch (err) {
    console.error("Failed to copy seed (fallback):", err);
  }
}

function showCopyFeedback() {
  // Simple visual feedback - change button appearance briefly
  const copyBtn = document.getElementById("btnCopySeed");
  if (copyBtn) {
    copyBtn.style.opacity = "0.6";
    setTimeout(() => {
      copyBtn.style.opacity = "1";
    }, 200);
  }
}

function handleSeedInput(event) {
  // Handle Enter key press to apply the seed
  if (event.key === 'Enter') {
    event.preventDefault();
    const seedInput = document.getElementById("seedInput");
    const inputValue = seedInput.value.trim();
    
    // Validate that the input is a number
    if (inputValue === '' || isNaN(inputValue)) {
      alert('Please enter a valid numeric seed value');
      return;
    }
    
    const newSeed = parseInt(inputValue);
    if (newSeed < 0) {
      alert('Please enter a positive seed value');
      return;
    }
    
    // Apply the specified seed
    applySpecificSeed(newSeed);
  }
}

function applySpecificSeed(specificSeed) {
  // Set the global seed to the specified value
  seed = specificSeed;
  
  // Update the input field to show the clean seed value
  const seedInput = document.getElementById("seedInput");
  if (seedInput) {
    seedInput.value = seed;
  }
  
  console.log("Applying specific seed:", seed);
  
  // Set the random seed for p5.js to use our specific seed
  randomSeed(seed);
  noiseSeed(seed);
  
  // Regenerate the grid with the new seed
  updateGrid();
}