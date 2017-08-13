var PIECES = { EMPTY: 0, wP: 1, wK: 2, bP: 3, bK: 4 };
var BRD_SQ_NUM = 63;
var PLAYABLE_BRD_SQ_NUM = 25;
var FILES = { FILE_A: 0, FILE_B: 1, FILE_C: 2, FILE_D: 3, FILE_E: 4, FILE_NONE: 5 };
var RANKS = { RANK_1: 0, RANK_2: 1, RANK_3: 2, RANK_4: 3, RANK_5: 4, RANK_NONE: 5 };

var SQUARES = {
    A1: 15, B1: 16, C1: 17, D1: 18, E1: 19,
    A5: 43, B5: 44, C5: 45, D5: 46, E5: 47,
    NO_SQ: 48, OFFBOARD: 49,
}

var COLOR = {
    WHITE: 0, BLACK: 1, BOTH: 2,
}

var MAXGAMEMOVES = 2048;
var MAXPOSITIONMOVES = 256;
var MAXDEPTH = 64;

var START_FEN = "ppkpp/5/5/5/PPKPP";

var PceChar = ".PKpk";
var RankChar = "12345";
var FileChar = "abcde";
var CardChar = [ "TIGER", "DRAGON", "FROG", "RABBIT", "CRAB", "ELEPHANT", "GOOSE", "ROOSTER",
    "MONKEY", "MANTIS", "HORSE", "OX", "CRANE", "BOAR", " EEL", "COBRA"]
var SideChar = "WB-"

/**
 * Assuming a piece is on 0,0, each card stores possible locations in an IPoint that a piece can
 * move to using it. Card.Moves is an array of moves the card allows, each move is an IPoint of
 * {col, row} 0-indexed relative to the piece. So Tiger.Moves = {0,2},{0,-1}, allowing a move
 * either 2 rows forward or 1 row backwards
 * 
 * MOVEDEFS is for readability, but we can call CARDS.MOVES[CARDS.TIGER] to get the array
 */
var CARDS = {
    TIGER: 0, DRAGON: 1, FROG: 2, RABBIT: 3, CRAB: 4, ELEPHANT: 5, GOOSE: 6, ROOSTER: 7,
    MONKEY: 8, MANTIS: 9, HORSE: 10, OX: 11, CRANE: 12, BOAR: 13, EEL: 14, COBRA: 15,
    MOVES: [
        [[0, 2], [0, -1]],
        [[-2, 1], [2, 1], [-1, -1], [1, -1]],
        [[-2, 0],[-1, 1],[1, -1]],
        [[-1,-1],[1,1],[2,0]],
        [[-2,0],[2,0],[0,1]],
        [[-1,0], [-1,1],[1,0],[1,1]],
        [[-1,0],[-1,1],[1,0],[1,-1]],
        [[-1,-1],[-1,0],[1,0],[1,1]],
        [[-1,-1],[-1,1],[1,-1],[1,1]],
        [[-1,1],[0,-1],[1,1]],
        [[-1,0],[0,1],[0,-1]],
        [[1,0],[0,1],[0,-1]],
        [[-1,-1], [0,1],[1,-1]],
        [[-1,0],[0,1],[1,0]],
        [[-1,-1],[-1,1],[1,0]],
        [[-1,0],[1,1],[1,-1]]
    ],
    MOVEDEFS: {
        TIGER: [[0,2], [0, -1]],
        DRAGON: [[-2, 1], [2,1], [-1,-1], [1,-1]],
        FROG: [[-2,0],[-1,1],[1,-1]],
        RABBIT: [[-1,-1],[1,1],[2,0]],
        CRAB: [[-2,0],[2,0],[0,1]],
        ELEPHANT: [[-1,0], [-1,1],[1,0],[1,1]],
        GOOSE: [[-1,0],[-1,1],[1,0],[1,-1]],
        ROOSTER: [[-1,-1],[-1,0],[1,0],[1,1]],
        MONKEY: [[-1,-1],[-1,1],[1,-1],[1,1]],
        MANTIS: [[-1,1],[0,-1],[1,1]],
        HORSE: [[-1,0],[0,1],[0,-1]],
        OX: [[1,0],[0,1],[0,-1]],
        CRANE: [[-1,-1], [0,1],[1,-1]],
        BOAR: [[-1,0],[0,1],[1,0]],
        EEL: [[-1,-1],[-1,1],[1,0]],
        COBRA: [[-1,0],[1,1],[1,-1]]
    }
}

var FilesBrd = new Array(BRD_SQ_NUM);
var RanksBrd = new Array(BRD_SQ_NUM);

/**
 * array that grabs the corresponding value between extended board and actual playable board
 */
var SqExtendedToSqActual = new Array(BRD_SQ_NUM);
var SqActualToSqExtended = new Array(PLAYABLE_BRD_SQ_NUM);

/**
 * FileRank to Square: given a file and rank number, returns the square index
 * @param {*} f file
 * @param {*} r rank
 */
function FR2SQ(f,r) {
    return 15 + f + r*7;
}

function SqExtended(sqPlayable) {
    return SqActualToSqExtended[sqPlayable];
}

function SqPlayable(sqExtended) {
    return SqExtendedToSqActual[sqExtended];
}

/*
when storing moves in onitama, the only important information is:
   which square the piece started from
   which squrae the piece moved to
   which card was used to make the move
   which piece was captured
we only have 63 values on extended board = 6 bits to store
card goes up to 15, but I know there are expansions so I'll use 5 bits for cards
piece captured has 3 bits, only 5 values
6+6+5+3 = 20 bits
int is 32 bits
0000 0000 0000 0000 0000 0000 0011 1111 -> from 0x3F
0000 0000 0000 0000 0000 1111 1100 0000 -> To >> 6, 0x3F
0000 0000 0000 0001 1111 0000 0000 0000 -> Card >> 12, 0x1F
0000 0000 0000 1110 0000 0000 0000 0000 -> Card >> 17, 0x07
*/

function FROMSQ(m) { return (m & 0x3F); }
function TOSQ(m) { return (m >> 6) & 0x3F; }
function CARD(m) { return (m >> 12) & 0x1F; };
function CAPTURED(m) { return (m >> 17) & 0x07; };

var NOMOVE = 0;