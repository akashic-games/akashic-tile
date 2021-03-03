import {TileParameterObject} from "./TileParameterObject";

/**
 * RPGのマップなどで利用される、マップチップとタイルデータによるパターン描画を行うエンティティ。
 */
export class Tile extends g.CacheableE {
	/**
	 * マップチップ画像。
	 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
	 */
	tileChips: g.Surface;

	/**
	 * マップチップ一つの幅。
	 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
	 */
	tileWidth: number;

	/**
	 * マップチップ一つの高さ。
	 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
	 */
	tileHeight: number;

	/**
	 * タイルのデータ。
	 * マップチップのインデックスの配列。
	 *
	 * `Tile` は `src` の画像を、幅 `tileWidth` 高さ `tileHeight` の画像(マップチップ)を敷き詰めたものとみなし、
	 * 左上から 0 基準のインデックス番号を与える。この値はそのインデックス番号の配列である。
	 * `Tile` はこの配列の内容に従い、マップチップを左上から敷き詰めて描画する。
	 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。また `width`、 `height` もこれに従って変更されるべきである。
	 */
	tileData: number[][];

	/**
	 * マップチップが描画される領域。
	 *
	 * 設定された場合、指定された領域外にあるマップチップは再描画されない。
	 * 画面外にあたるなどの、不要なマップチップの再描画をしないことで、描画を最適化するために利用できる。
	 * この値を変更した場合、 `this.invalidate()` が呼び出される必要がある。
	 * 初期値は `undefined` 。
	 */
	redrawArea: g.CommonArea | null | undefined;

	_tilesInRow: number;

	_drawnTileData: number[][];

	/**
	 * 各種パラメータを指定して `Tile` のインスタンスを生成する。
	 *
	 * @param param このエンティティに指定するパラメータ
	 */
	constructor(param: TileParameterObject) {
		super(param);
		this.tileWidth = param.tileWidth;
		this.tileHeight = param.tileHeight;
		this.tileData = param.tileData;
		this.tileChips = g.SurfaceUtil.asSurface(param.src);

		this.height = this.tileHeight * this.tileData.length;
		this.width = this.tileWidth * this.tileData[0].length;

		this._invalidateSelf();
		this.redrawArea = param.redrawArea;
		this._drawnTileData = undefined;
	}

	/**
	 * このエンティティ自身の描画を行う。
	 * このメソッドはエンジンから暗黙に呼び出され、ゲーム開発者が呼び出す必要はない。
	 */
	renderSelf(renderer: g.Renderer, camera?: g.Camera): boolean {
		if (this._renderedCamera !== camera) {
			this.state &= ~g.EntityStateFlags.Cached;
			this._renderedCamera = camera;
		}
		if (!(this.state & g.EntityStateFlags.Cached)) {
			var isNew = !this._cache || this._cache.width < Math.ceil(this.width) || this._cache.height < Math.ceil(this.height);
			if (isNew) {
				if (this._cache && !this._cache.destroyed()) {
					this._cache.destroy();
				}
				this._cache = this.scene.game.resourceFactory.createSurface(Math.ceil(this.width), Math.ceil(this.height));
				this._renderer = this._cache.renderer();

				this._drawnTileData = [];
				for (var y = 0; y < this.tileData.length; ++y) {
					this._drawnTileData[y] = [];
					for (var x = 0; x < this.tileData[y].length; ++x) {
						this._drawnTileData[y][x] = -1;
					}
				}
			}
			this._renderer.begin();

			// `CacheableE#renderSelf()` ではここで `this._renderer.clear()` を呼び出すが、
			// `Tile` は `this._cache` の描画状態を再利用するので `this._renderer.clear()` を呼び出す必要はない。

			this.renderCache(this._renderer);

			this.state |= g.EntityStateFlags.Cached;
			this._renderer.end();
		}
		if (this._cache && this.width > 0 && this.height > 0) {
			renderer.drawImage(this._cache, 0, 0, this.width, this.height, 0, 0);
		}
		return this._shouldRenderChildren;
	}

	renderCache(renderer: g.Renderer): void {
		if (! this.tileData)
			throw g.ExceptionFactory.createAssertionError("Tile#_renderCache: don't have a tile data");
		if (this.tileWidth <= 0 || this.tileHeight <= 0) {
			return;
		}
		renderer.save();

		for (var y = 0; y < this.tileData.length; ++y) {
			var row = this.tileData[y];
			for (var x = 0; x < row.length; ++x) {
				var tile = row[x];
				if (tile < 0) {
					continue;
				}

				if (this._drawnTileData[y] !== undefined) {
					if (this._drawnTileData[y][x] === tile) {
						continue;
					}
				}

				var tileX = this.tileWidth * (tile % this._tilesInRow);
				var tileY = this.tileHeight * Math.floor(tile / this._tilesInRow);

				var dx = this.tileWidth * x;
				var dy = this.tileHeight * y;

				if (this.redrawArea !== undefined) {
					if (dx + this.tileWidth < this.redrawArea.x || dx >= this.redrawArea.x + this.redrawArea.width ||
						dy + this.tileHeight < this.redrawArea.y || dy >= this.redrawArea.y + this.redrawArea.height) {
						continue;
					}
				}

				renderer.setCompositeOperation("destination-out");
				renderer.fillRect(dx, dy, this.tileWidth, this.tileHeight, "silver"); // DestinationOutなので色はなんでも可
				renderer.setCompositeOperation("source-over");
				renderer.drawImage(
					this.tileChips,
					tileX,
					tileY,
					this.tileWidth,
					this.tileHeight,
					dx,
					dy
				);
				this._drawnTileData[y][x] = this.tileData[y][x];
			}
		}
		renderer.restore();
	}

	invalidate(): void {
		this._invalidateSelf();
		super.invalidate();
	}

	/**
	 * このエンティティを破棄する。
	 * デフォルトでは利用しているマップチップの `Surface` `Surface` の破棄は行わない点に注意。
	 * @param destroySurface trueを指定した場合、このエンティティが抱えるマップチップの `Surface` も合わせて破棄する
	 */
	destroy(destroySurface?: boolean): void {
		if (destroySurface && this.tileChips && !this.tileChips.destroyed()) {
			this.tileChips.destroy();
		}
		this.tileChips = undefined;
		super.destroy();
	}

	private _invalidateSelf(): void {
		this._tilesInRow = Math.floor(this.tileChips.width / this.tileWidth);
	}
}
