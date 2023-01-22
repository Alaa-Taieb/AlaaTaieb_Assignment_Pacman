/* ------------------------------------------------------------------------------------------------------------------------------ */
// Global Variables

// Alert speech message
const ALERT_SPEECH_MESSAGE = new Audio('assets/sound_effects/alert_speech.mp3');

// The game loop call interval in milliseconds
const GAME_LOOP_INTERVAL = 20;
// The game's framerate
const GAME_FRAME_RATE = 1000 / GAME_LOOP_INTERVAL;
const COIN_CONSUME_SOUND = new Audio('assets/sound_effects/consume_coin.wav');
var BOARD_SET = false;
// Load the element in which the game will be rendered
var canvas_element = document.querySelector("#game_canvas");

// Binary Board | 0 = no Wall , 1 = wall
var binaryBoard;


// This array will hold objects containing information of existing ghosts
// Ghost Object
/* 
var ghost = {
    'id': '#ghost_1',
    'x': 0,
    'y': 0,
    'board_x': 1,
    'board_y': 1,
    'speed': 1,
    'state': 'wondering',     // wondering => moving randomly | chasing => chasing after the player
}
*/
var ghosts = [];

// Ghost element HTML code
var ghost_html_code = '<div class="body"></div><div class="tenticals"><div class="tentical"></div><div class="tentical"></div><div class="tentical"></div></div>';


var game_board = {
    'width' : 50,        // How many columns on the game board
    'height' : 25,        // How many rows on the game board
    'column_size' : 20,         // Column size in Pixels
    /* Data that is used to construct the game board */
    'board_data' : []           
}

var player = document.querySelector('#player');
var movementDirection = [0 , 0];        // [1 , 0] = RIGHT , [-1 , 0] = LEFT , [0 , -1] = UP , [0 , 1] = DOWN
var faceDirection = 'up';
var playerCoordinates = [2 , 2];             
var speed = 2;
var lastPressed = '';
var player_x = 20;
var player_y = 20;
var player_size = 20;
var player_score = 0;
var player_coins = 0;
var player_kills = 0;
var player_moved = false;
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// Get a column with it's x , y coordinates
function getColumn(x , y){
    return document.querySelector(`#row_${y}_col_${x}`);
}
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
        getColumn(x , y + 1).querySelector('.wall').style.borderTop = 'none';      // Remove the top border of the bottom wall
    }
    if(left){
        getColumn(x , y).querySelector('.wall').style.borderLeft = 'none';          // Remove the left border of the current wall
        getColumn(x - 1, y).querySelector('.wall').style.borderRight = 'none';      // Remove the right border of the left wall
    }

}
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */





/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
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
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
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
    BOARD_SET = true;
}
/* ------------------------------------------------------------------------------------------------------------------------------ */






/* ------------------------------------------------------------------------------------------------------------------------------ */
// Display game data on page
document.querySelector('#score').innerText = player_score;
document.querySelector('#coins').innerText = player_coins;
document.querySelector('#kills').innerText = player_kills;
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// The function behind the logic of the game
function gameLoop(){
    player_moved = playerController();
    if(player_moved){
        columnController();
    }
}
/* ------------------------------------------------------------------------------------------------------------------------------ */




