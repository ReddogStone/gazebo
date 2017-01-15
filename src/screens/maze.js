'use strict';

const MazeScreen = function(setRender) {
	const randomChannel = () => Math.floor(Math.random() * 256);

	function makePlayer(position) {
		const transform = {
			position: position,
			rotation: 0,
			scale: vec(0.5, 0.5)
		};

		const material = {
			id: 'filledWithBorder',
			params: {
				fill: 'darkcyan',
				stroke: 'midnightblue',
				lineWidth: 0.1

			}
		};

		return {
			transform: transform,
			material: material,
			renderScript: { id: 'arc', params: { start: 0, end: 2 * Math.PI } }
		};
	}

	function makeWall(begin, end) {
		const transform = {
			position: vec(0, 0),
			rotation: 0,
			scale: vec(1, 1)
		};

		const wallMaterial = {
			id: 'outline',
			params: {
				stroke: 'chocolate',
				lineWidth: 0.1
			}
		};

		let offset = vec(-0.5, -0.5);
		let from = vadd(begin, offset);
		let to = vadd(end, offset);

		return {
			transform: transform,
			renderScript: { id: 'line', params: { from: from, to: to } },
			material: wallMaterial
		};
	}

	function makeBackground(width, height) {
		return {
			transform: {
				position: vec(0, 0),
				rotation: 0,
				scale: vec(1, 1)
			},
			material: {
				id: 'filled',
				params: {
					fill: 'beige'
				}
			},
			renderScript: {
				id: 'polygon',
				params: {
					vertices: [
						vec(-0.5, -0.5),
						vec(-0.5, height - 0.5),
						vec(width - 0.5, height - 0.5),
						vec(width - 0.5, -0.5)
					]
				}
			}
		};
	}

	function makeFinish(position) {
		let transform = {
			position: position,
			rotation: 0,
			scale: vec(0.6, 0.6)
		};

		let material = {
			id: 'outline',
			params: {
				stroke: 'chocolate',
				lineWidth: 0.2
			}
		};

		return [
			{
				transform: transform,
				material: material,
				renderScript: {
					id: 'line',
					params: { from: vec(-0.5, -0.5), to: vec(0.5, 0.5) }
				}
			},
			{
				transform: transform,
				material: material,
				renderScript: {
					id: 'line',
					params: { from: vec(0.5, -0.5), to: vec(-0.5, 0.5) }
				}
			}
		];
	}

	let renderScripts = {
		quad: Shapes.quad,
		arc: function(context, params) {
			context.beginPath();
			context.arc(0, 0, 0.5, params.start, params.end);
			context.closePath();
		},
		pie: function(context, params) {
			context.beginPath();
			context.moveTo(0, 0);
			context.arc(0, 0, 0.5, params.start, params.end);
			context.closePath();
		},
		lid: function(context, params) {
			let s1 = 0.5 * Math.sin(params.start);
			let s2 = 0.5 * Math.sin(params.end);
			let c1 = 0.5 * Math.cos(params.start);
			let c2 = 0.5 * Math.cos(params.end);
			context.beginPath();
			context.moveTo(c1, s1);
			context.lineTo(0, 0);
			context.lineTo(c2, s2);
			context.moveTo(c1, s1);
			context.closePath();
		},
		line: function(context, params) {
			context.beginPath();
			context.moveTo(params.from.x, params.from.y);
			context.lineTo(params.to.x, params.to.y);
		},
		polygon: function(context, params) {
			const vertices = params.vertices;
			if (vertices.length === 0) { return; }

			context.beginPath();
			context.moveTo(vertices[0].x, vertices[0].y);
			for (let i = 1; i < vertices.length; i++) {
				let vertex = vertices[i];
				context.lineTo(vertex.x, vertex.y);
			}
			context.closePath();			
		}
	};

	let materials = {
		filledWithBorder: Materials.filledWithBorder,
		filled: Materials.filled,
		outline: Materials.outline
	};

	function toWorldCoords(canvasPoint, camera) {
		let p = vec(
			(canvasPoint.x - 0.5 * camera.screenSize.x) / camera.screenSize.y,
			0.5 - canvasPoint.y / camera.screenSize.y
		);

		return vadd(camera.position, vdiv(p, camera.zoom));
	}

	const flatten = list => list.reduce((memo, current) => memo.concat(current), []);

	let maze = Maze(14, 9);

	let horizontalWalls = flatten(maze.walls.horizontal.map(function(line, y) {
		return line.map(function(segment) {
			return makeWall(vec(segment.begin, y), vec(segment.end, y));
		});
	}));
	let verticalWalls = flatten(maze.walls.vertical.map(function(line, x) {
		return line.map(function(segment) {
			return makeWall(vec(x, segment.begin), vec(x, segment.end));
		});
	}));
	let walls = horizontalWalls.concat(verticalWalls);

	let bg = makeBackground(maze.width, maze.height);

	let player = vec(0, 0);
	let finish = vec(maze.width - 1, maze.height - 1);

	let behaviorSystem = BehaviorSystem();

	let camera = makeCamera(vec(600, 400), vec(0, 0), 0, vec(0.1, 0.1));
	setRender(function(context) {
		let canvas = context.canvas;

		camera = makeCamera(vec(canvas.width, canvas.height), vec((maze.width - 1) * 0.5, (maze.height - 1) * 0.5), 0, vec(0.1, 0.1));

		context.fillStyle = 'darkgray';
		context.fillRect(0, 0, canvas.width, canvas.height);

		let renderObjects = [bg].concat(walls, makeFinish(finish), makePlayer(player));

		renderScene(context, camera, renderObjects, renderScripts, materials);
	});

	const DIRS = {
		37: vec(-1, 0), // LEFT
		38: vec(0, 1), // UP
		39: vec(1, 0), // RIGHT
		40: vec(0, -1) // DOWN
	};

	let keyDown = null;
	const storeKeyDown = () => Behavior.run(function*() {
		let event = yield Behavior.filter(event => event.type === 'keydown' && !!DIRS[event.event.keyCode]);
		keyDown = event.event.keyCode;
	});
	const clearKeyDown = () => Behavior.run(function*() {
		let event = yield Behavior.filter(event => event.type === 'keyup' && event.event.keyCode === keyDown);
		keyDown = null;
	});

	function getDirection(keyCode) {
		return DIRS[keyCode];
	}

	function canGo(direction, cell) {
		if (direction.x < 0 && cell.canGoLeft()) { return true; }
		if (direction.x > 0 && cell.canGoRight()) { return true; }
		if (direction.y < 0 && cell.canGoDown()) { return true; }
		if (direction.y > 0 && cell.canGoUp()) { return true; }
		return false;
	}

	const walk = () => Behavior.run(function*() {
		function directionGood(direction) {
			let current = vmap(player, Math.round);
			let cell = maze.cell(current.x, current.y);
			return canGo(direction, cell);
		}

		let direction = getDirection(keyDown);
		if (!direction || !directionGood(direction)) {
			yield Behavior.filter(() => true);
			return;
		}

		let begin = vclone(player);
		let end = vmap(vadd(begin, direction), Math.round);
		yield Behavior.interval(0.15, function(progress) {
			player = vlerp(begin, end, progress);
		});
	});

	return Behavior.first(
		Behavior.repeat(storeKeyDown),
		Behavior.repeat(clearKeyDown),
		Behavior.repeat(walk),
		Behavior.run(function*() {
			yield Behavior.update(function() {
				let current = vmap(player, Math.round);
				if ((current.x === maze.width - 1) && (current.y === maze.height - 1)) {
					return true;
				}
			});
			yield Behavior.wait(1);
		})
	);
};