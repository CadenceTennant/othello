require('./constants');

function getMove(player, board) {

  plarr = determinePlayer(player);
  myNum = plarr[0];
  oppNum = plarr[1];
  
  // Determine valid moves
  oppPieces = findEveryPiece(board, oppNum);
  validMoves = [];
  numWouldFlip = [];

  for (let i = 0; i < oppPieces.length; i++) {
    const oppPiecePos = oppPieces[i];
    findValidMoves(validMoves, numWouldFlip, board, oppPiecePos, myNum);  
  } 

  //after many trials, the stageAlgorithm performs slightly better than
  // the plain weightedAlgorithm. The stageAlgorithm uses the 
  // weightedAlgorithm during midGame and endGame, but in the early stage
  // of the game it uses my groupFewestAlgorithm, which selects the valid
  // move that would A) flip the fewest opponent pieces, and B) keep my 
  // pieces as closely grouped together as possible. This is a basic strategy
  // for Othello, thanks especially to https://othelloacademy.weebly.com/basic.html
  // for the super helpful strategy insights!

  bestMove = stageAlgorithm(board, validMoves, numWouldFlip, myNum); 
  //bestMove = weightedAlgorithm(validMoves, board);

  return bestMove;

}

function weightedAlgorithm(validMoves, board) {
  weightedTable = assignWeights(validMoves, board);
  //sort map in descending order by the weight value
  let sortedArr = Array.from(weightedTable.entries()).sort((a, b) => b[1] - a[1]); 

  if(sortedArr.length > 0) {
    return sortedArr[0][0];
  } else {
    console.log("SOMETHING WENT WRONG");
    return validMoves[0];
  }
}

function groupFewestAlgorithm(board, valid, flip, myNum) {
  myPieces = findEveryPiece(board, myNum);
  center = findCenter(myPieces);
  group = [];
  minFlip = [];

  for (let i = 0; i < valid.length; i++) {
    dist = findDistance(valid[i], center);
    group.push(dist);
  }

  centeredMinFlip = minFlipAndGroup(valid, flip, group);
  return centeredMinFlip;

}

function findDistance(pos, center) {  //using distance formula
  [x1, y1] = center;
  [x2, y2] = pos;

  const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return distance;
}

function stageAlgorithm(board, validMoves, numWouldFlip, myNum) {
  let arr = findNonEmptyBoardSpaces(board);
  gameStage = "";
  bestMove = [0,0];
  if(arr.length < 22) {
    gameStage = "earlyGame";
  } else if (arr.length >= 22 && arr.length < 44) {
    gameStage = "midGame";
  } else {
    gameStage = "endGame";
  }
  if(gameStage == "earlyGame") { //if early game, try to capture few pieces to limit opp options
    corner = simplePickCorners(validMoves);
    if(corner) {
      bestMove = corner;
    } else {
      bestMoveArr = groupFewestAlgorithm(board, validMoves, numWouldFlip, myNum)
      bestMove = bestMoveArr[0];
    }
  } else {
    bestMove = weightedAlgorithm(validMoves, board);
  }
  return bestMove;
}

function findCenter(arr) {
  let sumX = 0;
  let sumY = 0;

  for (let i = 0; i < arr.length; i++) {
    sumX += arr[i][0];
    sumY += arr[i][1];
  }

  let avgX = sumX / arr.length;
  let avgY = sumY / arr.length;

  return [avgX, avgY];
}

function minFlipAndGroup(valid, flip, group) {
  let indices = flip.map((e, index) => index); //only return indexes to get index array
  // Sort the indices based on num of flips in second array, in asc order
  indices.sort((a, b) => {
    if(flip[a] !== flip[b]) {
      return flip[a] - flip[b]
    } 
    //if numflips is equal, sort by minimum distance
    return group[a] - group[b]
  });
  // Rearrange the first array based on the sorted indices
  let sortedValid = indices.map(index => valid[index]);
  return sortedValid;
}


function flipFewest(valid, flip) {

  // Create an array of indices [0, 1, 2, ...]
  let indices = flip.map((_, index) => index);

  // Sort the indices based on the corresponding values in the second array
  indices.sort((a, b) => flip[a] - flip[b]);

  // Rearrange the first array based on the sorted indices
  let sortedValid = indices.map(index => valid[index]);

  return sortedValid;

}

function flipMost(valid, flip) {

  // Create an array of indices [0, 1, 2, ...]
  let indices = flip.map((_, index) => index);

  // Sort the indices based on the corresponding values in the second array
  indices.sort((a, b) => flip[b] - flip[a]);

  // Rearrange the first array based on the sorted indices
  let sortedValid = indices.map(index => valid[index]);

  return sortedValid;

}

