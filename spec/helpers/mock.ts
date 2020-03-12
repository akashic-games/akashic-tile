export class Renderer implements g.RendererLike {
	methodCallHistoryWithParams: {
		methodName: string;
		params?: {}
	}[];

	constructor() {
		this.methodCallHistoryWithParams = [];
	}

	begin(): void {
		// nothing to do
	}

	clearMethodCallHistory(): void {
		this.methodCallHistoryWithParams = [];
	}

	clear(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "clear"
		});
	}

	get methodCallHistory() {
		var ret: string[] = [];
		for (var i = 0; i < this.methodCallHistoryWithParams.length; ++i)
			ret.push(this.methodCallHistoryWithParams[i].methodName);
		return ret;
	}

	// 指定したメソッド名のパラメータを配列にして返す
	methodCallParamsHistory(name: string): any[] {
		var params: any[] = [];
		for (var i = 0; i < this.methodCallHistoryWithParams.length; ++i) {
			if (this.methodCallHistoryWithParams[i].methodName === name) params.push(this.methodCallHistoryWithParams[i].params);
		}
		return params;
	}

	drawImage(surface: g.SurfaceLike, offsetX: number, offsetY: number, width: number, height: number,
		canvasOffsetX: number, canvasOffsetY: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "drawImage",
			params: {
				surface: surface,
				offsetX: offsetX,
				offsetY: offsetY,
				width: width,
				height: height,
				canvasOffsetX: canvasOffsetX,
				canvasOffsetY: canvasOffsetY
			}
		});
	}

	translate(x: number, y: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "translate",
			params: {
				x: x,
				y: y
			}
		});
	}

	transform(matrix: number[]): void {
		this.methodCallHistoryWithParams.push({
			methodName: "transform",
			params: {
				matrix: matrix
			}
		});
	}

	opacity(opacity: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "opacity",
			params: {
				opacity: opacity
			}
		});
	}

	setCompositeOperation(operation: g.CompositeOperation): void {
		this.methodCallHistoryWithParams.push({
			methodName: "setCompositeOperation",
			params: {
				operation: operation
			}
		});
	}

	fillRect(x: number, y: number, width: number, height: number, cssColor: string): void {
		this.methodCallHistoryWithParams.push({
			methodName: "fillRect",
			params: {
				x: x,
				y: y,
				width: width,
				height: height,
				cssColor: cssColor
			}
		});
	}

	save(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "save"
		});
	}

	restore(): void {
		this.methodCallHistoryWithParams.push({
			methodName: "restore"
		});
	}

	drawSprites(surface: g.Surface,
			offsetX: number[], offsetY: number[],
			width: number[], height: number[],
			canvasOffsetX: number[], canvasOffsetY: number[],
			count: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "drawSprites",
			params: {
				surface: surface,
				offsetX: offsetX,
				offsetY: offsetY,
				width: width,
				height: height,
				canvasOffsetX: canvasOffsetX,
				canvasOffsetY: canvasOffsetY,
				count: count
			}
		});
	}

	drawSystemText(text: string, x: number, y: number, maxWidth: number, fontSize: number,
			textAlign: g.TextAlign, textBaseline: g.TextBaseline, textColor: string, fontFamily: g.FontFamily,
			strokeWidth: number, strokeColor: string, strokeOnly: boolean): void {
		this.methodCallHistoryWithParams.push({
			methodName: "drawSystemText",
			params: {
				text: text,
				x: x,
				y: y,
				maxWidth: maxWidth,
				fontSize: fontSize,
				textAlign: textAlign,
				textBaseline: textBaseline,
				textColor: textColor,
				fontFamily: fontFamily,
				strokeWidth: strokeWidth,
				strokeColor: strokeColor,
				strokeOnly: strokeOnly
			}
		});
	}

	setTransform(matrix: number[]): void {
		this.methodCallHistoryWithParams.push({
			methodName: "setTransform",
			params: { matrix }
		});
	}

	setOpacity(opacity: number): void {
		this.methodCallHistoryWithParams.push({
			methodName: "setOpacity",
			params: { opacity }
		});
	}

	isSupportedShaderProgram(): boolean {
		return false;
	}

	setShaderProgram(_shaderProgram: g.ShaderProgramLike | null): void {
		// nothing to do
	}

    _getImageData(_sx: number, _sy: number, _sw: number, _sh: number): any {
		return {};
	}

    _putImageData(
		_imageData: ImageData,
		_dx: number,
		_dy: number,
		_dirtyX?: number,
		_dirtyY?: number,
		_dirtyWidth?: number,
		_dirtyHeight?: number
	): void {
		// nothing to do
	}

	end(): void {
		// nothing to do
	}
}

