import { Tile } from "@akashic-extension/akashic-tile";
var game = g.game;

export function sampleScene3() {
	var scene = new g.Scene({
		game: game,
		assetIds: ["map", "frame", "right", "bw"]
	});
	scene.loaded.add(function() {
		var tileArray: any[] = [];
		for (var i = 0; i < 80; ++i) {
			tileArray[i] = [];
			for (var j = 0; j < 80; ++j) {
				tileArray[i].push(0);
			}
		}
		var mapAsset = <g.ImageAsset>scene.assets["bw"];
		var to = {
			scene: scene,
			src: mapAsset,
			tileWidth:  8,
			tileHeight: 8,
			tileData: tileArray
		};
		var tile = new Tile(to);
		scene.append(tile);
		tile.update.add(function() {
			var arr = tile.tileData;
			for (var i = 0; i < 80; ++i) {
				for (var j = 0; j < 80; ++j) {
					var t = arr[i][j];
					if (i + j === game.age % 80) {
						arr[i][j] = 1;
					}else {
						arr[i][j] = 0;
					}
				}
			}
			this.invalidate();
		}, tile);

		var prev = new g.Sprite({
			scene: scene,
			src: <g.ImageAsset>scene.assets["right"]
		});
		prev.x = game.width - 20;
		prev.y = game.height - 20;
		prev.angle = 180;
		scene.append(prev);
		prev.touchable = true;
		prev.pointDown.add(function() {
			game.popScene();
		}, prev);

	});
	return scene;
};
