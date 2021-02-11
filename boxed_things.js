var active = false;
var activeItem = null;
var activeMode = null;
var container = null;

const KONST_CLASS_target_area = "target_field";
const KONST_ID_default_target_area = "target_area_default";
const KONST_ID_staging_area = "resting_place";
const KONST_ID_the_grid = "design_grid";

docReady(function() {
    container = document.querySelector("#staging");
    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);
    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);
    document.querySelector('#position_thingy')
            .innerHTML = "<pre>[" + container.offsetLeft + "|" + container.offsetTop + "]</pre>";
    info = document.querySelector('#info_area');
    let color = randomColor();
    info.style.background = color
    info.style.color = invertColor(color, true);
});

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}    

function dragStart(e) {
    e.preventDefault;
    
    if (e.target.parentElement !== e.currentTarget.parentElement) {
        if( e.target.parentElement.className === "outer_box") {
            active = true;
            switch( e.target.className ) {
                case 'corner_lt': activeMode = 1; break;
                case 'corner_rt': activeMode = 2; break;
                case 'corner_rb': activeMode = 3; break;
                case 'corner_lb': activeMode = 4; break;
                case 'border_t': activeMode = 5; break;
                case 'border_r': activeMode = 6; break;
                case 'border_b': activeMode = 7; break;
                case 'border_l': activeMode = 8; break;

                default: //or content_box
                    e.target.style.cursor ="grabbing";
                    activeMode = 0; 
                    break;
            }
            activeItem = e.target.parentElement;
            //initialize vars
            if( activeItem !== null) {
                if (!activeItem.xOffeset) {
                    activeItem.xOffset = 0;
                }
                if (!activeItem.yOffset) {
                    activeItem.yOffset = 0;
                }
            }
            if( activeMode === 0 ) {
                if (e.type === "touchstart") {
                    activeItem.initialX = e.touches[0].clientX - activeItem.xOffset;
                    activeItem.initialY = e.touches[0].clientY - activeItem.yOffset;
                  } 
                else {
                    activeItem.initialX = e.clientX - activeItem.offsetWidth/2
                    activeItem.initialY = e.clientY - activeItem.offsetHeight/2
                    activeItem.style.position = "fixed";
                    setTranslate(activeItem.initialX, activeItem.initialY, activeItem);
                }
                document.querySelector('#grid_place').append(activeItem);
            }
            if( activeMode === 6 ) {
                activeItem.initialX = e.clientX - activeItem.xOffset - activeItem.offsetWidth;
            }
        }
    }
    
}

function dragEnd(e) {
    var step_width = 164;
    var step_height = 30;
    let snapBack = true;
    if (activeItem !== null) {
        activeItem.initialX = activeItem.currentX;
        activeItem.initialY = activeItem.currentY;

        //resetCursor
        if( activeMode === 0 ) {
            e.target.style.cursor = "grab";
            hoverElements = document.elementsFromPoint(e.clientX, e.clientY)
            for( const val of hoverElements ) {
                if( val.className === KONST_CLASS_target_area ) {
                    val.appendChild(activeItem);
                    snapBack = false;
                    break;
                }
            }
            if( snapBack ) {
                document.querySelector('#grid_place').append(activeItem);
            }
            activeItem.style = null;
        }
        
        if( activeMode === 6) { //snap to width
            let newWidth = Math.round(activeItem.offsetWidth / step_width)*step_width
            if( newWidth <= 0 ) { newWidth = step_width; }
            setDimension(newWidth,0, activeItem);
            contentBox = activeItem.querySelector('.content_box');
            setDimension(newWidth-14, 0, contentBox);
        }

      }

    //clear empty fields:
    nodeList = document.querySelector(`#${KONST_ID_the_grid}`).querySelectorAll(`.${KONST_CLASS_target_area}`);
    for( const divField of nodeList ) {
        if( divField.isEmpty() && divField.id !== KONST_ID_default_target_area) {
            divField.remove();
        }
    }
    //move entire grid one to  the right/bottom if any field is 1 / 1
    //nodeList is static so it needs to be retrieved anew
    nodeList = document.querySelector(`#${KONST_ID_the_grid}`).querySelectorAll(`.${KONST_CLASS_target_area}`);
    let moveRight = false;
    let moveBot = false;
    for( const divNode of nodeList ) {
        if( parseInt(divNode.style.gridColumnStart) === 1 ) {moveRight = true;}
        if( parseInt(divNode.style.gridRowStart) === 1 ) {moveBot = true;}
    }
    if( moveRight || moveBot ) {
        moveRight = moveRight ? 1 : 0;
        moveBot = moveBot ? 1 : 0; 
        console.log(`Right: ${moveRight} - Bot: ${moveBot}`);
        for( const divNode of nodeList ) {
            divNode.style.gridColumnStart = parseInt(divNode.style.gridColumnStart) + moveRight
            divNode.style.gridColumnEnd = parseInt(divNode.style.gridColumnEnd) + moveRight
            divNode.style.gridRowStart = parseInt(divNode.style.gridRowStart) + moveBot
            divNode.style.gridRowEnd = parseInt(divNode.style.gridRowEnd) + moveBot
        }
    }

    active = false;
    activeItem = null;
    activeMode = null;
}

