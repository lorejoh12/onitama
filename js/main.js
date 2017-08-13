$(function() {
    init();
    console.log("Main init called");
    ParseFen("2kpp/p3p/5/P3P/2KPP 0 4 10 5 14 0");
    PrintSqAttacked();    
    PrintBoard();
});

function InitFilesRanksBrd() {
    var index = 0;
    var file = FILES.FILE_A;
    var rank = RANKS.RANK_1;
    var sq = SQUARES.A1;

    for(index = 0; index < BRD_SQ_NUM; index++) {
        FilesBrd[index] = SQUARES.OFFBOARD;
        RanksBrd[index] = SQUARES.OFFBOARD;
    }

    for(rank = RANKS.RANK_1; rank <= RANKS.RANK_5; rank++) {
        for(file = FILES.FILE_A; file <= FILES.FILE_E; file++) {
            sq = FR2SQ(file, rank);
            FilesBrd[sq] = file;
            RanksBrd[sq] = rank;
        }
    }
}

function initializeSqActualToSqExtended() {
    var i = 0;
    var rank = RANKS.RANK_1;
    var file = FILES.FILE_A;
    var sq = SQUARES.A1;
    var sqPlayable = 0;

    for (i = 0; i < BRD_SQ_NUM; i++) {
        SqExtendedToSqActual[i] = PLAYABLE_BRD_SQ_NUM; // outside of possible values
    }

    for (i = 0; i < PLAYABLE_BRD_SQ_NUM; i++) {
        SqActualToSqExtended[i] = BRD_SQ_NUM; // outside of possible values
    }

    for (rank = RANKS.RANK_1; rank <= RANKS.RANK_5; rank ++) {
        for (file = FILES.FILE_A; file <= FILES.FILE_E; file ++) {
            sq = FR2SQ(file, rank);
            SqActualToSqExtended[sqPlayable] = sq;
            SqExtendedToSqActual[sq] = sqPlayable;
            sqPlayable ++;
        }
    }
}

function init() {
    console.log("init called");

    InitFilesRanksBrd();
    initializeSqActualToSqExtended();
}