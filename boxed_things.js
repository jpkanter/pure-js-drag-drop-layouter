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

    active = false;
    activeItem = null;
    activeMode = null;
}

function drag(e) {
    if( active ) {

        e.preventDefault();

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
        }

        if( activeMode === 6 ) {
            let newWidth = e.clientX - activeItem.initialX;
            setDimension(newWidth, 0, activeItem);
        } 
        hoverElements = document.elementsFromPoint(e.clientX, e.clientY)
        document.querySelector('#position_thingy')
            .innerHTML = "<pre>[" + e.clientX + "|" + e.clientY + "]</pre>";
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
            let minDistance = 99999;
            let closestElement = null;
            let angle = 0;
            notes.innerHTML = "";
            for( const node of nodeList) {
                node.style.outline = "1px dashed #FF06B5";
                let coords = getCoords(node);
                let tempDist = getBoxDistance2Point(
                    e.clientX, e.clientY,
                    coords.left, coords.top, coords.right, coords.bottom);
                console.log(node.id + " - " + tempDist);
                if( tempDist < minDistance ) {
                    //minDistance = tempDist;
                    closestElement = node;
                    angle = getBox2PointDirection(e.clientX, e.clientY,
                        coords.left, coords.top, coords.right, coords.bottom);
                }
            }
            closestElement.style.outline = "1px dotted green";
            if( closestElement.children.length > 0 ) {
                let xFactor = 1;
                let yFactor = 0;
                
                let brandNew = document.createElement('div')
                brandNew.className = "target_field";

                console.log(angle + " bla " + gridCoordinates(closestElement, angle));
                brandNew.style.gridArea = gridCoordinates(closestElement, angle);
                document.querySelector('#'+KONST_ID_the_grid).appendChild(brandNew);
            }
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

function randomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
         color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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

function getBoxDistance2Point(PointX, PointY, BoxX1, BoxY1, BoxX2, BoxY2) {
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
    //let dx = Math.max(BoxX1 - PointX, 0, PointX - BoxX2);
    //let dy = Math.max(BoxY1 - PointY, 0, PointY - BoxY2);
    let cx = Math.max(Math.min(PointX, BoxX2), BoxX1);
    let cy = Math.max(Math.min(PointY, BoxY2), BoxY1);
    //return Math.sqrt(dx*dx + dy*dy);
    console.log(`Point [${PointX};${PointY}] Box[[${BoxX1};${BoxY1}][${BoxX2};${BoxY2}]]`)
    return Math.sqrt((PointX-cx)*(PointX-cx) + (PointY-cy)*(PointY-cy))
    // Math.hypot(dx, dy) in case of extreme high dx/dy
}

function getBox2PointDirection(PointX, PointY, BoxX1, BoxY1, BoxX2, BoxY2) {
    let MidX = BoxX1 + (BoxX2-BoxX1)/2
    let MidY = BoxY1 + (BoxY2-BoxY1)/2
    let angle = Math.atan2(PointY - MidY, PointX - MidX) * 180 / Math.PI;

    if( angle => -135 && angle < -45) { return 2; }
    else if ( angle => -45 && angle < 45 ) { return 1; }
    else if ( angle => 45 && angle < 135 ) { return 3; }
    else { return 0;}
}

function gridCoordinates(el, direction) {
    // 0 = left, 1 = right, 2 = top, 3 = bottom
    let others = {'l': 0, 'r': 1, 't': 2, 'b': 3,
            'left': 0, 'right': 1, 'top': 2, 'bottom': 3 }
    Object.keys(others).forEach(function(key, index) {
        if( direction === key ) {
            direction = this[key];
            return true;
        }
        }, others); //sometimes i have the feeling i am doing things to complicated

    let left = parseInt(el.style.gridColumnStart);
    let top = parseInt(el.style.gridRowStart);
    let right = parseInt(el.style.gridColumnEnd);
    let bottom = parseInt(el.style.gridRowEnd);
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