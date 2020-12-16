import mock = require("./mock");

function skeletonRuntime(gameConfiguration?: g.GameConfiguration) {
	if (!gameConfiguration)
		gameConfiguration = { width: 320, height: 320, main: "", assets: {} };
	var game = new mock.Game(gameConfiguration);
	var scene = new g.Scene({ game });
	game.pushScene(scene);
	game._flushPostTickTasks();
	return {
		game: game,
		scene: scene
	};
}

export = skeletonRuntime;
