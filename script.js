/* Nathan Kanigsberg
Project 1 - Juno College JavaScript Course
August 3, 2020 */

/** @namespace */
const game = {};

/** @type {array} board array */
game.board = [];

/** @type {JQuery} jQuery gameBoard object */
game.$board = $('.game-board');

/** @type {array} game-piece colours */
game.colours = ['red', 'green', 'blue', 'yellow', 'orange', 'purple'];

/** @type {array} the objective to match  */
game.objective = [];

/** @type {number} the active row */
game.activeRow = 11; //start with bottom row


/**
 * Game pieces that player will be interacting with
 */
class gamePiece {
	/**
	 * @param {number} x - x coordinate
	 * @param {number} y - y coordinate
	 * @param {string} colour - the colour of the gamepiece
	 * @param {boolean} active - whether clickable or not
	 */
	constructor(x, y, colour, active) {
		this.x = x;
		this.y = y;
		this.colour = colour;
		this.active = active;
	}
}


/**
 * Builds the game board
 * @param {array} board - the board array
 */
game.buildBoard = function(board) {
	
	// build rows
	for (let y = 0; y < 12; y++) {
		board.push([]); //push row array
		game.$board.append(`<div class="row row-${y} inactive"></div>`); //append row to html

		// build columns
		for (let x = 0; x < 5; x++) {
			
			// first four columns - add game-pieces
			if (x < 4) {
				/** @type {gamePiece} a new gamepiece at the current coordinates */
				const newPiece = new gamePiece(x, y, 'empty', false);
				board[y].push(newPiece); //push gamePiece to current row array
				
				// append gamePiece to html
				game.$board.find(`div.row-${y}`).append(`<span class="game-piece ${newPiece.colour}" x="${newPiece.x}" y="${newPiece.y}"></span>`);

			// last column - add score-pip container
			} else {
				game.$board.find(`div.row-${y}`).append(`<span class="score" x="${x}" y="${y}"></span>`);
			}
		}

		// add score pips to container
		for (let i = 0; i < 4; i++) {
			$(`.score[y="${y}"]`).append(`<span class="score-pip score-pip-${i} empty"></span>`);
		}
	}
};


/** Generate the objective */
game.generateObjective = function() {
	for (let i = 0; i < 4; i++) {
		game.objective[i] = Math.floor(Math.random() * game.colours.length);
	}
};


/** Remove warnings */
game.removeWarnings = function() {
	// only do if warning exists
	if ($('p.warning').length) {
		$('div.game-container').find('p.warning').remove();
		$('div.game-container').css('height', '670px'); //restore default height
	}
};


/** Change button to restart */
game.buttonRestart = function(button) {
	$(`button.${button}`).off('click').text('New Game').css('background', '#67b904').on('click', function() {
		location.reload();
	});
};


/** Listen for user input and change color of corresponding piece */
game.changeColour = function() {
	/** @type {array} the possible colours of the gamepiece */
	const colours = game.colours.slice();
	colours.unshift('empty'); // add 'empty' to start of the colours array

	/** change to next colour when clicked */
	game.$board.on('click', 'span.game-piece', function() {
		// remove warnings
		game.removeWarnings();
		
		/** @type {number} the current column */
		const column = parseInt($(this).attr('x'));

		/** @type {number} the current row */
		const row = parseInt($(this).attr('y'));	

		/** 
		 * Get the current gamepiece
		 * @return {gamePiece} The current game piece
		 */
		const getCurrentGamePiece = function () {
			const arrayRow = game.board[row];
			return arrayRow[column];
		};

		/** @type {gamePiece} the currently selected gamepiece */
		const currentGamePiece = getCurrentGamePiece();
		
		/** only change colour if piece is active */
		if (currentGamePiece.active === true) {

			/** @type {number} index of current colour */
			const colourIndex = colours.indexOf(currentGamePiece.colour);
			// console.log(colourIndex);

			/** @type {number} the new colour index */
			const newIndex = (colourIndex + 1) % colours.length; // use modulo to wrap to beginning of array

			/** change the colour */
			currentGamePiece.colour = colours[newIndex];
			$(this).removeClass(`${colours[colourIndex]}`).addClass(`${colours[newIndex]}`);
		};
	});
};


/**
 * Activates the row passed as an argument
 * @param {number} row - the row to activate
 */
game.activateRow = function(row) {
	game.board[row].forEach(element => element.active = true); //activate each gamePiece
	$(`div.row-${row}`).removeClass('inactive'); //remove 'inactive' class from html piece
};


/**
 * Deactivates the row passed as an argument
 * @param {number} row - the row to deactivate
 */
game.deactivateRow = function(row) {
	game.board[row].forEach(element => element.active = false); //deactivate each gamePiece
	$(`div.row-${row}`).addClass('inactive'); //add 'inactive' class from html piece
};



/**
 * Checks row for empty pieces
 * @param {array} row - the row to search
 * @returns {boolean} true if any empty pieces are found, false otherwise
 */
game.emptyPieces = function(row) {
	for (let i in row) {
		if (row[i].colour === 'empty') return true;
	}
	return false;
};


/**
 * Checks rows and displays scores when button pressed
 */
