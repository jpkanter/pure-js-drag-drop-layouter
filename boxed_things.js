var active = false;
var activeItem = null;
var activeMode = null;
var container = null;

const KONST_target_area = "target_area_default";

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
                    console.log(e.clientX + "\t" + e.clientY + "\t" 
                    + activeItem.offsetLeft + "\t" + activeItem.offsetTop + "\t"
                    + activeItem.offsetWidth + "\t" + activeItem.offsetHeight);
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
                if( val.id === KONST_target_area ) {
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
        for( const val of hoverElements ) {
            if( val.id === KONST_target_area ) {
                //do things with the thing
                break;
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