class Surface implements g.SurfaceLike {
	width: number;
	height: number;
	isDynamic: boolean;
	onAnimationStart: g.Trigger<void>;
	onAnimationStop: g.Trigger<void>;
	animatingStarted: g.Trigger<void>;
	animatingStopped: g.Trigger<void>;
	_drawable: any;
	_destroyed: boolean;
	createdRenderer: Renderer;

	constructor(width: number, height: number, drawable?: any, isDynamic?: boolean) {
		this.width = width;
		this.height = height;
		this._drawable = drawable;
		this.isDynamic = isDynamic;
		this.onAnimationStart = new g.Trigger<void>();
		this.onAnimationStop = new g.Trigger<void>();
		this.animatingStarted = new g.Trigger<void>();
		this.animatingStopped = new g.Trigger<void>();
	}

	destroy(): void {
		this._destroyed = true;
	}

	destroyed(): boolean {
		return !!this._destroyed;
	}

	renderer(): g.RendererLike {
		var r = new Renderer();
		this.createdRenderer = r;
		return r;
	}

	isPlaying(): boolean {
		return false;
	}
}

class LoadFailureController {
	necessaryRetryCount: number;
	failureCount: number;

	constructor(necessaryRetryCount: number) {
		this.necessaryRetryCount = necessaryRetryCount;
		this.failureCount = 0;
	}

	tryLoad(asset: g.AssetLike, loader: g.AssetLoadHandler): boolean {
		if (this.necessaryRetryCount < 0) {
			setTimeout(() => {
				if (!asset.destroyed())
					loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("FatalErrorForAssetLoad", false));
			}, 0);
			return false;
		}
		if (this.failureCount++ < this.necessaryRetryCount) {
			setTimeout(() => {
				if (!asset.destroyed())
					loader._onAssetError(asset, g.ExceptionFactory.createAssetLoadError("RetriableErrorForAssetLoad"));
			}, 0);
			return false;
		}
		return true;
	}
}

export abstract class Asset implements g.AssetLike {
	type: string;
	id: string;
	path: string;
	originalPath: string;
	onDestroyed: g.Trigger<g.AssetLike>;

	constructor(id: string, path: string) {
		this.id = id;
		this.originalPath = path;
		this.path = this._assetPathFilter(path);
		this.onDestroyed = new g.Trigger<g.AssetLike>();
	}

	destroy(): void {
		this.onDestroyed.fire(this);
		this.id = undefined;
		this.originalPath = undefined;
		this.path = undefined;
		this.onDestroyed.destroy();
		this.onDestroyed = undefined;
	}

	destroyed(): boolean {
		return this.id === undefined;
	}

	inUse(): boolean {
		return false;
	}

	abstract _load(loader: g.AssetLoadHandler): void;

	_assetPathFilter(path: string): string {
		return path;
	}
}

export class ImageAsset extends Asset implements g.ImageAssetLike {
	type: "image" = "image";
	width: number;
	height: number;
	hint: g.ImageAssetHint;
	_failureController: LoadFailureController;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(id, assetPath);
		this.width = width;
		this.height = height;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}

	asSurface(): g.Surface {
		return new Surface(0, 0);
	}

	initialize(hint: g.ImageAssetHint): void {
		this.hint = hint;
	}
}

export interface DelayedAsset {
	undelay(): void;
}

export class DelayedImageAsset extends ImageAsset implements DelayedAsset {
	_delaying: boolean;
	_lastGivenLoader: g.AssetLoadHandler;
	_isError: boolean;
	_loadingResult: any;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, width: number, height: number) {
		super(necessaryRetryCount, id, assetPath, width, height);
		this._delaying = true;
		this._lastGivenLoader = undefined;
		this._isError = undefined;
		this._loadingResult = undefined;
	}

	undelay(): void {
		this._delaying = false;
		this._flushDelayed();
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._delaying) {
			// 遅延が要求されている状態で _load() が呼ばれた: loaderを自分に差し替えて _onAssetLoad, _onAssetError の通知を遅延する
			this._lastGivenLoader = loader;
			super._load(this);
		} else {
			// 遅延が解除された状態で _load() が呼ばれた: 普通のAsset同様に _load() を実行
			super._load(loader);
		}
	}

	_onAssetError(_asset: g.Asset, _error: g.AssetLoadError): void {
		this._isError = true;
		this._loadingResult = arguments;
		this._flushDelayed();
	}
	_onAssetLoad(_asset: g.Asset): void {
		this._isError = false;
		this._loadingResult = arguments;
		this._flushDelayed();
	}

	_flushDelayed(): void {
		if (this._delaying || !this._loadingResult)
			return;
		if (this.destroyed())
			return;
		var loader = this._lastGivenLoader;
		if (this._isError) {
			loader._onAssetError.apply(loader, this._loadingResult);
		} else {
			loader._onAssetLoad.apply(loader, this._loadingResult);
		}
	}
}