game.checkRow = function() {
	/** @type {JQuery} Submit button */
	const $button = $('button.submit');

	/** on button click evaluate score and move to next row */
	$button.on('click', function() {
		game.removeWarnings(); // remove previous warnings

		/** @type {array} - current row array */
		const currentRow = game.board[game.activeRow];

		// if not on the last row
		if (game.activeRow > 0) {

			// if each element has a colour (isn't empty)
			if (!game.emptyPieces(currentRow)) {

				//SCORE AND DISPLAY PEGS
				/** @type {array} a copy of the objectives that can be manipulated */
				let objectiveClone = game.objective.slice();
				/** @type {array} the code represented on this row */
				let rowCode = [];
				/** @type {number} number of pieces with correct colour */
				let numCorrectColour = 0;
				/** @type {number} number of pieces with correct location */
				let numCorrectLocation = 0;
				/** @type {boolean} whether or not win condition is met */
				let win = false;

				// convert colours to code string (rowCode)
				for (let i in currentRow) {
					const code = game.colours.indexOf(`${currentRow[i].colour}`);
					rowCode[i] = code;
				};

				// determine number of score pegs for correct location (& colour)
				for (let i in rowCode) {
					if (objectiveClone[i] === rowCode[i]) {
						objectiveClone[i] = 7; //number outside of range to match, so won't allow for duplicate matching (eliminates it from future match attempts)
						rowCode[i] = 8; //different number so they won't match each other
						numCorrectLocation++;
						numCorrectColour++;
					};
				};

				// determine number of score pegs for correct colour only
				for (let i in rowCode) {
					if (objectiveClone.includes(rowCode[i])) {
						const firstMatch = objectiveClone.indexOf(rowCode[i]);
						objectiveClone[firstMatch] = 7; //number outside of range to match, so won't allow for duplicate matching
						numCorrectColour++;
					};
				}

				// if all four correct, set win condition
				if (numCorrectLocation === 4) {
					win = true;
				}

				// loop through score pips and colour based on score
				for (let i = 0; i < 4; i++) {
					if (numCorrectLocation > 0) {
						$(`span.score[y="${game.activeRow}"] .score-pip-${i}`).addClass('correctLocation');
						numCorrectLocation--;
						numCorrectColour--;
					} else if (numCorrectColour > 0) {
						$(`span.score[y="${game.activeRow}"] .score-pip-${i}`).addClass('correctColour');
						numCorrectColour--;
					};
				};

				// deactivate current row
				game.deactivateRow(game.activeRow);

				// if win condition is set
				if (win) {
					// win the game
					game.finish('win');
				} else {
				// activate next row
				game.activateRow(game.activeRow - 1);
				game.activeRow--;
				}

			// if there is an empty gamepiece
			} else {
				// append warning to container - choose all pegs
				$('div.game-container').append('<p class="warning">Empty pegs!</p>').css('height', '+=40');
			}

		// if on last row
		} else { 
			// game over man
			game.finish('lose');
		}
	});
};


/**
 * Show the solution to the player
 */
game.showSolution = function() {
	// only if solution isn't shown already (prevents duplicate html)
	if (!$('div.solution').length) {
		// append solution to html
		$('div.give-up-container').append(`<div class="give-up">
			<h3>Solution:</h3>
			<div class="solution">
				<span class="game-piece ${game.colours[game.objective[0]]}"></span>
				<span class="game-piece ${game.colours[game.objective[1]]}"></span>
				<span class="game-piece ${game.colours[game.objective[2]]}"></span>
				<span class="game-piece ${game.colours[game.objective[3]]}"></span>
			</div>
		</div>`);

		// enlarge container to fit
		$('div.give-up-container').css('height', '+=100');
	}
}


/**
 * Finishes the game
 * @param {string} condition - 'win' or 'lose' condition
 */
game.finish = function(condition) {
	// if player wins the game
	if (condition === 'win') {
		$('div.row').removeClass('inactive').addClass('win');
		$(`div.row-${game.activeRow}`).removeClass('win').addClass('win-row');
		$('div.game-container').prepend('<p class="game-over game-over-win">You Win!<p>');

	// if player loses the game
	} else if (condition === 'lose') {
		game.deactivateRow(game.activeRow);
		$('div.row').removeClass('inactive').addClass('lose');
		$('div.game-container').prepend('<p class="game-over game-over-lose">You Lose!<p>');
	}

	//show solution
	game.showSolution();

	//increase size of game-container to fit game-over message
	$('div.game-container').css('height', '+=50');

	// change buttons to restart
	game.buttonRestart('give-up');
	game.buttonRestart('submit');
};


/**
 * Listen for give up button click and end game, display solution
 */
game.giveUp = function() {
	$('button.give-up').on('click', function() {
		
		// change button to restart
		game.buttonRestart('give-up');

		// show solution
		game.showSolution();
	});


	// move container below gameboard at small screen sizes on load (aesthetic choice)
	if ($(document).width() < 587) 
		$('div.give-up-container').insertAfter('div.game-container');

	// move container below gameboard at small screen sizes dynamically
	$(window).on('resize', function() {
		if ($(document).width() < 587) {
			$('div.give-up-container').insertAfter('div.game-container');
		} else {
			$('div.give-up-container').insertAfter('div.instructions-container');
		}
	});
};



/**
 * Initialize the game
 */
game.init = function() {
	game.buildBoard(game.board);
	game.generateObjective();
	game.changeColour();
	game.activateRow(game.activeRow);
	game.checkRow();
	game.giveUp();
};


/**
 * Document Ready
 */
$(document).ready(function(){
	game.init();
});