/* ------------------------------------------------------------------------------------------------------------------------------ */
// The function behind player controls
function playerController(){
    player_x = player_x + movementDirection[0] * speed;
    player_y = player_y +movementDirection[1] * speed;
    player.style.transform = `translate(${player_x}px , ${player_y}px)`;
    switch(faceDirection){
        case 'right':
            player.style.transform += 'rotate(0deg)';
            /* player.querySelector('.eye').style.transform = 'translateY(0px)'; */
            break;
        case 'down':
            player.style.transform += 'rotate(90deg)';
            /* player.querySelector('.eye').style.transform = 'translateY(0px)'; */
            break;
        case 'left':
            player.style.transform += 'rotate(180deg)';
            /* player.querySelector('.eye').style.transform = 'translateY(3.5px)'; */
            break;
        case 'up':
            player.style.transform += 'rotate(270deg)';
            /* player.querySelector('.eye').style.transform = 'translateY(3.5px)'; */
    }
    
    // An event handler of keypresses
    document.onkeydown = function(evt){
        // Using Switch Case to check whether to register the key press or not
        // Only register if the key press won't result in the player going through walls
        // EXAMPLE : the player's top column contains a wall and the player pressed the 'w' key 
        // in this case the the event handler won't register the key pressed
        // Registering the key press by saving the key to the lastPressed variable
        switch(evt.key){
            case 'w':
            if(!getColumn(playerCoordinates[0] , playerCoordinates[1] - 1).querySelector('.wall')){
                lastPressed = evt.key;
            }
            break;
        case 'd':
            if(!getColumn(playerCoordinates[0] + 1, playerCoordinates[1]).querySelector('.wall')){
                lastPressed = evt.key;
            }
            break;
        case 's':
            if(!getColumn(playerCoordinates[0] , playerCoordinates[1] + 1).querySelector('.wall')){
                lastPressed = evt.key;
            }
            break;
        case 'a':
            if(!getColumn(playerCoordinates[0] - 1 , playerCoordinates[1]).querySelector('.wall')){
                lastPressed = evt.key;
            }
            break;
        }
    }

    // Using this switch case and the value of the lastPressed variable we will determine the player's movement direction and the direction he faces
    // We make sure that the player only turns when he is exactly in the middle of the column to ensure the player's position is always aligned with grid
    // We also make sure the player stops when he is about to hit a wall

    switch(lastPressed){
        case 'w':
            if(player_x % player_size == 0 && player_y % player_size == 0){
                movementDirection = [0 , -1];
                faceDirection = 'up';
                if(getColumn(playerCoordinates[0] , playerCoordinates[1] - 1).querySelector('.wall')){
                    movementDirection = [0 , 0];
                    /* player_x = playerCoordinates[0] * player_size/2; */
                    player_y = (playerCoordinates[1]-1) * player_size;
                }
            }
            break;
        case 'd':
            if(player_x % player_size == 0 && player_y % player_size == 0){
                movementDirection = [1 , 0];
                faceDirection = 'right';
                if(getColumn(playerCoordinates[0] + 1, playerCoordinates[1]).querySelector('.wall')){
                    movementDirection = [0 , 0];
                    /* player_x = playerCoordinates[0] * player_size/2; */
                    player_x = (playerCoordinates[0] - 1) * player_size;
                }
            }
            break;
        case 's':
            if(player_x % player_size == 0 && player_y % player_size == 0)
            {
                movementDirection = [0 , 1];
                faceDirection = 'down';
                if(getColumn(playerCoordinates[0], playerCoordinates[1] + 1).querySelector('.wall')){
                    movementDirection = [0 , 0];
                    player_y = (playerCoordinates[1] - 1) * player_size;
                }
            }
            break;
        case 'a':
            if(player_x % player_size == 0 && player_y % player_size == 0){
                movementDirection = [-1 , 0]
                faceDirection = 'left';
                if(getColumn(playerCoordinates[0] - 1, playerCoordinates[1]).querySelector('.wall')){
                    movementDirection = [0 , 0];
                    player_x = (playerCoordinates[0] - 1) * player_size;
                }
            }
            break;
    }

    // A variable that temporarly stores the player coordinates before the new calculation , this we way we know when the player moved on row column system
    var temp_coordinates = [playerCoordinates[0] , playerCoordinates[1]];
    // We calculate over which column the player is.
    playerCoordinates[0] = Math.floor((player_x + player_size/2) / player_size ) + 1;
    playerCoordinates[1] = Math.floor((player_y + player_size/2) / player_size ) + 1;
    if(temp_coordinates[0] != playerCoordinates[0] || temp_coordinates[1] != playerCoordinates[1])
        return true;
    return false;
}
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// A function that detects what the player is moving on
function columnController(){
    // Get the column the player is currently on
    var col = document.querySelector(`#row_${playerCoordinates[1]}_col_${playerCoordinates[0]}`);
    // Check if the column has a child
    if(col.childElementCount > 0){
        // Get the child element
        var item = col.children[0];
        console.log(item);
        // Check if the child element has a class called 'coin'
        if(item.classList[0] == 'coin'){
            // Remove the coin from the board (the player ate it)
            item.remove();
            // Play coin eat sound
            COIN_CONSUME_SOUND.play();
            // Increase player score by 10
            player_score += 10;
            // Increase coins eaten by 1
            player_coins++;
            // Update both score and coins display
            document.querySelector('#score').innerText = player_score;
            document.querySelector('#coins').innerText = player_coins;
        }
    }

}
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// Function that spawns ghosts
function spawnGhosts(count){
    console.log('Started Ghost Spawning');
    while(count > 0){
        // Set random x_board position and random y_board position
        var random_x = Math.ceil(Math.random() * game_board.width);
        var random_y = Math.ceil(Math.random() * game_board.height);

        // Check if the chosen column contains a wall or not
        if(getColumn(random_x , random_y).querySelector('.wall') == null){
            // Create a ghost object
            var ghost = {
                'id': `ghost_${ghosts.length}`,
                'x': (random_x - 1) * game_board.column_size,
                'y': (random_y - 1) * game_board.column_size,
                'board_x': random_x,
                'board_y': random_y,
                'target_x': 0,
                'target_y': 0,
                'status': 'wondering',
                getGhostElement() {         // Get this ghost's HTML element
                    return document.querySelector(`#${this.id}`);
                },
                graphicUpdate() {           // Update the ghost's HTML element's position
                    var element = document.querySelector(`#${this.id}`);
                    console.log(element);
                    element.style.transform = `translate(${this.x}px , ${this.y}px)`;
                },
                goTo(target_x , target_y){
                    
                },
            }
            // Create the HTML ghost element and give it the id given in ghost object
            document.querySelector(`#ghost_container`).innerHTML += `<div id="${ghost.id}" class="ghost"></div>`;
            // Set the insides of the ghost element
            ghost.getGhostElement().innerHTML = ghost_html_code;
            // Update the element's position
            ghost.graphicUpdate();
            console.log(`Spawned a ghost at ${ghost.board_x},${ghost.board_y}`);
            // Push the ghost object to the ghosts array
            ghosts.push(ghost);
            count--;
        }else{
            console.log("Can't Spawn a wall is there!");
        }
    }
    console.log('Finished Ghost Spawning');
}