class AudioAsset extends Asset implements g.AudioAssetLike {
	type: "audio" = "audio";
	data: any;
	duration: number;
	loop: boolean;
	hint: g.AudioAssetHint;
	_system: g.AudioSystemLike;
	_failureController: LoadFailureController;

	constructor(necessaryRetryCount: number, id: string, assetPath: string, duration: number,
	            system: g.AudioSystemLike, loop: boolean, hint: g.AudioAssetHint) {
		super(id, assetPath);
		this.duration = duration;
		this.loop = loop;
		this.hint = hint;
		this._system = system;
		this.data = undefined;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}

	play(): g.AudioPlayerLike {
		return this._system.createPlayer();
	}

	stop(): void {
		//
	}

	inUse(): boolean {
		return this._system.findPlayers(this).length > 0;
	}
}

class TextAsset extends Asset implements g.TextAssetLike {
	type: "text" = "text";
	data: string;
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if ((this.game.resourceFactory as ResourceFactory).scriptContents.hasOwnProperty(this.path)) {
					this.data = (this.game.resourceFactory as ResourceFactory).scriptContents[this.path];
				} else {
					this.data = "";
				}
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}
}

class ScriptAsset extends Asset implements g.ScriptAssetLike {
	type: "script" = "script";
	script: string;
	game: g.Game;
	_failureController: LoadFailureController;

	constructor(game: g.Game, necessaryRetryCount: number, id: string, assetPath: string) {
		super(id, assetPath);
		this.game = game;
		this._failureController = new LoadFailureController(necessaryRetryCount);
	}

	_load(loader: g.AssetLoadHandler): void {
		if (this._failureController.tryLoad(this, loader)) {
			setTimeout(() => {
				if (!this.destroyed())
					loader._onAssetLoad(this);
			}, 0);
		}
	}

	execute(env: g.ScriptAssetRuntimeValue): any {
		if (!(this.game.resourceFactory as ResourceFactory).scriptContents.hasOwnProperty(env.module.filename)) {
			// 特にスクリプトの内容指定がないケース:
			// ScriptAssetは任意の値を返してよいが、シーンを記述したスクリプトは
			// シーンを返す関数を返すことを期待するのでここでは関数を返しておく
			return env.module.exports = function () { return new g.Scene({ game: env.game }); };

		} else {
			var prefix = "(function(exports, require, module, __filename, __dirname) {";
			var suffix = "})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";
			var content = (this.game.resourceFactory as ResourceFactory).scriptContents[env.module.filename];
			var f = new Function("g", prefix + content + suffix);
			f(env);
			return env.module.exports;
		}
	}
}

export class SurfaceAtlas implements g.SurfaceAtlasLike {
	_surface: g.SurfaceLike;
	_accessScore: number;
	_emptySurfaceAtlasSlotHead: g.SurfaceAtlasSlotLike;
	_usedRectangleAreaSize: g.CommonSize;

	constructor(surface: g.SurfaceLike) {
		this._surface = surface;
		this._accessScore = 0;
		this._emptySurfaceAtlasSlotHead = new g.SurfaceAtlasSlot(0, 0, this._surface.width, this._surface.height);
		this._usedRectangleAreaSize = { width: 0, height: 0 };
	}

	addSurface(_surface: g.SurfaceLike, _offsetX: number, _offsetY: number, _width: number, _height: number): g.SurfaceAtlasSlotLike {
		return this._emptySurfaceAtlasSlotHead;
	}

	getAtlasUsedSize(): g.CommonSize {
		return this._usedRectangleAreaSize;
	}

	destroy(): void {
		this._surface.destroy();
	}

	destroyed(): boolean {
		return this._surface.destroyed();
	}
}

export class ResourceFactory implements g.ResourceFactoryLike {
	game: g.Game;
	scriptContents: {[key: string]: string};

	// 真である限り createXXAsset() が DelayedAsset を生成する(現在は createImageAsset() のみ)。
	// DelayedAsset は、flushDelayedAssets() 呼び出しまで読み込み完了(またはエラー)通知を遅延するアセットである。
	// コード重複を避けるため、現在は createImageAsset() のみこのフラグに対応している。
	createsDelayedAsset: boolean;

	_necessaryRetryCount: number;
	_delayedAssets: DelayedAsset[];

	constructor() {
		this.scriptContents = {};
		this.createsDelayedAsset = false;
		this._necessaryRetryCount = 0;
		this._delayedAssets = [];
		this.game = null;
	}

	init(game: g.Game): void {
		this.game = game;
	}

