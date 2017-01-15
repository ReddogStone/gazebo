'use strict';

const Maze = (function() {
	const DOWN = 1;
	const LEFT = 2;
	const UP = 4;
	const RIGHT = 8;

	function reverse(direction) {
		let result = direction << 2;
		return (result >= 16) ? (result >> 4) : result;
	}

	function randomMaze(width, height) {
		function getUnvisitedNeighbors(cellIndex) {
			let result = [];

			if (cellIndex % width > 0) { result.push({ index: cellIndex - 1, direction: LEFT}); }
			if (cellIndex % width < width - 1) { result.push({ index: cellIndex + 1, direction: RIGHT }); }
			if (cellIndex >= width) { result.push({ index: cellIndex - width, direction: DOWN }); }
			if (cellIndex < width * (height - 1) - 1) { result.push({ index: cellIndex + width, direction: UP }); }

			return result.filter(neighbor => !cells[neighbor.index].visited);
		}

		let cells = new Array(width * height);
		for (let i = 0; i < width * height; i++) {
			cells[i] = { type: 0, visited: false };
		}

		let startIndex = Math.floor(Math.random() * width * height);
		let active = [startIndex];
		cells[startIndex].visited = true;

		while (active.length > 0) {
			let currentActiveIndex = active.length - 1;
			let current = active[currentActiveIndex];
			let neighbors = getUnvisitedNeighbors(current);

			if (neighbors.length === 0) {
				active.splice(currentActiveIndex, 1);
				continue;
			}

			let neighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
			cells[current].type |= neighbor.direction;
			cells[neighbor.index].type |= reverse(neighbor.direction);
			cells[neighbor.index].visited = true;

			// console.log(current, '->', neighbor, '=>', cells[current]);

			active.push(neighbor.index);
		}

		cells = cells.map(cell => cell.type);

		return cells;
	}

	function getRanges(list, test) {
		let result = list.reduce(function(memo, current, index) {
			if (!test(current)) {
				if (memo.next) {
					memo.ranges.push(memo.next);
					memo.next = null;
				}
			} else {
				memo.next = memo.next || { begin: index };
				memo.next.end = index + 1;
			}
			return memo;
		}, { ranges: [], next: null });		

		if (result.next) {
			result.ranges.push(result.next);
		}
		return result.ranges;
	}

	function calculateWalls(width, height, cells) {
		let horizontal = [[{ begin: 0, end: width }]];

		for (let y = 1; y < height; y++) {
			let line = cells.slice(y * width, (y + 1) * width);
			line = getRanges(line, type => (type & DOWN) === 0);
			horizontal.push(line);
		}

		horizontal.push([{ begin: 0, end: width }]);

		let vertical = [[{ begin: 0, end: height }]];

		for (let x = 1; x < width; x++) {
			let column = [];
			for (let y = 0; y < height; y++) {
				column.push(cells[x + y * width]);
			}
			column = getRanges(column, type => (type & LEFT) === 0);
			vertical.push(column);
		}

		vertical.push([{ begin: 0, end: height }]);

		return { horizontal: horizontal, vertical: vertical };
	}

	let exports = function(width, height) {
		let cells = randomMaze(width, height);
		let walls = calculateWalls(width, height, cells);

		return {
			_cells: cells,
			cell: function(x, y) {
				if (x < 0 || x >= width || y < 0 || y >= height) {
					return null;
				}

				let index = x + y * width;
				let self = this;
				return {
					canGoUp: function() { return (self._cells[index] & UP) !== 0; },
					canGoDown: function() { return (self._cells[index] & DOWN) !== 0; },
					canGoLeft: function() { return (self._cells[index] & LEFT) !== 0; },
					canGoRight: function() { return (self._cells[index] & RIGHT) !== 0; }
				};
			},
			get width() { return width; },
			get height() { return height; },

			get walls() { return walls; }
		};
	};

	return exports;
})();
