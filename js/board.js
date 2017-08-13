var GameBoard = {};

GameBoard.pieces = new Array(BRD_SQ_NUM);
GameBoard.side = COLOR.WHITE;

/**
 * The move count "history ply"
 */
GameBoard.hisPly = 0;

/**
 * The AI search depth
 */
GameBoard.ply = 0;


/**
 * There are 10 possible pieces. White's king, 4 pawns, and black's king, 4 pawns
 * [empty, wp1, wp2, wp3, wp4, white king, bp1, bp2, bp3, bp4, black king]
 */
GameBoard.pieceList = new Array(11);

/**
 * how many of each PIECES exist on the board
 */
GameBoard.pieceNum = new Array(5);

/**
 * There can only be 5 cards in playat a time
 * [white card 1, white card 2, black card 1, black card 2, rotated card]
 */
GameBoard.cardsList = new Array(5);


GameBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
GameBoard.moveListStart = new Array(MAXDEPTH);


/**
 * Piece comes from defs.PIECES, pieceNum is the number of that piece
 * returns the index in the pieceList for that piece
 * @param {*} piece 
 * @param {*} pieceNum the 0-indexed piece number. for example, pawns can be 1-4
 */
function pieceIndex(piece, pieceNum) {
    if (piece == PIECES.wP) { return PIECES.wP + pieceNum; }
    if (piece == PIECES.bP) { return PIECES.bP + 3 + pieceNum }
    if (piece == PIECES.wK) { return 5; }
    if (piece == PIECES.bK) { return 10; }
    return 0;
}

function PrintPieceLists() {
    var piece, pieceNum;

    for (piece = PIECES.wP; piece < PIECES.bK; piece++) {
        for(pieceNum = 0; pieceNum < GameBoard.pieceNum[piece]; pieceNum++) {
            console.log('Piece ' + PceChar[piece] + ' on ' + PrSq( GameBoard.pieceList[pieceIndex(piece, pieceNum)]));
        }
    }
}

function UpdateListsMaterial() {
    var piece, sq, index, color;

    for (i = 0; i < GameBoard.pieceList.length; i++) {
        GameBoard.pieceList[i] = 0;
    }

    for (i = 0; i < 5; i++) {
        GameBoard.pieceNum[i] = 0;
    }

    for (index = 0; index < PLAYABLE_BRD_SQ_NUM; index++) {
        sq = SqExtended(index);
        piece = GameBoard.pieces[sq];
        if (piece != PIECES.EMPTY) {
            GameBoard.pieceList[pieceIndex(piece, GameBoard.pieceNum[piece])] = sq;
            GameBoard.pieceNum[piece]++;
        }
    }

    PrintPieceLists();
}

function ResetBoard() {
    var i = 0;

    for (i = 0; i < BRD_SQ_NUM; i++) {
        GameBoard.pieces[i] = SQUARES.OFFBOARD;
    }

    for (i = 0; i < PLAYABLE_BRD_SQ_NUM; i++) {
        GameBoard.pieces[SqExtended(i)] = PIECES.EMPTY;
    }

    GameBoard.side = COLOR.BOTH;
    GameBoard.ply = 0;
    GameBoard.hisPly = 0;
    GameBoard.moveListStart[GameBoard.ply] = 0;
}

function PrintSqAttacked() {

    var sq, file, rank, piece;

    console.log('\nAttacked:\n');

    for(rank = RANKS.RANK_5; rank >= RANKS.RANK_1; rank--) {
        var line = ((rank + 1) + "   ");
        for (file = FILES.FILE_A; file <= FILES.FILE_E; file++) {
            sq = FR2SQ(file, rank);
            if (SqAttacked(sq, GameBoard.side)) piece = "X";
            else piece = "-";
            line += (" " + piece + " ");
        }
        
        console.log(line);
    }

    console.log("");
}

function PrintBoard() {
    var sq, file, rank, piece;

    console.log("\nGame Board:\n");

    for(rank = RANKS.RANK_5; rank >= RANKS.RANK_1; rank--){
        var line = RankChar[rank] + "  ";
        for (file = FILES.FILE_A; file <= FILES.FILE_E; file++) {
            sq = FR2SQ(file, rank);
            piece = GameBoard.pieces[sq];
            line += " " + PceChar[piece] + " ";
        }
        console.log(line);
    }

    console.log("");
    var line = "   ";
    for (file = FILES.FILE_A; file <= FILES.FILE_E; file++) {
        line += (' ' + FileChar[file] + ' ');
    }

    console.log(line);
    console.log("side: " + SideChar[GameBoard.side]);
    console.log("white cards: " + CardChar[GameBoard.cardsList[0]] + ", " + CardChar[GameBoard.cardsList[1]]);
    console.log("black cards: " + CardChar[GameBoard.cardsList[2]] + ", " + CardChar[GameBoard.cardsList[3]]);
    console.log("side card: " + CardChar[GameBoard.cardsList[4]]);
    
}

