import { Tile } from "@akashic-extension/akashic-tile";
import { sampleScene3 } from "./sampleScene3";
var game = g.game;

export function sampleScene2() {
	var scene = new g.Scene({
		game: game,
		assetIds: ["map", "frame", "right"]
	});
	scene.loaded.handle(function() {

		// background
		var rect = new g.FilledRect({
			scene: scene,
			cssColor: "black",
			width: game.width,
			height: game.height
		});
		scene.append(rect);

		// tile
		var mapAsset = <g.ImageAsset>scene.assets["map"];
		var tileArray: any[] = [];
		for (var i = 0; i < 50; ++i) {
			tileArray[i] = [];
			for (var j = 0; j < 50; ++j) {
				if (game.random[0].get(0, 1) > 0.5) {
					tileArray[i].push(0);
				} else {
					tileArray[i].push(1);
				}
			}
		}
		var to = {
			scene: scene,
			src: mapAsset,
			tileWidth:  32,
			tileHeight: 32,
			tileData: tileArray
		};
		var tile = new Tile(to);
		tile.redrawArea = {
			x: game.width / 4,
			y: game.height / 4,
			width: game.width/ 2,
			height: game.height / 2
		};
		tile.touchable = true;
		scene.append(tile);

		tile.update.handle(tile, function() {
			if (game.age % 15 !== 0) return;
			for (var i = 0; i < this.tileData.length; ++i) {
				for (var j = 0; j < this.tileData[i].length; ++j) {
					if (this.tileData[i][j] === 1) {
						this.tileData[i][j] = 2;
					} else if (this.tileData[i][j] === 2){
						this.tileData[i][j] = 1;
					}
				}
			}
			this.invalidate();
		});

		tile.pointDown.handle(tile, function(e) {
			this.bx = this.x;
			this.by = this.y;
			this.cx = this.redrawArea.x;
			this.cy = this.redrawArea.y;
		});
		tile.pointMove.handle(tile, function(e){
			this.x = this.bx + e.startDelta.x;
			this.y = this.by + e.startDelta.y;
			this.redrawArea = {
				x: this.cx - e.startDelta.x,
				y: this.cy - e.startDelta.y,
				width: game.width / 2,
				height: game.height / 2
			};
			this.invalidate();
		});
		tile.pointUp.handle(tile, function(e) {
			this.invalidate();
		});

		// frame
		var frameAsset = <g.ImageAsset>scene.assets["frame"];
		var frame = new g.Sprite({
			scene: scene,
			src: frameAsset
		});
		frame.x = (game.width - frameAsset.width) / 2;
		frame.y = (game.height - frameAsset.height) / 2;
		scene.append(frame);

		var next = new g.Sprite({
			scene: scene,
			src: <g.ImageAsset>scene.assets["right"]
		});
		next.x = game.width - 20;
		next.y = game.height - 20;
		scene.append(next);
		next.touchable = true;
		next.pointDown.handle(next, function() {
			var scene3 = sampleScene3();
			game.replaceScene(scene3);
		});

	});
	return scene;
};