const comp = (a, b) => { //array comparison
  return a.toString() === b.toString();
};

function assignWeights(validMoves, board) {
  const map = new Map();
  for (let i = 0; i < validMoves.length; i++) {
    const pos = validMoves[i];
    if ((pos[0] == 0 || pos[0] == 7) && (pos[1] == 0 || pos[1] == 7)) {
      map.set(pos, 1); //corners are the best spots
    }
    else if (comp(pos, [0,1]) || comp(pos, [0,6]) || comp(pos, [1,0]) || comp(pos, [1,7])
      || comp(pos, [6,0]) || comp(pos,[6,7]) || comp(pos, [7,1]) || comp(pos,[7,6])) {
      
      if((comp(pos, [0,1]) || comp(pos, [1,0])) && board[0][0]==myNum) {
        map.set(pos, 0.9) //C-square is stable if we have the corner
      }
      else if((comp(pos, [0,6]) || comp(pos, [1,7])) && board[0][7]==myNum) {
        map.set(pos, 0.9) //C-square is stable if we have the corner
      }
      else if((comp(pos, [6,0]) || comp(pos, [7,1])) && board[7][0]==myNum) {
        map.set(pos, 0.9) //C-square is stable if we have the corner
      }
      else if((comp(pos, [6,7]) || comp(pos, [7,6])) && board[7][7]==myNum) {
        map.set(pos, 0.9) //C-square is stable if we have the corner
      }
      else {
        map.set(pos, 0.2);
      } //spaces next to corners are BAD if I don't have the corner
    }
    else if (pos[0] == 0 || pos[0] == 7 || pos[1] == 0 || pos[1] == 7) {
      if((pos[0] == 0 || pos[1]==0) && board[0][0]==myNum) {
        map.set(pos, 0.8) //edge position is good if we have adjacent corner
      }
      else if((pos[0] == 0 || pos[1]==7) && board[0][7]==myNum) {
        map.set(pos, 0.8) //edge position is good if we have adjacent corner
      }
      else if((pos[0] == 7 || pos[1]==0) && board[7][0]==myNum) {
        map.set(pos, 0.8) //edge position is good if we have adjacent corner
      }
      else if((pos[0] == 7 || pos[1]==7) && board[7][7]==myNum) {
        map.set(pos, 0.8) //edge position is good if we have adjacent corner
      }
      else {
        map.set(pos, 0.4)
      } //edges are not so good if I don't have the corner
    } 
    else if (comp(pos, [2,2]) || comp(pos,[2,5]) || comp(pos, [5,2]) || comp(pos, [5,5])) {
      map.set(pos, 0.6) //box corners are fairly important
    }
    else if (comp(pos, [1,1]) || comp(pos, [1,6]) || comp(pos, [6,1]) || comp(pos, [6,6])) {
      if(comp(pos, [1,1]) && board[0][0]==myNum && board[0][1]==myNum && board[1][0]==myNum) {
        map.set(pos, 0.85) //stable if we have corner and both adjacent C-squares
      }
      else if(comp(pos, [1,6]) && board[0][7]==myNum && board[0][6]==myNum && board[1][7]==myNum) {
        map.set(pos, 0.85) //stable if we have corner and both adjacent C-squares
      }
      else if(comp(pos, [6,1]) && board[7][0]==myNum && board[6][0]==myNum && board[7][1]==myNum) {
        map.set(pos,0.85) //stable if we have corner and both adjacent C-squares
      }
      else if(comp(pos, [6,6]) && board[7][7]==myNum && board[6][7]==myNum && board[7][6]==myNum) {
        map.set(pos,0.85) //stable if we have corner and both adjacent C-squares
      }
      else {
        map.set(pos, 0.1); 
        //diagonal space next to corners are THE WORST if I don't have the supporting pieces
      }
    }
    else {
      map.set(pos, 0.5); //all other spots fall in the middle
    }
  }
  return map
}

function simplePickCorners(validMoves) {
  for (let i = 0; i < validMoves.length; i++) {
    const pos = validMoves[i];
    if ((pos[0] == 0 || pos[0] == 7) && (pos[1] == 0 || pos[1] == 7)) {
      return pos;
    }
  }
}

function deleteValidMoves(validMoves) {
  validMoves = [];
}