/**
 * Takes in a string and determines the board position
 * in actual chess notation this is a lot more complicated
 * but we can do this easier for onitama
 * format:  number = x blank spaces
 *          p = pawn
 *          k = king
 *          lowercase = black
 *          uppercase = white
 * 
 * 2kpp/p3p/5/p3p/2kpp
 * turns into:
 * | | |K|P|P|
 * |P| | | |P|
 * | | | | | |
 * |P| | | |P|
 * | | |K|P|P|
 * 
 * Also need to maintain which cards are being used and who has what
 * we'll use --string-- whiteCard1 whiteCard2 blackCard1 blackCard2 offCard as our notation
 * @param {*} fen 
 */
function ParseFen(fen) {
    ResetBoard();

    var rank = RANKS.RANK_5;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;
    var sqExtended = 0;
    var fenCount = 0; // fen[fenCount]

    while ((rank >= RANKS.RANK_1) && fenCount < fen.length) {
        count = 1;
        var parsedNum = parseInt(fen[fenCount]);

        if (!isNaN(parsedNum)) {
            piece = PIECES.EMPTY;
            count = parsedNum;
        }

        switch (fen[fenCount]) {
            case 'p': piece = PIECES.bP; break;
            case 'k': piece = PIECES.bK; break;
            case 'P': piece = PIECES.wP; break;
            case 'K': piece = PIECES.wK; break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCount++;
                continue;
            default:
                if (isNaN(parsedNum)) {
                    console.log("FEN error");
                    return;
                }
        }

        for (i = 0; i < count; i++) {
            sqExtended = FR2SQ(file, rank);
            GameBoard.pieces[sqExtended] = piece;
            file++;
        }
        
        fenCount++;
    }

    cardsArr = fen.split(" ");
    GameBoard.cardsList = cardsArr.splice(1, 5);
    GameBoard.side = cardsArr[1];

    UpdateListsMaterial()
}

/**
 * Returns true if the given square (index in extended board) is under threat by any
 * of the pieces for the given color
 * @param {*} sq 
 * @param {*} side 
 */
function SqAttacked(sq, side) {

    // this is where we get some major deviation from Chess
    // first we'll grab the cards that are owned by the color in question
    // side is a COLOR, which is 0 for white, 1 for black, 2 for both.
    var card1 = GameBoard.cardsList[side * 2];
    var card2 = GameBoard.cardsList[side * 2 + 1];

    var moves1 = CARDS.MOVES[card1];
    var moves2 = CARDS.MOVES[card2];

    // then we'll iterate over all the pieces of the player in question and check
    // whether each piece, with either card, can attack the given square.
    // pieceList = [empty, wp1, wp2, wp3, wp4, white king, bp1, bp2, bp3, bp4, black king]

    var square;
    for (var i = 0; i < 5; i++) {
        // grab the current piece for the current player
        var pieceIndex = 1 + side * 5 + i;
        square = GameBoard.pieceList[pieceIndex];

        // check both cards to see if that card lets that piece attack that square
        for (var j = 0; j < moves1.length; j++) {
            if (square + convertRowColArrayToIndexOffset(moves1[j][0], moves1[j][1], side) == sq) {
                // console.log('square '+PrSq(sq) + ' threatened by '+side+' with piece on '+PrSq(square)+' using card '+CardChar[card1]);
                return true;
            }
        }

        for (j = 0; j < moves2.length; j++) {
            if (square + convertRowColArrayToIndexOffset(moves2[j][0], moves2[j][1], side) == sq) {
                // console.log('square '+PrSq(sq) + ' threatened by '+side+' with piece on '+PrSq(square)+' using card '+CardChar[card2]);                
                return true;
            }
        }
    }

    // console.log('square ' + PrSq(sq) + ' is not threatened by player ' + side);
    return false;
}

/**
 * For converting movement arrays. Given [-1, 1], using black (who goes upwards in numbers),
 * meaning one column right and one column down should return -8 as the index offset from
 * current index. Using white, that same move is  one column left and one column up, which should 
 * return + 8 (so we can just invert the result based on color)
 * @param {*} col 
 * @param {*} row 
 * @param {*} side 
 */
function convertRowColArrayToIndexOffset(col, row, side) {
    return ((side * 2) - 1) * (col - row * 7);
}