export interface TileParameterObject extends g.CacheableEParameterObject {
	/**
	 * マップチップ画像。
	 */
	src: g.Surface|g.ImageAsset;

	/**
	 * マップチップ一つの幅。
	 */
	tileWidth: number;

	/**
	 * マップチップ一つの高さ。
	 */
	tileHeight: number;

	/**
	 * タイルのデータ。
	 * マップチップのインデックスの配列。
	 *
	 * `Tile` は `src` の画像を、幅 `tileWidth` 高さ `tileHeight` の画像(マップチップ)を敷き詰めたものとみなし、
	 * 左上から 0 基準のインデックス番号を与える。この値はそのインデックス番号の配列である。
	 * `Tile` はこの配列の内容に従い、マップチップを左上から敷き詰めて描画する。
	 */
	tileData: number[][];

	/**
	 * マップチップが描画される領域。
	 * 与えられた場合、それ以降は指定された領域の外のマップチップは再描画されない。
	 *
	 * 画面外にあたるなどの、不要なマップチップの再描画をしないことで、描画を最適化するために利用できる。
	 */
	redrawArea?: g.CommonArea;
}
