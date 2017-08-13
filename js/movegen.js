/**
 * Creates the integer representation of the movement based on rules defined in DEFS
 * @param {*} from 
 * @param {*} to 
 * @param {*} card 
 * @param {*} captured
 */
function MOVE(from, to, card, captured) {
    return from | (to << 6) | (card << 12) | (captured << 17);
}

/**
 * We separate addCaptureMove and addQuietMove because the algorithm will
 * evaluate their scores differently.
 * @param {*} move 
 */
function AddCaptureMove(move) {
    var index = GameBoard.moveListStart[GameBoard.ply + 1];
    GameBoard.moveList[index] = move;
    GameBoard.moveScores[index] = 0;
    GameBoard.moveListStart[GameBoard.ply + 1]++;
}

function AddQuietMove(move) {
    var index = GameBoard.moveListStart[GameBoard.ply + 1];
    GameBoard.moveList[index] = move;
    GameBoard.moveScores[index] = 0;
    GameBoard.moveListStart[GameBoard.ply + 1]++;
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
        
        var movesArr = [moves1, moves2];
        var cardArr = [card1, card2];
        for (var k = 0; k < 2; k++) {
            var mov = movesArr[k];
            var card = parseInt(cardArr[k]);

            var pieceTaken;
            var possibleMoveSquare;
            // check both cards to see if that card lets that piece attack that square
            for (var j = 0; j < mov.length; j++) {
                possibleMoveSquare = pieceSquare + convertRowColArrayToIndexOffset(mov[j][0], mov[j][1], GameBoard.side);
                pieceTaken = GameBoard.pieces[possibleMoveSquare];
                
                // piece is capturable if it's a piece of the opposite color
                capturablePiece = ((pieceTaken == PIECES.bK || pieceTaken == PIECES.bP) && GameBoard.side == COLOR.WHITE) ||
                    ((pieceTaken == PIECES.wK || pieceTaken == PIECES.wP) && GameBoard.side == COLOR.BLACK);
                if (pieceTaken == PIECES.EMPTY) {
                    AddQuietMove(MOVE(pieceSquare, possibleMoveSquare, card, PIECES.EMPTY));
                }
                else if (pieceTaken != SQUARES.OFFBOARD && capturablePiece) {
                    AddCaptureMove(MOVE(pieceSquare, possibleMoveSquare, card, pieceTaken));
                }
            }
        }
    }
}