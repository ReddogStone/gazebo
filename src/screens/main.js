'use strict';

const MainScreen = function(setRender) {
	const randomChannel = () => Math.floor(Math.random() * 256);

	function makeEye(eye) {
		const size = eye.radius * 2;
		const scale = vec(size, size);

		const transform = {
			position: eye.position,
			rotation: eye.rotation,
			scale: scale
		};

		const openness = eye.openness;

		const bgMaterial = {
			id: 'filled',
			params: {
				fill: 'beige',
			}
		};
		const lidMaterial = {
			id: 'outline',
			params: {
				stroke: 'chocolate',
				lineWidth: 0.03
			}
		};
		const pupilMaterial = {
			id: 'filled',
			params: {
				fill: 'black'
			}
		};
		const visibilityMaterial = {
			id: 'filled',
			params: {
				fill: 'white',
				stroke: 'black',
				lineWidth: 0.03
			}
		};

		return [
			{
				transform: { position: vec(0, 0), rotation: 0, scale: vec(1, 1) },
				renderScript: { id: 'polygon', params: { vertices: eye.visibilityVertices } },
				material: visibilityMaterial
			},
			{
				transform: Object.assign({}, transform, { scale: vscale(scale, 0.9) }),
				renderScript: { id: 'arc', params: { start: -0.3 * Math.PI, end: 0.3 * Math.PI } },
				material: pupilMaterial
			},
			{
				transform: transform,
				renderScript: { id: 'pie', params: { start: 0.2 * openness * Math.PI, end: -0.15 * openness * Math.PI } },
				material: bgMaterial
			},
			{
				transform: transform,
				renderScript: { id: 'lid', params: { start: 0.2 * openness * Math.PI, end: -0.15 * openness * Math.PI } },
				material: lidMaterial
			}
		];
	}

	function makeObject(object) {
		const transform = {
			position: object.position,
			rotation: object.rotation,
			scale: object.scale
		};

		const material = {
			id: 'filledWithBorder',
			params: {
				fill: 'darkcyan',
				stroke: 'darkblue',
				lineWidth: 0.03
			}
		};

		return {
			transform: transform,
			renderScript: { id: 'polygon', params: { vertices: object.vertices } },
			material: material
		};
	}

	function makeBackground(background) {
		const transform = {
			position: background.position,
			rotation: background.rotation,
			scale: background.scale
		};

		const material = {
			id: 'filledWithBorder',
			params: {
				fill: 'darkgray',
				stroke: 'black',
				lineWidth: 0.03
			}
		};

		return {
			transform: transform,
			renderScript: { id: 'polygon', params: { vertices: background.vertices } },
			material: material
		};		
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

	let eye = {
		position: vec(0, 0),
		rotation: 0,
		radius: 0.2,
		openness: 0.8
	};

	let bg = {
		position: vec(0, 0),
		rotation: 0,
		scale: vec(1, 1),
		vertices: [
			vec(-7, -4.5),
			vec(-7, 4.5),
			vec(7, 4.5),
			vec(7, -4.5)
		]
	};

	const goRoundAndRound = t => self => Behavior.run(function*() {
		let originalPosition = vclone(self.position);
		let startPos;
		let endPos = self.position;

		while (true) {
			startPos = endPos;
			endPos = vadd(startPos, vec(0, -originalPosition.y * 2));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});

			startPos = endPos;
			endPos = vadd(startPos, vec(-originalPosition.x * 2, 0));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});

			startPos = endPos;
			endPos = vadd(startPos, vec(0, originalPosition.y * 2));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});

			startPos = endPos;
			endPos = vadd(startPos, vec(originalPosition.x * 2, 0));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});
		}
	});

	const upAndDown = t => self => Behavior.run(function*() {
		let originalPosition = vclone(self.position);
		let startPos;
		let endPos = self.position;

		while (true) {
			startPos = endPos;
			endPos = vadd(startPos, vec(0, -originalPosition.y * 2));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});

			startPos = endPos;
			endPos = vadd(startPos, vec(0, originalPosition.y * 2));
			yield Behavior.interval(t, function(progress) {
				self.position = vlerp(startPos, endPos, progress);
			});
		}
	});

	let objects = [
		{
			position: vec(-4, -2),
			rotation: 0,
			scale: vec(1, 1),
			vertices: [
				vec(-1, -0.5),
				vec(-1, 0.5),
				vec(1, 0.5),
				vec(1, -0.5)
			],
			behavior: goRoundAndRound(2)
		},
		{
			position: vec(5.5, -3.5),
			rotation: 0,
			scale: vec(1, 1),
			vertices: [
				vec(-0.25, -0.25),
				vec(-0.25, 0.25),
				vec(0.25, 0.25),
				vec(0.25, -0.25)
			],
			behavior: goRoundAndRound(3)
		},
		{
			position: vec(2, -1),
			rotation: 0,
			scale: vec(1, 1),
			vertices: [
				vec(-0.25, -0.25),
				vec(-0.25, 0.25),
				vec(0.25, 0.25)
			],
			behavior: upAndDown(5)
		},
		{
			position: vec(-2, -3),
			rotation: 0,
			scale: vec(1, 1),
			vertices: [
				vec(0, -0.25),
				vec(-0.25, -0.15),
				vec(-0.25, 0.15),
				vec(0.25, 0.15),
				vec(0.25, -0.15)
			],
			behavior: goRoundAndRound(5)
		}
	];

	function toWorldCoords(canvasPoint, camera) {
		let p = vec(
			(canvasPoint.x - 0.5 * camera.screenSize.x) / camera.screenSize.y,
			0.5 - canvasPoint.y / camera.screenSize.y
		);

		return vadd(camera.position, vdiv(p, camera.zoom));
	}

	function intersectRaySegment(rPos, rDir, p1, p2) {
		let rDelta = vsub(rPos, p1);
		let sDelta = vsub(p2, p1);
		let rNormal = vperp(rDir);
		let sNormal = vperp(sDelta);

		let uRay = vdot(rDelta, rNormal);
		let uSegment = vdot(sDelta, rNormal);
		let vRay = -vdot(rDelta, sNormal);
		let vSegment = vdot(rDir, sNormal);

		let tSegment = uRay / uSegment;
		let tRay = vRay / vSegment;

		if (tSegment >= 0 && tSegment <= 1 && tRay >= 0) {
			return tRay;
		}
	}

	function intersectRayPolygon(rPos, rDir, vertices) {
		let result = Number.POSITIVE_INFINITY;
		let count = vertices.length;
		for (let i = 0; i < count; i++) {
			let dist = intersectRaySegment(rPos, rDir, vertices[i], vertices[(i + 1) % count]);
			if (result > dist) {
				result = dist;
			}
		}
		return result;
	}

	function intersectRayPolygons(rPos, rDir, polygons) {
		let minDist = Number.POSITIVE_INFINITY;
		let minPolygon = null;
		polygons.forEach(function(polygon) {
			let pos = polygon.position;
			let rot = polygon.rotation;
			let scale = polygon.scale;
			let vertices = polygon.vertices.map(vertex => vadd(vrot(vmul(vertex, scale), rot), pos));
			let dist = intersectRayPolygon(rPos, rDir, vertices);
			if (minDist > dist) {
				minDist = dist;
				minPolygon = polygon;
			}			
		});
		return {
			dist: minDist,
			polygon: minPolygon
		};
	}

	const ascendingAngleFrom = baseDir => {
		let normal = vperp(baseDir);
		return (d1, d2) => {
			let sin1 = vdot(normal, d1);
			let sin2 = vdot(normal, d2);
			return sin1 > sin2 ? 1 : sin1 < sin2 ? -1 : 0;
		};
	}

	function handleVisibility(eye, colliders) {
		colliders.forEach(function(collider) {
			collider.active = false;
		});

		const FOV = 0.15 * Math.PI;

		let position = eye.position;
		let rotation = eye.rotation;

		let eyeDir = vec(Math.cos(rotation), Math.sin(rotation));
		let minCosDelta = Math.cos(FOV);

		let minAngle = rotation - FOV;
		let maxAngle = rotation + FOV;
		let minDir = vec(Math.cos(minAngle), Math.sin(minAngle));
		let maxDir = vec(Math.cos(maxAngle), Math.sin(maxAngle));

		let vertices = colliders.reduce(function(memo, polygon) {
			let pos = polygon.position;
			let rot = polygon.rotation;
			let scale = polygon.scale;
			let transformed = polygon.vertices.map(vertex => vadd(vrot(vmul(vertex, scale), rot), pos));
			return memo.concat(transformed);
		}, []);

		let dirs = vertices.map(vertex => vdir(eye.position, vertex));
		let dirsInRange = dirs.filter(dir => vdot(dir, eyeDir) >= minCosDelta).sort(ascendingAngleFrom(eyeDir));
		let dirsWithOffsets = dirsInRange
			.map(dir => [vrot(dir, -0.00001), dir, vrot(dir, 0.00001)])
			.reduce((memo, current) => memo.concat(current), []);
		let allDirs = [minDir].concat(dirsWithOffsets, maxDir);

		let visibilityVertices = allDirs.map(function(dir) {
			let result = intersectRayPolygons(eye.position, dir, colliders);
			result.polygon.active = true;
			return vadd(position, vscale(dir, result.dist));
		});

		return [vclone(eye.position)].concat(visibilityVertices);
	}

	let look = () => Behavior.run(function*() {
		let event = yield Behavior.type('mousemove');
		let pos = toWorldCoords(event.pos, camera);

		let delta = vsub(pos, eye.position);

		if (vlen(delta) > eye.radius * 0.5) {
			let angle = Math.atan2(delta.y, delta.x);
			eye.rotation = angle;
		}
	});

	let behaviorSystem = BehaviorSystem();
	objects.forEach(function(object) {
		if (!object.behavior) { return; }

		let behavior = object.behavior(object);
		let filtered = Behavior.filter(() => !!object.active, behavior);
		behaviorSystem.add(filtered);
	});

	let camera = makeCamera(vec(600, 400), vec(0, 0), 0, vec(0.1, 0.1));
	setRender(function(context) {
		let canvas = context.canvas;

		camera = makeCamera(vec(canvas.width, canvas.height), vec(0, 0), 0, vec(0.1, 0.1));

		context.fillStyle = 'darkgray';
		context.fillRect(0, 0, canvas.width, canvas.height);

		let renderObjects = [].concat(
			makeBackground(bg),
			makeEye(eye),
			objects.map(makeObject)
		);

		renderScene(context, camera, renderObjects, renderScripts, materials);		
	});	

	let t = 0;
	return Behavior.first(
		Behavior.repeat(look),
		function(event) {
			behaviorSystem.update(event);
			return {};
		},
		Behavior.update(function(dt) {
			t += dt;
			eye.openness = 0.15 * Math.sin(t) + 0.85;

			let angle1 = eye.rotation - 0.15 * Math.PI;
			let d1 = vec(Math.cos(angle1), Math.sin(angle1));
			let angle2 = eye.rotation + 0.15 * Math.PI;
			let d2 = vec(Math.cos(angle2), Math.sin(angle2));

			let colliders = [bg].concat(objects);
			eye.visibilityVertices = handleVisibility(eye, colliders);

			objects.forEach(function(object) {
			});			
		})
	)
};