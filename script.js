
// The game loop call interval in milliseconds
const GAME_LOOP_INTERVAL = 20;
// The game's framerate
const GAME_FRAME_RATE = 1000 / GAME_LOOP_INTERVAL;

// Load the element in which the game will be rendered
var canvas_element = document.querySelector("#game_canvas");

var game_board = {
    'width' : 50,        // How many columns on the game board
    'height' : 25,        // How many rows on the game board
    'column_size' : 20,         // Column size in Pixels
    /* Data that is used to construct the game board */
    'board_data' : []           
}
// A function that creates the board columns
function box_board(){
    // Set the game canvas's width to be Horizontal_number_of_columns * Column_width
    canvas_element.style.width = game_board.width * game_board.column_size;
    for(var y = 1 ; y <= game_board.height; y++){
        // Creates a div called row to hold a single row of columns
        canvas_element.innerHTML += `<div class="row"></div>`;
        // Get the previously created row to create columns with in it
        var row = canvas_element.querySelector(`#game_canvas > :nth-child(${y})`);
        for(var x = 1; x <= game_board.width; x++){
            // Create a column inside of the row and give it an id of {row_[current_row_number]_col_[this_col_number]}
            row.innerHTML += `<div id="row_${y}_col_${x}" class="column"></div>`;
        }
    }
}

// Get a column with it's x , y coordinates
function getColumn(x , y){
    return document.querySelector(`#row_${y}_col_${x}`);
}
box_board();




// This function set's a specific column to contain a wall
function addWall(x , y){
    // First We Get the Column
    var column = getColumn(x , y);
    // Check if the column already contains an element
    if(column.childElementCount != 0){
        // Log Error to console
        console.log("OPERATION [ADD WALL] FAILED");
        console.log(`Column [${x} , ${y}] is already set.`)
    }else{
        // Create the wall
        column.innerHTML = '<div class="wall"></div>';
        wallGraphicCorrection(x , y);
    }
}


// Checks for wall neighbours to remove unnecessary borders
function wallGraphicCorrection(x , y){
    var top = checkTopNeighbour(x , y);         // Gets the top neighbour
    var right = checkRightNeighbour(x , y);     // Gets the right neighbour
    var bottom = checkBottomNeighbour(x , y);   // Gets the bottom neighbour
    var left = checkLeftNeighbour(x , y);       // Gets the left neighbour
    if(top){
        getColumn(x , y).querySelector('.wall').style.borderTop = 'none';           // Remove the top border of the current wall
        getColumn(x , y - 1).querySelector('.wall').style.borderBottom = 'none';    // Remove the bottom border of the top wall
    }
    if(right){
        getColumn(x , y).querySelector('.wall').style.borderRight = 'none';         // Remove the right border of the current wall
        getColumn(x + 1 , y).querySelector('.wall').style.borderLeft = 'none';      // Remove the left border of the right wall
    }
    if(bottom){
        getColumn(x , y).querySelector('.wall').style.borderBottom = 'none';        // Remove the bottom border of the current wall
        getColumn(x , y + 1).querySelector('.wall').style.borderTop = 'none';;      // Remove the top border of the bottom wall
    }
    if(left){
        getColumn(x , y).querySelector('.wall').style.borderLeft = 'none';          // Remove the left border of the current wall
        getColumn(x - 1, y).querySelector('.wall').style.borderRight = 'none';      // Remove the right border of the left wall
    }

}

// Checks if the top neighbour of the column [x , y] contains a wall
function checkTopNeighbour(x , y){
    // Checks if the referred column is on the top row
    if(y > 1){
        var top = getColumn(x , y - 1).querySelector('.wall');
        if(top)
            return top;
        return false;
    }
    return false;
}

// Checks if the bottom neighbour of the column [x , y] contains a wall
function checkBottomNeighbour(x , y){
    // Checks if the referred column is on the bottom row
    if(y < game_board.height){
        var bottom = getColumn(x , y + 1).querySelector('.wall');
        if(bottom)
            return bottom;
        return false;
    }
    return false;
}

// Checks if the left neighbour of the column [x , y] contains a wall
function checkLeftNeighbour(x , y){
    // Checks if the referred column is on the left side of the board
    if(x > 1){
        var left = getColumn(x - 1, y).querySelector('.wall');
        if(left)
            return left;
        return false;
    }
    return false;
}

// Checks if the right neighbour of the column [x , y] contains a wall
function checkRightNeighbour(x , y){
    // Checks if the referred column is on the right side of the board
    if(x < game_board.width){
        var right = getColumn(x + 1, y).querySelector('.wall');
        if(right)
            return right;
        return false;
    }
    return false;
}

// This function set's a specific column to contain a coin
function addCoin(x , y){
    // First We Get the Column
    var column = getColumn(x , y);
    // Check if the column already contains an element
    if(column.childElementCount != 0){
        // Log Error to console
        console.log("OPERATION [ADD COIN] FAILED");
        console.log(`Column [${x} , ${y}] is already set.`)
    }else{
        // Spawn the coin
        column.innerHTML = '<div class="coin"></div>';
    }
}

// This function will take a string input and build with it a walls and coins
function textToBoard(text){
    /* CODES */
    // X = Means a wall
    // C = Means a coin
    // E = Means Empty
    // n = back to line (Row Finished)
    // e = END
    /* EXAMPLE */
    /* 10 BY 5 BOARD */
    /*                          ________________  
        XXXXXXXXXXn             |  __________  |
        XCCCCCCCCXn             | |..........| |
        XCCCCCCCCXn             | |..........| | 
        XCCCCCCCCXn             | |..........| | 
        XXXXXXXXXXe             |  ‾‾‾‾‾‾‾‾‾‾  |
        /                       ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
    */              
    var stringIndex = 0;
    var x = 1;
    var y = 1;
    while(text[stringIndex] != 'e'){
        var code = text[stringIndex];
        
        switch(code){
            case 'X':
                addWall(x , y);
                break;
            case 'C':
                addCoin(x , y);
                break;
            case 'n':
                x = 0;
                y++;
                break;
            
        }
        x++;
        stringIndex++;
    }
}

// Loads text files and set's board
document.getElementById('fileInput')
    .addEventListener('change', function() {
        var fr=new FileReader();
        fr.onload=function(){
            
        console.log(fr.result);
        var text = fr.result.replace(/(\r\n|\n|\r)/gm, "");
        textToBoard(text);
        }

        fr.readAsText(this.files[0]);
        /* textToBoard(fr.result); */
    })