/* ------------------------------------------------------------------------------------------------------------------------------ */
// Toggle display alert message
function toggleAlertMessage(){
    var alert_box = document.querySelector(`#alert_box`);
    alert_box.style.display = 'none';
}
/* ------------------------------------------------------------------------------------------------------------------------------ */

/* ------------------------------------------------------------------------------------------------------------------------------ */
// Speech Alert Message
function playAlertMessage(){
    ALERT_SPEECH_MESSAGE.play();
}
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// Manhattan Distance Equation used to evaluate a path
// More info here : 
// https://www.sciencedirect.com/topics/mathematics/manhattan-distance#:~:text=The%20Manhattan%20distance%20is%20defined,which%20is%20its%20L1%2Dnorm.
function manhattanDistance(start , end){
    return Math.abs(start[0] - end[0]) + Math.abs(start[1] - end[1]);
}
/* ------------------------------------------------------------------------------------------------------------------------------ */



/* ------------------------------------------------------------------------------------------------------------------------------ */
// Convert Game Board to a binary matrix | 0 = no Wall , 1 = wall
function binaryBoardConstructor(){
    var binaryBoard = [];
    for(var i = 1; i <= game_board.height; i++){
        var row = [];
        for(var y = 1; y <= game_board.width; y++){
            var column = document.querySelector(`#row_${i}_col_${y}`);
            if(column.querySelector('.wall')){
                row.push(1);
            }else{
                row.push(0);
            }
        }
        console.log(row);
        console.log(i);
        binaryBoard.push(row);
    }
    return binaryBoard;
}
/* ------------------------------------------------------------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------------------------------------------------------------ */
// A* Algorithm for path finding
function aStar(start , end){
    // Visit this webpage to better understand the A* algorithm 
    // https://dev.to/codesphere/pathfinding-with-javascript-the-a-algorithm-3jlb#:~:text=What%20is%20the%20A*%20algorithm,increase%20its%20performance%20and%20efficiency.

}
/* ------------------------------------------------------------------------------------------------------------------------------ */


/* ------------------------------------------------------------------------------------------------------------------------------ */
// Script Execution


// Display board data on page
document.querySelector('#game_width').innerText = game_board.width;
document.querySelector('#game_height').innerText = game_board.height;
document.querySelector('#column_size').innerText = game_board.column_size;

// Create the game board
box_board();

// Loads text file and set's the board's columns
document.getElementById('fileInput')
    .addEventListener('change', function() {
        var fr=new FileReader();
        fr.onload=function(){
            
        console.log(fr.result);
        var text = fr.result.replace(/(\r\n|\n|\r)/gm, "");
        textToBoard(text);
        spawnGhosts(10);
        toggleAlertMessage();
        ALERT_SPEECH_MESSAGE.pause();
        binaryBoard = binaryBoardConstructor();
        }

        fr.readAsText(this.files[0]);
        /* textToBoard(fr.result); */
    })

setInterval(function ()  {gameLoop()} , GAME_LOOP_INTERVAL);
/* ------------------------------------------------------------------------------------------------------------------------------ */