	// func が呼び出されている間だけ this._necessaryRetryCount を変更する。
	// func() とその呼び出し先で生成されたアセットは、指定回数だけロードに失敗したのち成功する。
	// -1を指定した場合、ロードは retriable が偽に設定された AssetLoadFatalError で失敗する。
	withNecessaryRetryCount(necessaryRetryCount: number, func: () => void): void {
		var originalValue = this._necessaryRetryCount;
		try {
			this._necessaryRetryCount = necessaryRetryCount;
			func();
		} finally {
			this._necessaryRetryCount = originalValue;
		}
	}

	// createsDelayedAsset が真である間に生成されたアセット(ただし現時点はImageAssetのみ) の、
	// 遅延された読み込み完了通知を実行する。このメソッドの呼び出し後、実際の AssetLoader#_onAssetLoad()
	// などの呼び出しは setTimeout() 経由で行われることがある点に注意。
	// (このメソッドの呼び出し側は、後続の処理を setTimeout() 経由で行う必要がある。mock.ts のアセット実装を参照のこと)
	flushDelayedAssets(): void {
		this._delayedAssets.forEach((a: DelayedAsset) => a.undelay());
		this._delayedAssets = [];
	}

	createImageAsset(id: string, assetPath: string, width: number, height: number): g.ImageAssetLike {
		if (this.createsDelayedAsset) {
			var ret = new DelayedImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
			this._delayedAssets.push(ret);
			return ret;
		} else {
			return new ImageAsset(this._necessaryRetryCount, id, assetPath, width, height);
		}
	}

	createVideoAsset(_id: string, _assetPath: string, _width: number, _height: number,
	                 _system: g.VideoSystem, _loop: boolean, _useRealSize: boolean): g.VideoAssetLike {
		throw new Error("not implemented");
	}

	createAudioAsset(id: string, assetPath: string, duration: number, system: g.AudioSystemLike, loop: boolean, hint: g.AudioAssetHint): g.AudioAssetLike {
		return new AudioAsset(this._necessaryRetryCount, id, assetPath, duration, system, loop, hint);
	}

	createAudioPlayer(_system: g.AudioSystem): g.AudioPlayerLike {
		throw new Error("not implemented");
	}

	createTextAsset(id: string, assetPath: string): g.TextAssetLike {
		return new TextAsset(this.game, this._necessaryRetryCount, id, assetPath);
	}

	createScriptAsset(id: string, assetPath: string): g.ScriptAssetLike {
		return new ScriptAsset(this.game, this._necessaryRetryCount, id, assetPath);
	}

	createSurface(width: number, height: number): g.SurfaceLike {
		return new Surface(width, height);
	}

	createGlyphFactory(fontFamily: g.FontFamily | string | (g.FontFamily | string)[],
	                   fontSize: number, baselineHeight?: number, fontColor?: string,
	                   strokeWidth?: number, strokeColor?: string, strokeOnly?: boolean, fontWeight?: g.FontWeight): g.GlyphFactoryLike {
		throw new Error("not implemented");
	}

	createSurfaceAtlas(width: number, height: number): g.SurfaceAtlasLike {
		return new SurfaceAtlas(this.createSurface(width, height));
	}
}

export class Game extends g.Game {
	leftGame: boolean;
	terminatedGame: boolean;
	raisedEvents: g.Event[];

	constructor(gameConfiguration: g.GameConfiguration, assetBase?: string, selfId?: string) {
		const resourceFactory = new ResourceFactory();
		super(gameConfiguration, resourceFactory, assetBase, selfId);
		resourceFactory.init(this);
		this.leftGame = false;
		this.terminatedGame = false;
		this.raisedEvents = [];
	}

	_leaveGame(): void {
		this.leftGame = true;
	}

	_terminateGame(): void {
		this.terminatedGame = true;
	}

	raiseEvent(e: g.Event): void {
		this.raisedEvents.push(e);
	}

	shouldSaveSnapshot(): boolean {
		return false;
	}

	saveSnapshot(snapshot: any): void {
		// do nothing.
	}

	addEventFilter(filter: g.EventFilter): void {
		throw new Error("not implemented");
	}

	removeEventFilter(filter: g.EventFilter): void {
		throw new Error("not implemented");
	}

	raiseTick(events?: g.Event[]): void {
		throw new Error("not implemented");
	}

	getCurrentTime(): number {
		return 0;
	}

	isActiveInstance(): boolean {
		return false;
	}
}

export enum EntityStateFlags {
	/**
	 * 特にフラグが立っていない状態
	 */
	None = 0,
	/**
	 * 非表示フラグ
	 */
	Hidden = 1 << 0,
	/**
	 * 描画結果がキャッシュ済みであることを示すフラグ
	 */
	Cached = 1 << 1
}
