import { Tile } from "@akashic-extension/akashic-tile";
import { sampleScene3 } from "./sampleScene3";
var game = g.game;

export function sampleScene2() {
	var scene = new g.Scene({
		game: game,
		assetIds: ["map", "frame", "right"]
	});
	scene.loaded.add(function() {

		// background
		var rect = new g.FilledRect({
			scene: scene,
			cssColor: "black",
			width: game.width,
			height: game.height
		});
		scene.append(rect);

		// tile
		var mapAsset = scene.asset.getImageById("map");
		var tileArray: number[][] = [];
		for (var i = 0; i < 50; ++i) {
			tileArray[i] = [];
			for (var j = 0; j < 50; ++j) {
				tileArray[i].push(Math.floor(2 * game.random.generate()));
			}
		}
		var tile = new Tile({
			scene: scene,
			src: mapAsset,
			tileWidth:  32,
			tileHeight: 32,
			tileData: tileArray
		});
		tile.redrawArea = {
			x: game.width / 4,
			y: game.height / 4,
			width: game.width/ 2,
			height: game.height / 2
		};
		tile.touchable = true;
		scene.append(tile);

		tile.update.add(function() {
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
		}, tile);

		tile.pointDown.add(function(e: any) {
			this.bx = this.x;
			this.by = this.y;
			this.cx = this.redrawArea.x;
			this.cy = this.redrawArea.y;
		}, tile);
		tile.pointMove.add(function(e: any){
			this.x = this.bx + e.startDelta.x;
			this.y = this.by + e.startDelta.y;
			this.redrawArea = {
				x: this.cx - e.startDelta.x,
				y: this.cy - e.startDelta.y,
				width: game.width / 2,
				height: game.height / 2
			};
			this.invalidate();
		}, tile);
		tile.pointUp.add(function(e: any) {
			this.invalidate();
		}, tile);

		// frame
		var frameAsset = scene.asset.getImageById("frame");
		var frame = new g.Sprite({
			scene: scene,
			src: frameAsset
		});
		frame.x = (game.width - frameAsset.width) / 2;
		frame.y = (game.height - frameAsset.height) / 2;
		scene.append(frame);

		var next = new g.Sprite({
			scene: scene,
			src: scene.asset.getImageById("right")
		});
		next.x = game.width - 20;
		next.y = game.height - 20;
		scene.append(next);
		next.touchable = true;
		next.pointDown.add(function() {
			var scene3 = sampleScene3();
			game.replaceScene(scene3);
		}, next);

	});
	return scene;
};
