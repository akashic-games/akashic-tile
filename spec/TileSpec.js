global.g = require("@akashic/akashic-engine");
var Tile = require("../lib/Tile");

describe("Tile", function() {
	var mock = require("./lib/mock");
	var skeletonRuntime = require("./lib/skeleton");

	beforeEach(function() {
		jasmine.addMatchers(require("./lib/customMatchers"));
		runtime = skeletonRuntime();
	});

	afterEach(function() {
	});

	it("初期化", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480);
		var tileData = [[0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData,
		});
		expect(tile.tileChips).toEqual(surface);
		expect(tile.tileWidth).toEqual(32);
		expect(tile.tileHeight).toEqual(48);
		expect(tile.tileData).toBe(tileData);
	});

	it("render", function(){
		jasmine.addMatchers(require("./lib/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData
		});
		var r = new mock.Renderer();

		tile.tiledata = tileData;
		tile.invalidate();
		tile.render(r);
		expect(
			tile._renderer.methodCallHistory.filter(function(elem) {return elem === "drawImage";}).length
		).toBe(6);
		tile._renderer.clearMethodCallHistory();

		tile.tileData = null;
		tile.invalidate();
		expect(function(){ tile.render(r); }).toThrowError("AssertionError");
	});

	it("render validation", function(){
		jasmine.addMatchers(require("./lib/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 0,
			tileHeight: 0,
			tileData: tileData
		});
		var r = new mock.Renderer();

		//tile.tileData = tileData;
		tile.invalidate();
		tile.render(r);
		expect(
			tile._renderer.methodCallParamsHistory("drawImage").length
		).toBe(0);
		var count = 0;
		for (var y = 0; y < tile.tileData.length; y++) {
			var row = tile.tileData[y];
			for (var x = 0; x < row.length; x++) {
				var t = row[x];
				if (t < 0) {
					count += 1;
				}
			}
		}
		expect(count).toBe(0);
	});

	it("_tilesInRow更新", function() {
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(480, 480);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 32,
			tileHeight: 48,
			tileData: tileData
		});
		tile.tileWidth = 16;
		tile.invalidate();
		expect(tile._tilesInRow).toBe(30);
		var surface2 = new mock.Surface(320, 320);
		tile.tileChips = surface2;
		tile.invalidate();
		expect(tile._tilesInRow).toBe(20);
	});

	it("render use _drawnTileData", function(){
		jasmine.addMatchers(require("./lib/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(20, 10);
		var tileData = [[0,0,0],[0,0,0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 10,
			tileHeight: 10,
			tileData: tileData
		});
		tile._drawnTileData = [[-1,-1,-1],[-1,-1,-1]];

		var r = new mock.Renderer();
		tile.invalidate();
		tile.renderCache(r);

		tile.tileData = [[1,1,1],[0,0,0],[0,0,0]];
		tile.height += 10;
		tile._drawnTileData.push([-1,-1,-1]);
		tile.invalidate();
		tile.renderCache(r);

		var c = r.methodCallParamsHistory("drawImage").length;
		expect(c).toBe(12); // 6(first) + 9(second) - 3(skip)
	});

	it("render use commonArea", function(){
		jasmine.addMatchers(require("./lib/customMatchers"));
		var runtime = skeletonRuntime();
		var surface = new mock.Surface(20, 10);
		var tileData = [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]];
		var tile = new Tile({
			scene: runtime.scene,
			src: surface,
			tileWidth: 10,
			tileHeight: 10,
			tileData: tileData
		});
		tile._drawnTileData = [[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,-1,-1]];

		tile.redrawArea = {
			x: 10,
			y: 10,
			width: 10,
			height: 10
		};

		var r = new mock.Renderer();
		tile.invalidate();
		tile.renderCache(r);
		var c = r.methodCallParamsHistory("drawImage").length;
		expect(c).toBe(4);
	});

});
