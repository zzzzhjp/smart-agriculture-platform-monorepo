import * as Cesium from 'cesium';
import * as turf from '@turf/turf';

// 定义返回的顶点数据接口
export interface PolygonVertex {
    longitude: number;
    latitude: number;
    height: number;
}

// 定义绘制完成后的结果接口
export interface DrawPolygonResult {
    vertices: PolygonVertex[];
    areaMeter: number;
    areaMu: number;
}

export class DrawPolygonAction {
    private _viewer: Cesium.Viewer;
    private _handler: Cesium.ScreenSpaceEventHandler | null = null;
    private _activeShapePoints: Cesium.Cartesian3[] = []; // 固定的顶点
    private _floatingPointEntity: Cesium.Entity | null = null; // 跟随鼠标的活动点
    private _drawEntities: Cesium.Entity[] = []; // 存储所有绘制产生的 Entity
    private _onFinishedCallback: ((result: DrawPolygonResult) => void) | null = null;

    // 用一个普通变量来记录鼠标实时位置
    private _mousePosition: Cesium.Cartesian3 | null = null;

    constructor(viewer: Cesium.Viewer) {
        this._viewer = viewer;
    }

    activate(callback: (result: DrawPolygonResult) => void) {
        this._onFinishedCallback = callback;
        this.clear(); // 激活前先清理

        this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);

        // 1. 监听左键点击：确认顶点
        this._handler.setInputAction((event: any) => {
            const cartesian = this._pickCartesian(event.position);
            if (!cartesian) return;

            // 如果是第一个点，初始化鼠标位置并创建浮动跟随点
            if (this._activeShapePoints.length === 0) {
                this._mousePosition = cartesian;
                this._floatingPointEntity = this._createPoint(cartesian, true);
                this._drawEntities.push(this._floatingPointEntity);
            }

            // 将点击的坐标加入固定顶点数组
            this._activeShapePoints.push(cartesian);
            const point = this._createPoint(cartesian, false);
            this._drawEntities.push(point);

            // 如果点数达到2个，开始生成动态的面和线
            if (this._activeShapePoints.length >= 2) {
                if (!this._drawEntities.find(e => e.name === 'dynamic_polygon')) {
                    const polyline = this._createDynamicPolyline();
                    const polygon = this._createDynamicPolygon();
                    this._drawEntities.push(polyline, polygon);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        // 2. 监听鼠标移动：只更新内部坐标变量，底层 CallbackProperty 会自动读取渲染
        this._handler.setInputAction((event: any) => {
            if (this._activeShapePoints.length === 0) return;

            const newPosition = this._pickCartesian(event.endPosition);
            if (newPosition) {
                // 绝对不使用 setValue，直接赋值给 _mousePosition
                this._mousePosition = newPosition;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        // 3. 监听右键点击：结束绘制并计算面积
        this._handler.setInputAction(() => {
            if (this._activeShapePoints.length < 3) {
                console.warn('多边形至少需要3个顶点才能闭合');
                return;
            }
            this._finishDrawing();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        // 禁用相机倾斜，防止画图时视角乱飞
        this._viewer.scene.screenSpaceCameraController.enableTilt = false;
    }

    deactivate() {
        this.clear();
        // 恢复相机倾斜
        this._viewer.scene.screenSpaceCameraController.enableTilt = true;
    }

    clear() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }
        this._drawEntities.forEach(entity => this._viewer.entities.remove(entity));
        this._drawEntities = [];
        this._activeShapePoints = [];
        this._floatingPointEntity = null;
        this._mousePosition = null;
    }

    // --- 私有方法 ---

    private _finishDrawing() {
        // 移除鼠标移动监听和浮动点
        if (this._handler) {
            this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
        if (this._floatingPointEntity) {
            this._viewer.entities.remove(this._floatingPointEntity);
            this._floatingPointEntity = null;
        }
        this._mousePosition = null;

        const vertices = this._getFormattedVertices();

        // turf.js 计算面积
        const turfCoords = vertices.map(v => [v.longitude, v.latitude]);
        turfCoords.push(turfCoords[0] as number[]); // 首尾闭合

        const polygon = turf.polygon([turfCoords]);
        const areaMeter = turf.area(polygon);
        const areaMu = areaMeter / 666.667;

        // 触发回调返回数据
        if (this._onFinishedCallback) {
            this._onFinishedCallback({
                vertices: vertices,
                areaMeter: areaMeter,
                areaMu: parseFloat(areaMu.toFixed(3))
            });
        }

        this.deactivate();
    }

    private _getFormattedVertices(): PolygonVertex[] {
        return this._activeShapePoints.map(cartesian => {
            const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            return {
                longitude: Cesium.Math.toDegrees(cartographic.longitude),
                latitude: Cesium.Math.toDegrees(cartographic.latitude),
                height: cartographic.height
            };
        });
    }

    private _pickCartesian(position: Cesium.Cartesian2): Cesium.Cartesian3 | undefined {
        let cartesian = this._viewer.scene.pickPosition(position);
        if (!cartesian) {
            const ray = this._viewer.camera.getPickRay(position);
            if (ray) {
                cartesian = this._viewer.scene.globe.pick(ray, this._viewer.scene) as Cesium.Cartesian3;
            }
        }
        return cartesian;
    }

    private _createPoint(position: Cesium.Cartesian3, isFloating = false): Cesium.Entity {
        return this._viewer.entities.add({
            // 如果是浮动点，使用 CallbackProperty 动态读取 _mousePosition
            position: isFloating
                ? new Cesium.CallbackPositionProperty(() => this._mousePosition || position, false)
                : position,
            point: {
                pixelSize: isFloating ? 8 : 10,
                color: isFloating ? Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.7) : Cesium.Color.fromCssColorString('#ffffff'),
                outlineColor: Cesium.Color.fromCssColorString('#f59e0b'),
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
    }

    private _createDynamicPolyline(): Cesium.Entity {
        return this._viewer.entities.add({
            polyline: {
                // 动态线：固定点 + 鼠标实时位置 + 闭合到起点
                positions: new Cesium.CallbackProperty(() => {
                    if (this._mousePosition) {
                        return [...this._activeShapePoints, this._mousePosition, this._activeShapePoints[0]];
                    }
                    return [...this._activeShapePoints, this._activeShapePoints[0]];
                }, false),
                width: 3,
                material: new Cesium.PolylineDashMaterialProperty({
                    color: Cesium.Color.fromCssColorString('#ffffff').withAlpha(0.6),
                    dashLength: 16
                }),
                clampToGround: true
            }
        });
    }

    private _createDynamicPolygon(): Cesium.Entity {
        return this._viewer.entities.add({
            name: 'dynamic_polygon',
            polygon: {
                // 动态面：固定点 + 鼠标实时位置
                hierarchy: new Cesium.CallbackProperty(() => {
                    let positions = this._mousePosition
                        ? [...this._activeShapePoints, this._mousePosition]
                        : [...this._activeShapePoints];
                    return new Cesium.PolygonHierarchy(positions);
                }, false),
                material: Cesium.Color.fromCssColorString('#fbbf24').withAlpha(0.4),
                outline: false,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
    }
}