function drag(e) {
    if( active ) {

        e.preventDefault();

        document.querySelector('#position_thingy')
                .innerHTML = `<pre>[${e.clientX}|${e.clientY}]</pre>`;
                
        if( activeMode === 0 ) {
            if (e.type === "touchmove") {
                activeItem.currentX = e.touches[0].clientX - activeItem.initialX;
                activeItem.currentY = e.touches[0].clientY - activeItem.initialY;
            } 
            else {  
                activeItem.currentX = e.clientX - activeItem.initialX;
                activeItem.currentY = e.clientY - activeItem.initialY;
            }
    
            activeItem.xOffset = activeItem.currentX;
            activeItem.yOffset = activeItem.currentY;

            let MiddleX = e.clientX - activeItem.offsetWidth/2;
            let MiddleY = e.clientY - activeItem.offsetHeight/2;
    
            //setTranslate(activeItem.currentX, activeItem.currentY, activeItem);
            setTranslate(MiddleX, MiddleY, activeItem);
            handleGridLayouter(e);
        }

        if( activeMode === 6 ) {
            let newWidth = e.clientX - activeItem.initialX;
            setDimension(newWidth, 0, activeItem);
        } 
        
    }
}

function setTranslate(xPos, yPos, el) {
    //el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
    el.style.left = xPos;
    el.style.top = yPos;
  }

function setDimension(width = 0, height = 0, el) {
    if( width !== 0 ) { el.style.width = width; }
    if( height !== 0 ) { el.style.height = height; }
}

function handleGridLayouter(e) {
    hoverElements = document.elementsFromPoint(e.clientX, e.clientY)
    let overTarget = false;
    let insideStaging = false;
    for( const val of hoverElements ) {
        if( val.className === KONST_CLASS_target_area ) {
            //do things with the thing
            overTarget = true;
        }

        if( val.id === KONST_ID_staging_area ) { insideStaging = true;}
    }

    if( insideStaging && !overTarget ) {
        let staging = document.querySelector('#'+KONST_ID_staging_area);
        let nodeList = staging.querySelectorAll('.'+KONST_CLASS_target_area);
        let notes = document.querySelector('#notice_area');
        let currentClosest = 40962048.0;
        let closestElement = null;
        let angle = 0.0;
        for( const node of nodeList) {
            node.style.outline = "1px dashed #FF06B5";
            let coords = getCoords(node);
            let tempDist = getBoxDistance2Point(
                e.clientX, e.clientY,
                coords.left, coords.top, coords.right, coords.bottom);
            if( tempDist < currentClosest ) {
                currentClosest = tempDist;
                closestElement = node;
                angle = getBox2PointDirection(e.clientX, e.clientY,
                    coords.left, coords.top, coords.right, coords.bottom);
            }
        }
        closestElement.style.outline = "1px dotted green";
        if( !closestElement.isEmpty() ) {
            insertGridField(document.querySelector('#'+KONST_ID_the_grid), gridCoordinates(closestElement, angle));
            notes.textContent = `New Node: ${gridCoordinates(closestElement, angle)}, Element: "${closestElement.id}[${closestElement.className}]"`
        }
    }
}

function insertGridField(target, coordinates) {
    if( coordinates.trim() === "" ) { return 0;}
    let nodes = target.querySelectorAll('.target_field');
    for( const div of nodes) {
        if( div.style.gridArea === coordinates ) { return 0;}
    }
    let brandNew = document.createElement('div')
    brandNew.className = "target_field";
    brandNew.style.gridArea = coordinates;
    brandNew.id = coordinates;
    let color = randomColor();
    info.style.background = color
    info.style.outelineColor = invertColor(color);
    target.appendChild(brandNew);
}

function getCoords(elem) {
    // https://javascript.info/coordinates
    let box = elem.getBoundingClientRect();
  
    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset
    };
  }

