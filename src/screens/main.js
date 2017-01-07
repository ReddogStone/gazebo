'use strict';

const MainScreen = function(setRender) {
	const randomChannel = () => Math.floor(Math.random() * 256);

	let quads = [];
	for (let i = 0; i < 100; i++) {
		let quad = {
			transform: {
				position: vec(Math.random() * 10 - 5, Math.random() * 10 - 5),
				rotation: Math.random() * 2 * Math.PI,
				scale: vec(Math.random() + 0.5, Math.random() + 0.5)
			},
			renderScript: {
				id: 'quad'
			},
			material: {
				id: 'filledWithBorder',
				params: {
					fill: `rgb(${randomChannel()},${randomChannel()},${randomChannel()})`,
					stroke: `rgb(${randomChannel()},${randomChannel()},${randomChannel()})`,
					lineWidth: 0.1
				}
			}	
		};

		quads.push(quad);
	}

	let renderScripts = {
		quad: Shapes.quad
	};

	let materials = {
		filledWithBorder: Materials.filledWithBorder
	};

	setRender(function(context) {
		let canvas = context.canvas;
		let camera = makeCamera(vec(canvas.width, canvas.height), vec(0, 0), 0, vec(0.1, 0.1));
		context.clearRect(0, 0, canvas.width, canvas.height);
		renderScene(context, camera, quads, renderScripts, materials);		
	});

	return Behavior.update(function(dt) {
		quads.forEach(function(quad) {
			quad.transform.rotation += dt * 1;
		});
	});
};