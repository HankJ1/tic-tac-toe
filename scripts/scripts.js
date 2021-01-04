//creates the players and their pieces and turns
const player = (playerName, playerMarker) => {
    const getButtonStatus = (e) => {
        //console.log(e);
        return "worked";
    }
    function makeindicator() {
        if (playerName == "player1") {
            return true;
        } else {
            return false;
        }
    }

    return {
        playerName,
        playerMarker,
        turnIndicator: makeindicator(),
        moveArray: [],
        defenseMove: [],
        offenseMove: [],
        victorStatus: ""
    }
}

const player1 = player("player1", "X");
const player2 = player("player2", "O");
//console.log(player1.moveArray);


//creates the board and logic of the game
const board = (() => {
    let boardArray = new Array(9);
    const boardContainer = document.querySelector(".board");

    //Determines victory after each play
    function checkVictory(playerArray, playerName, player) {
        const winningArray = ["012", "345", "678", "036", "147", "258", "048", "642"];
        for (let i = 0; i < winningArray.length; i++) {
            let counter = 0;
            for (let j = 0; j < playerArray.length; j++) {
                for (let k = 0; k < 3; k++) {
                    if (playerArray[j] == winningArray[i].charAt(k)) {
                        counter++;
                    }
                }
                if (counter >= 3) {
                    document.querySelector(".congrats").textContent=`${playerName} wins!`;
                    player.victorStatus = "winner";
                    setTimeout(function() {document.querySelector(".winning-form").setAttribute("style", "display: initial"); }, 300);
                    (player1.playerMarker == "O") ? player1.turnIndicator = false : player1.turnIndicator = true;
                    return "great Success"
                } else if (board.divArray.every(div => div.textContent !== "")) {
                    document.querySelector(".congrats").textContent=`Ooh Wee its a Tie!`;
                    player.victorStatus = "Tie Game!";
                    setTimeout(function() {document.querySelector(".winning-form").setAttribute("style", "display: initial"); }, 300);
                    (player1.playerMarker == "O") ? player1.turnIndicator = false : player1.turnIndicator = true;
                    return "great Success"

                //used only in finding defensive moves for machine
                } else if (counter == 2 && playerName == "player1") {
                    if (player2.defenseMove.find(function(element) {
                        return element == winningArray[i];
                    }) == undefined) {
                    player2.defenseMove.push(winningArray[i]);
                    console.log("Defense triggered");
                    }
                //used only in in finding offensive moves for machine    
                } else if (counter == 2 && playerName == "machine") {
                    if (player2.offenseMove.find(function(element) {
                        return element == winningArray[i];
                    }) == undefined) {
                        player2.offenseMove.push(winningArray[i]);
                        //console.log("offense Triggered");
                    }
                }
            } 
        }
    }

    //updates board on each play
    function _changeContent(content, datakey) {
        boardArray[parseInt(datakey)] = content;
        document.querySelector(`#tile-${datakey}`).textContent = boardArray[parseInt(datakey)];
    }

    //creates board and sets event listeners
    const divArray = [];
    for (let i = 0; i < 9; i++) {
        boardArray[i] = i;
        const boardDiv = document.createElement('div');
        boardDiv.setAttribute("id", `tile-${boardArray[i]}`);
        boardDiv.dataset.number=`${i}`;
        boardContainer.appendChild(boardDiv);
        divArray[i] = boardDiv;

        boardDiv.addEventListener('click', (e) => {
            let tileNum = e.srcElement.attributes[1].value
            if (player1.turnIndicator == true && boardDiv.textContent == "") {
                _changeContent(player1.playerMarker, tileNum);
                player1.turnIndicator = false;
                player1.moveArray.push(tileNum);
                checkVictory(player1.moveArray, player1.playerName, player1);
                (player2.playerName == "machine") ? buttons.manVMachine() : console.log("human");
            } else if (player1.turnIndicator == false && boardDiv.textContent == "") {
                _changeContent(player2.playerMarker, tileNum);
                player1.turnIndicator = true;
                player2.moveArray.push(tileNum);
                checkVictory(player2.moveArray, player2.playerName, player2);
            }
            //console.log(`player1: `+ player1.moveArray + `  player2: ` + player2.moveArray);

            
        })
    }

    return {
        boardArray,
        changeContent: function changeContent(idNum) {
            _changeContent(idNum);
        },
        divArray

    }
})();