function getBoxDistance2Point(Px, Py, Left, Top, Right, Bottom) {
    //Px, Py, Top, Left, Bottom, Right
    /*
     X1/Y1
        ------------
        |          |
        |          |    x
        |          |     PX/PY
        ------------
                    X2/Y2
    */
    //assuming said box isnt rotated, aligning to a grid
    //tbh i struggled a bit to see the math behind this at first, so this is two times the same thing
    //let dx = Math.max(Left - Px, 0, Px - Right);
    //let dy = Math.max(Top - Py, 0, Py - Bottom);
    let cx = Math.max(Math.min(Px, Right), Left);
    let cy = Math.max(Math.min(Py, Bottom), Top);
    //return 
    //let temp = Math.sqrt(dx*dx + dy*dy);
    //let temp2 = Math.sqrt((Px-cx)*(Px-cx) + (Py-cy)*(Py-cy))
    //console.log(`Point [${Px};${Py}] Box[[${Left};${Top}][${Right};${Bottom}]] -> ${temp} vs ${temp2}`);
    return Math.sqrt((Px-cx)*(Px-cx) + (Py-cy)*(Py-cy))
    // Math.hypot(dx, dy) in case of extreme high dx/dy
}

function getBox2PointDirection(Px, Py, Left, Top, Right, Bottom) {
    let MidX = Left + (Right-Left)/2
    let MidY = Top + (Bottom-Top)/2
    let angle = Math.atan2(Py - MidY, Px - MidX) * 180 / Math.PI;

    let dir = 0;

    if( angle >= -135.0 && angle < -45.0 ) { dir = 2; }
    else if ( angle >= -45.0 && angle < 45.0 ) { dir = 1; }
    else if ( angle >= 45.0 && angle < 135.0 ) { dir = 3; }
    else { dir = 0;}
    let temp = document.querySelector('#info_area')
    temp.innerHTML = `${angle.toFixed(2)}(${typeof(angle)}) -> ${dir}`;
    return dir;
}

function gridCoordinates(el, direction) {
    // 0 = left, 1 = right, 2 = top, 3 = bottom
    let others = {'l': 0, 'r': 1, 't': 2, 'b': 3,
            'left': 0, 'right': 1, 'top': 2, 'bottom': 3 }
    /*Object.keys(others).forEach(function(key, index) {
        if( direction === key ) { direction = this[key]; return true;} }, others); */
    //sometimes i have the feeling i am doing things to complicated

    let left = parseInt(el.style.gridColumnStart);
        left = isNaN(left) ? 0 : left;
    let top = parseInt(el.style.gridRowStart);
        top = isNaN(top) ? 0 : top;
    let right = parseInt(el.style.gridColumnEnd);
        right = isNaN(right) ? 0 : right;
    let bottom = parseInt(el.style.gridRowEnd);
        bottom = isNaN(bottom) ? 0 : bottom;
    if( direction === 0 ) { //could have used switch instead, oh well...
        return `${top} / ${left-1} /${bottom} / ${right-1} `; //ES6 feature, shouldnt be a problen in 2021 right?
    }
    else if( direction === 1) {
        return `${top} / ${left+1} / ${bottom} / ${right+1}`;
    }
    else if( direction === 2 ) {
        return `${top-1} / ${left} / ${bottom-1} / ${right}`;
    }
    else {
        return `${top+1} / ${left} / ${bottom+1} / ${right}`;
    }
}

//tools and functionality

Element.prototype.isEmpty = function() {
    return this.innerHTML.trim() === "";
  }

  function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
         color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function padZero(str, len) { len = len || 2; var zeros = new Array(len).join('0'); return (zeros + str).slice(-len); }

function invertColor(hex, bw = false) {
    // https://stackoverflow.com/questions/35969656/how-can-i-generate-the-opposite-color-according-to-current-color
    if (hex.indexOf('#') === 0) {
        hex = hex.slice(1);
    }
    // convert 3-digit hex to 6-digits.
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length !== 6) {
        throw new Error('Invalid HEX color.');
    }
    var r = parseInt(hex.slice(0, 2), 16),
        g = parseInt(hex.slice(2, 4), 16),
        b = parseInt(hex.slice(4, 6), 16);
    if (bw) {
        // http://stackoverflow.com/a/3943023/112731
        return (r * 0.299 + g * 0.587 + b * 0.114) > 186
            ? '#000000'
            : '#FFFFFF';
    }
    // invert color components
    r = (255 - r).toString(16);
    g = (255 - g).toString(16);
    b = (255 - b).toString(16);
    // pad each with zeros and return
    return "#" + padZero(r) + padZero(g) + padZero(b);
}