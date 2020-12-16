import { Tile } from "@akashic-extension/akashic-tile";
import { sampleScene1 } from "./sampleScene1";
var game = g.game;

export function sampleScene0() {
	var scene = new g.Scene({
		game: game,
		assetIds: [
			"partial_transparent",
			"right"
		]
	});
	scene.loaded.add(function() {
		// background
		var rect = new g.FilledRect({
			scene: scene,
			cssColor: "white",
			width: game.width,
			height: game.height
		});
		scene.append(rect);

		// tile
		var size = 3;
		var tileImage = scene.asset.getImageById("partial_transparent");
		var tileArray: number[][] = [];
		for (var i = 0; i < size; ++i) {
			tileArray[i] = [];
			for (var j = 0; j < size; ++j) {
				tileArray[i].push(Math.floor(3 * game.random.generate()));
			}
		}

		var chipSize = 32;
		var tile = new Tile({
			scene: scene,
			src: tileImage,
			x: (game.width - (size * chipSize)) / 2,
			y: (game.height - (size * chipSize)) / 2,
			tileWidth: 32,
			tileHeight: 32,
			tileData: tileArray
		});
		scene.append(tile);

		scene.pointUpCapture.add(function () {
			for (var i = 0; i < size; ++i) {
				for (var j = 0; j < size; ++j) {
					tile.tileData[i][j] = Math.floor(3 * game.random.generate());
				}
			}
			tile.invalidate();
		});

		var next = new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("right")
		});
		next.x = game.width - 20;
		next.y = game.height - 20;
		scene.append(next);
		next.touchable = true;
		next.pointDown.add(function() {
			var scene1 = sampleScene1();
			game.pushScene(scene1);
		});

	});
	return scene;
};
