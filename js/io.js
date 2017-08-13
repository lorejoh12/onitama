function PrSq(sq) {
    return (FileChar[FilesBrd[sq]] + RankChar[RanksBrd[sq]]);
}

function PrMove(move) {
    var fileFrom = FilesBrd[FROMSQ(move)];
    var rankFrom = RanksBrd[FROMSQ(move)];
    var fileTo = FilesBrd[TOSQ(move)];
    var rankTo = RanksBrd[TOSQ(move)];    

    return FileChar[fileFrom] + RankChar[rankFrom] + FileChar[fileTo] + RankChar[rankTo];
}

function PrintMoveList() {
    var index, move;
    console.log('MoveList:');

    for (index = GameBoard.moveListStart[GameBoard.ply]; index < GameBoard.moveListStart[GameBoard.ply+1]; index++) {
        move = GameBoard.moveList[index];
        console.log(PrMove(move));
    }
}