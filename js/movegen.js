/**
 * Creates the integer representation of the movement based on rules defined in DEFS
 * @param {*} from 
 * @param {*} to 
 * @param {*} card 
 */
function MOVE(from, to, card) {
    return from | (to << 6) | (card << 12);
}

/*
GameBoard.moveListStart[ply] -> 'index' for the first move at a given ply
GameBoard.moveList[index] -> 

say ply 1 loop all moves
for(index = GameBoard.moveListStart[1]; index < GameBoard.moveListStart[2]; index++) {
    move = moveList[index]

    ... use move


GameBoard.moveListStart[2] = GameBoard.moveListStart[1]
AddMove(){
    GameBoard.moveList(GameBoard.moveListStart[2]) = Move;
    GameBoard.moveListStart[2]++;
}
*/
function GenerateMoves() {
    GameBoard.moveListStart[GameBoard.ply + 1] = GameBoard.moveListStart[GameBoard.ply];

    var pieceType;
    var pieceNum;
    var square;

    // this is where we get some major deviation from Chess
    // first we'll grab the cards that are owned by the color in question
    // side is a COLOR, which is 0 for white, 1 for black, 2 for both.
    var card1 = GameBoard.cardsList[GameBoard.side * 2];
    var card2 = GameBoard.cardsList[GameBoard.side * 2 + 1];

    var moves1 = CARDS.MOVES[card1];
    var moves2 = CARDS.MOVES[card2];

    // then we'll iterate over all the pieces of the player in question and check
    // whether each piece, with either card, can attack the given square.
    // pieceList = [empty, wp1, wp2, wp3, wp4, white king, bp1, bp2, bp3, bp4, black king]

    var pieceSquare;
    for (var i = 0; i < 5; i++) {
        // grab the current piece for the current player
        var pieceIndex = 1 + GameBoard.side * 5 + i;
        pieceSquare = GameBoard.pieceList[pieceIndex];

        var possibleMoveSquare;
        // check both cards to see if that card lets that piece attack that square
        for (var j = 0; j < moves1.length; j++) {
            possibleMoveSquare = pieceSquare + convertRowColArrayToIndexOffset(moves1[j][0], moves1[j][1], GameBoard.side);
            // add move? and card.
        }

        for (j = 0; j < moves2.length; j++) {
            possibleMoveSquare = pieceSquare + convertRowColArrayToIndexOffset(moves2[j][0], moves2[j][1], GameBoard.side);
        }
    }

    // console.log('pieceSquare ' + PrSq(sq) + ' is not threatened by player ' + GameBoard.side);
    return false;

    if (GameBoard.side == COLOR.WHITE) {

    }
}