//creates the buttons and AI behavior
const buttons = (() => {
    
    //prompts user to choose symbol
    const revealPieces = () => {
        const pieceContainer = document.querySelector(".piece-container");
        pieceContainer.setAttribute("style", "display: flex");
    }

    const revealPlayers = () => {
        const pieceContainer = document.querySelector(".piece-container");
        pieceContainer.setAttribute("style", "display: none");

        const playerContainer = document.querySelector(".player-summary");
        playerContainer.setAttribute("style", "display: block");
        document.querySelector(".player1-name").textContent=`Player1: ${player1.playerMarker}`;
        document.querySelector(".player2-name").textContent=`${player2.playerName}: ${player2.playerMarker}`;
    }

    const seekVictory = () => {
        let moveResult = "move result";
        if (player2.offenseMove.length < 1) {
            return "null";
        }
        player2.offenseMove.forEach(function(element) {
            for (let i = 0; i < 3; i++) {
                let tempTileNum = parseInt(element.charAt(i));
                if (board.divArray[tempTileNum].textContent == "") {
                    console.log(tempTileNum);
                    moveResult = tempTileNum;
                }
            }
        })
        return moveResult;
    }
    
    const blockVictory = () => {
        let moveResult = "move result";
        if (player2.defenseMove.length < 1) {
            return "null";
        }
        player2.defenseMove.some(function(element) {
            for (let i = 0; i < 3; i++) {
                let tempTileNum = parseInt(element.charAt(i));
                if (board.divArray[tempTileNum].textContent == "") {
                    console.log(tempTileNum);
                    moveResult = tempTileNum;
                    return moveResult;
                }
            }
        })
        return moveResult;
    }

    const manVMachine = () => {
        if (player2.playerName !== "machine") {
            return "the humans are playing";
        }

        if (player1.turnIndicator == true) {
            return "its their turn";
        }

        if (player1.victorStatus == "winner") {
            return "game over";
        }

        //check to see if victory is possible
        let tempTileNum = seekVictory();
        console.log(seekVictory());
        if (typeof(tempTileNum) == "number") {
            board.divArray[tempTileNum].click();
            return "machine generated play";
        }

        //check to see if defense is necessary
        tempTileNum = blockVictory();
        if (typeof(tempTileNum) == "number") {
            board.divArray[tempTileNum].click();
            return "machine generated play";
        }

        //opening game logic
        if (player1.moveArray.length > 0 && player2.moveArray.length == 0 && board.divArray[4].textContent == "") {
            board.divArray[4].click();
            return "complete";
        } else if (player1.moveArray.length == 2 && player2.moveArray.length == 1) {
            if (player1.moveArray[0] % 2 == 0 && player1.moveArray[1] % 2 == 0 && board.divArray[4].textContent == `${player1.playerMarker}`) {
                board.divArray.some(function(div) {
                    if(div.textContent == "" && board.divArray.indexOf(div) % 2 == 0) {
                        div.click();
                        return "complete";
                    }
                })
                return "complete" 
            } else if (player1.moveArray[0] % 2 == 0 && player1.moveArray[1] % 2 == 0) {
                board.divArray[1].click();
                return 'complete';
            }
        }
        if (board.divArray[0].textContent == "" && player2.moveArray.length == 0) {
            board.divArray[0].click();
            return "complete";
        } else if ((board.divArray[2].textContent !== "" || board.divArray[5].textContent !== "" || board.divArray[8].textContent !== "") && board.divArray[4].textContent == "") {
            board.divArray[4].click(); 
            return "complete"; 
        } else if (board.divArray[1].textContent == "") { 
            board.divArray[1].click(); 
            return "complete"; 
        } else if (board.divArray[2].textContent == "") { 
            board.divArray[2].click(); 
            return "complete";
        } else if (board.divArray[4].textContent == "") { 
            board.divArray[4].click(); 
            return "complete";    
        } else if (board.divArray[6].textContent == "") { 
            board.divArray[6].click(); 
            return "complete";
        }
    board.divArray.some(function(div) {
        if (div.textContent == ""){
            div.click();
            return "randomized";
        }
    })

    }

    const hideEndForm = () => {
        document.querySelector(".winning-form").setAttribute("style", "display: none");
    }

     //resets all data
     const reset = () => {
        player1.moveArray = [];
        player2.moveArray = [];
        boardArray = [];
        board.divArray.forEach(div => {
            div.textContent="";
        })
        player2.defenseMove = [];
        player2.offenseMove = [];
        player2.playerName = "player2";
        player1.victorStatus = "";
        player2.victorStatus = "";
        document.querySelector(".player-summary").setAttribute("style", "display: none");
        document.querySelector(".piece-container").setAttribute("style", "display: none");
    }

    const rematch = () => {
        player1.moveArray = [];
        player2.moveArray = [];
        boardArray = [];
        board.divArray.forEach(div => {
            div.textContent="";
        })
        player2.defenseMove = [];
        player2.offenseMove = [];
        player1.victorStatus = "";
        player2.victorStatus = "";
        manVMachine();
    }

    return {
        revealPieces,
        reset,
        rematch,
        hideEndForm,
        manVMachine,
        revealPlayers
    }
    
})();

board.boardArray[8] = 20;
console.log(board.boardArray);
//board.changeContent(8);



//good medium mode difficulty
// const manVMachine = () => {
//     player2.playerName = "machine";
//     player1.turnIndicator = false;
//     if (player1.victorStatus == "winner") {
//         return "game over";
//     }

//     //check to see if victory is possible
//     let tempTileNum = seekVictory();
//     console.log(seekVictory());
//     if (typeof(tempTileNum) == "number") {
//         board.divArray[tempTileNum].click();
//         return "machine generated play";
//     }

//     //check to see if defense is necessary
//     tempTileNum = blockVictory();
//     if (typeof(tempTileNum) == "number") {
//         board.divArray[tempTileNum].click();
//         return "machine generated play";
//     }

//     //opening game logic
//     if (board.divArray[0].textContent == "") {
//     board.divArray[0].click();
//     return "complete";
//     } else if (board.divArray[1].textContent == "") { 
//         board.divArray[1].click(); 
//         return "complete"; 
//     } else if (board.divArray[2].textContent == "") { 
//         board.divArray[2].click(); 
//         return "complete";
//     } else if (board.divArray[4].textContent == "") { 
//         board.divArray[4].click(); 
//         return "complete";    
//     } else if (board.divArray[6].textContent == "") { 
//         board.divArray[6].click(); 
//         return "complete";
//     }
// board.divArray.forEach(function(div) {
//     if (div.textContent == ""){
//         div.click();
//         return "randomized";
//     }
// })

// }