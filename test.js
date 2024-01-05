const util = require('./util');
const game = require('./game');

beforeEach(() => {
  util.validMoves = [];
})

test('returns a valid move', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 1, 1, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  expect(util.getMove(1, board)).toEqual([5,3]);
});

test('returns a valid response', () => {
  expect(util.prepareResponse([5, 3])).toEqual(`[5,3]\n`);
});

test('returns correct player num', () => {
  const player = 1;
  expect(util.determinePlayer(player)).toEqual([1,2]);
});

test('returns list of opp piece positions', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 2, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  const oppNum = 2;
  expect(util.findEveryPiece(board, oppNum)).toEqual([[3,4], [4,3]]);
})

test('returns valid 1-jump move for open positions top left and top center around one opp piece', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 2, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  const myNum = 1;
  var validMovesArr = [];
  var flip = [];
  expect(util.findValidMoves(validMovesArr, flip, board, [3,4], myNum)).toEqual([[2,4],[3,5]]);
})


test('returns multi-jump move and correct flip counts', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 2, 0, 0, 0], [0, 0, 0, 2, 2, 0, 0, 0], [0, 0, 0, 0, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  const myNum = 1;
  var validMovesArr = [];
  var flip = [];
  expect(util.findValidMoves(validMovesArr, flip, board, [3,4], myNum)).toEqual([[2,4],[3,5]]);
  expect(flip[0]).toEqual(2);
  expect(flip[1]).toEqual(1);
})

test('returns list of nonempty board spaces', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 2, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  expect(util.findNonEmptyBoardSpaces(board)).toEqual([[3,3], [3,4], [4,3], [4,4]]);
})


test('flipFewest sorts valid moves by which have fewest flips of opp pieces', () => {
  const board = [[0,0,1,0,0,0,0,0],[0,2,0,1,0,0,0,0],[0,0,2,2,1,2,0,0],[0,0,0,2,1,1,0,0],[0,0,0,2,1,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0]]
  const myNum = 1;
  var validMovesArr = [];
  var flip = [];
  util.getMove(1, board);
  util.minFlipAndGroup(validMovesArr, flip);
})

test('findCenter finds center of small group of pieces', () => {
  const board = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 1, 2, 0, 0, 0], [0, 0, 0, 2, 1, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  
  expect(util.findCenter([[3,3],[4,4]])).toEqual([3.5, 3.5]);
})