function findValidMoves(validMoves, numWouldFlip, board, pos, myNum) {
  topLeft = [pos[0]-1, pos[1]-1];
  if(topLeft[0]>=0 && topLeft[1]>=0) { //top left must be on the board
    if(board[topLeft[0]][topLeft[1]] == 0) {
      for (let k = 1; pos[0]+k < 8 && pos[1]+k < 8; k++) {
        if(board[pos[0]+k][pos[1]+k] == myNum){
          validMoves.push(topLeft);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]+k][pos[1]+k] == 0) {
          break;
        }
      }
    }
  }

  topCenter = [pos[0]-1, pos[1]]
  if(topCenter[0] >= 0) { //top center must be on the board
    if(board[topCenter[0]][topCenter[1]] == 0) {
      for (let k = 1; pos[0]+k < 8; k++) {
        if(board[pos[0]+k][pos[1]] == myNum){
          validMoves.push(topCenter);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]+k][pos[1]] == 0) {
          break;
        }
      }
    }
  }


  topRight = [pos[0]-1, pos[1]+1]
  if(topRight[0] >= 0 && topRight[1] < 8) { //top right position must be on the board
    if(board[topRight[0]][topRight[1]] == 0) {
      for (let k = 1; pos[0]+k < 8 && pos[1]-k >= 0; k++) {
        if(board[pos[0]+k][pos[1]-k] == myNum){
          validMoves.push(topRight);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]+k][pos[1]-k] == 0) {
          break;
        }
      }
    }
  }

  rightMiddle = [pos[0], pos[1]+1]
  if(rightMiddle[1] < 8) { //right middle pos must be on the board
    if(board[rightMiddle[0]][rightMiddle[1]] == 0) {
      for (let k = 1; pos[1]-k >= 0; k++) {
        if(board[pos[0]][pos[1]-k] == myNum){
          validMoves.push(rightMiddle);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]][pos[1]-k] == 0) {
          break;
        }
      }
    }
  }

  bottomRight = [pos[0]+1, pos[1]+1]
  if(bottomRight[0] < 8 && bottomRight[1] < 8) { //bottom right must be on the board
    if(board[bottomRight[0]][bottomRight[1]] == 0) {
      for (let k = 1; pos[0]-k >= 0 && pos[1]-k >= 0; k++) {
        if(board[pos[0]-k][pos[1]-k] == myNum){
          validMoves.push(bottomRight);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]-k][pos[1]-k] == 0) {
          break;
        }
      }
    }
  }

  bottomCenter = [pos[0]+1, pos[1]]
  if(bottomCenter[0] < 8) {  //bottom center must be on the board
    if(board[bottomCenter[0]][bottomCenter[1]] == 0) {
      for (let k = 1; pos[0]-k >= 0; k++) {
        if(board[pos[0]-k][pos[1]] == myNum){
          validMoves.push(bottomCenter);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]-k][pos[1]] == 0) {
          break;
        }
      }
    }
  }

  bottomLeft = [pos[0]+1, pos[1]-1]
  if(bottomLeft[0] < 8 && bottomLeft[1] >= 0) { //bottom left pos must be on the board
    if(board[bottomLeft[0]][bottomLeft[1]] == 0) {
      for (let k = 1; pos[0]-k >= 0 && pos[1]+k < 8; k++) {
        if(board[pos[0]-k][pos[1]+k] == myNum){
          validMoves.push(bottomLeft);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]-k][pos[1]+k] == 0) {
          break;
        }
      }
    }
  }

  leftMiddle = [pos[0], pos[1]-1]
  if(leftMiddle[1] >= 0) { //left middle spot must be on the board
    if(board[leftMiddle[0]][leftMiddle[1]] == 0) {
      for (let k = 1; pos[1]+k < 8; k++) {
        if(board[pos[0]][pos[1]+k] == myNum){
          validMoves.push(leftMiddle);
          numWouldFlip.push(k);
          break;
        } else if(board[pos[0]][pos[1]+k] == 0) {
          break;
        }
      }
    }
  }

  return validMoves;
}

function findEveryPiece(board, playerNum) {
  var arr = [];
  for (let i = 0; i < board.length; i++) {
    var pos = [];
    const row = board[i];   
    for (let k = 0; k < row.length; k++) {
      var val = row[k];
      if (val == oppNum) {
        pos = [i, k];
        arr.push(pos);
      }
    }
  }
  return arr;
}

function findNonEmptyBoardSpaces(board) {
  var arr = [];
  for (let i = 0; i < board.length; i++) {
    var pos = [];
    const row = board[i];   
    for (let k = 0; k < row.length; k++) {
      var val = row[k];
      if (val != 0) {
        pos = [i, k];
        arr.push(pos);
      }
    }
  }
  return arr;
}

function determinePlayer(player) {
  if(player == 1) {
    return [1, 2]
  } else {
    return [2, 1]
  }
}


function prepareResponse(move) {
  const response = `${JSON.stringify(move)}\n`;
  console.log(`Sending response ${response}`);
  return response;
}

module.exports = {getMove, determinePlayer, findCenter, flipFewest, findEveryPiece, minFlipAndGroup, findNonEmptyBoardSpaces, findValidMoves, deleteValidMoves, prepareResponse};
