var tileCnt = 0;
var tiles;
var currentTile = "blank.png"; 
var tileBrushNums = new Array();
var currentBrushNum = -1;

let mouseDown = false;

document.addEventListener("mousedown", () => {mouseDown = true;});
document.addEventListener("mouseup", () => {mouseDown = false;});

function makeTileArray(rows, cols) {
    rows = parseInt(rows);
    cols = parseInt(cols);
    tiles = [];
    tiles = new Array(rows);
    for(var i=0; i<tiles.length; i++){
        tiles[i] = new Array(cols);
    }
    console.log('Resized canvas to ' + rows + 'x' + cols);
}

function setTileBrushNum(brushId, newNum){
    newNum = parseInt(newNum);
    var brush = document.getElementById(brushId);
    if(tileBrushNums.length >= brushId.split('_')[1]){ //Brush has already been added, we just need to change its number.
        tileBrushNums[brushId.split('_')[1]] = newNum;
    } else {                                           //Brush is being added for the first time.
        tileBrushNums.push(newNum);
    }
}

function setSelectedTileBrushNum() {
    let brushId = document.getElementsByClassName('selectedTileImg')[0].id;
    setTileBrushNum(brushId, document.getElementById('tileNumberInput').value);
    currentBrushNum = document.getElementById('tileNumberInput').value;
    console.log('Changed the selected brush number to ' + document.getElementById('tileNumberInput').value);
}

const grid = document.getElementById('grid');

function newGrid() {
    var rows = document.getElementById('rowsInput').value;
    var cols = document.getElementById('colsInput').value;

    makeTileArray(rows, cols);
    makeGrid(rows, cols);
}

function makeGrid(rows, cols) {
    if(parseInt(cols) > parseInt(rows)) {
        grid.style.setProperty("min-width", "95%");
        grid.style.setProperty("min-height", "0");
    } else {
        grid.style.setProperty("min-width", "0");
        grid.style.setProperty("min-height", "100%");
    }
    
    console.log("W: " + window.getComputedStyle(document.getElementById("grid")).minWidth);
    console.log("H: " + window.getComputedStyle(document.getElementById("grid")).minHeight);

    grid.innerHTML = "";
    
    grid.style.setProperty('--grid-rows', rows);
    grid.style.setProperty('--grid-cols', cols);

    var row = 0;
    var col = 0;

    for (c = 0; c < (rows * cols); c++) {
        let cell = document.createElement("img");
        cell.setAttribute('draggable', false);
        cell.id = 'tile_' + row.toString() + '_' + col.toString();
        cell.setAttribute("src", "blank.png");

        let preventRepaint = false;

        function repaintSelf() {
            preventRepaint = true;

            cell.src = currentTile;
            tiles[cell.id.split('_')[1]][cell.id.split('_')[2]] = currentBrushNum; // Changes the value of the tile's corresponding array location

            console.log('Painted (' + cell.id.split('_')[1] + ',' + cell.id.split('_')[2] + ') with: ' + currentBrushNum);
        }

        cell.addEventListener("click",  () => {
            if(!preventRepaint) {repaintSelf()} 
        });
        cell.addEventListener('mousemove', () => {
            if(!preventRepaint && mouseDown) repaintSelf()
        });
        cell.addEventListener("mouseout", () => {preventRepaint = false});

        grid.appendChild(cell).className = "grid-item";

        /*
        if(rows > cols){
            cell.style.width = cell.offsetHeight.toString() + 'px';

        } else {
            cell.style.height = cell.offsetWidth.toString() + 'px';

        }
        */

        col++;
        if(col == cols){
            col = 0;
            row++;
        }
    };
};

//Takes a string of numbers in grid form and maps them onto the tiles, starting with a given tile
function mapNumsToTiles(numString, firstTileId) {
    let firstRow = firstTileId.split('_')[1];
    let firstCol = firstTileId.split('_')[2];

    //Turn the string matrix into a 2D array
    numMatrix = numString.split('\n');
    for(var i=0; i<numMatrix.length; i++){
        numMatrix[i] = numMatrix[i].split(' ');
    }

    console.log(numMatrix);
    var i = 0;
    var j = 0;

    // Map the numbers onto the grid, cutting them off where necessary
    while(i < numMatrix.length && i + parseInt(firstRow) < tiles.length) {
        while(j < numMatrix[0].length && j + parseInt(firstCol) < tiles[0].length ) {
            
            let offsetI = parseInt(i) + parseInt(firstRow);
            let offsetJ = parseInt(j) + parseInt(firstCol);
            let tileBrushIndex = tileBrushNums.findIndex((element) => element == numMatrix[i][j]);

            //Set the img src of the current tile to that of the tile whose brushNum matches the current number in the matrix
            console.log(numMatrix[i][j]);
            console.log('tileBrush_' + tileBrushIndex);
            document.getElementById('tile_' + offsetI + '_' + offsetJ).src =
                document.getElementById('tileBrush_' + tileBrushIndex).src; 


            //Update the 2D tile array in line with the numMatrix
            tiles[offsetI][offsetJ] = numMatrix[i][j];

            j++;
        }
        j = 0;
        i++;
    }
}

function loadTileBrushes(event) {
    for(var i=0; i<event.target.files.length; i++){
        var newTile = document.createElement("img");
         newTile.setAttribute('draggable', false);

        newTile.className = "tileImg";
        newTile.id = 'tileBrush_' + tileCnt.toString();
        setTileBrushNum(newTile.id, tileCnt);

        document.getElementById('uiTilesBox').appendChild(newTile);

        tileCnt++;

        newTile.src = URL.createObjectURL(event.target.files[i]);
       
        newTile.addEventListener('click', function() {
            for(var i=0; i<tileCnt; i++){
                document.getElementById('uiTilesBox').children[i].classList.remove('selectedTileImg');
            }
            currentTile = this.src;
            currentBrushNum = tileBrushNums[this.id.split('_')[1]];
            document.getElementById('tileNumberInput').value = currentBrushNum;
            this.classList.add("selectedTileImg");
        });
    }
    console.log('Loaded in new tile brush(es). Current brush nums: ' + tileBrushNums);
};

function resizeGrid() {
    var rows = document.getElementById('rowsInput').value;
    var cols = document.getElementById('colsInput').value;

    var content = '';
    for(var i=0; i<tiles.length; i++){
        for(var j=0; j<tiles[i].length; j++){
            content += tiles[i][j];
            if(j<tiles[i].length-1){
                content += ' ';
            }
        }
        content += '\n';
    }
    console.log(content);

    makeTileArray(rows, cols);
    makeGrid(rows, cols);
    mapNumsToTiles(content, 'tile_0_0');
}

function generateFile() {
    var content = '';
    for(var i=0; i<tiles.length; i++){
        for(var j=0; j<tiles[i].length; j++){
            content += tiles[i][j] + ' ';
        }
        content += '\n';
    }
    console.log(content);

    // Store the final output in a blob, then convert that to a file
    const array = [content];
    const blob = new Blob(array, {type : 'text/html'});
    console.log(blob);

    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = document.getElementById('fileNameInput').value + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    console.log('File downloaded:')
    console.log(file);
}

makeTileArray(12,12);
makeGrid(12,12);




