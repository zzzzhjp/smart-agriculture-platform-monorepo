import * as Cesium from 'cesium';
import * as turf from '@turf/turf';

export interface FlightPathVertex {
    longitude: number;
    latitude: number;
    height: number;
}

export interface DrawFlightPathResult {
    vertices: FlightPathVertex[];
    lengthMeter: number;
    lengthKilometer: number;
}

export class DrawFlightPathAction {
    private _viewer: Cesium.Viewer;
    private _handler: Cesium.ScreenSpaceEventHandler | null = null;
    private _activePathPoints: Cesium.Cartesian3[] = [];
    private _drawEntities: Cesium.Entity[] = [];
    private _mousePosition: Cesium.Cartesian3 | null = null;
    private _floatingPointEntity: Cesium.Entity | null = null;
    private _onFinishedCallback: ((result: DrawFlightPathResult) => void) | null = null;

    constructor(viewer: Cesium.Viewer) {
        this._viewer = viewer;
    }

    activate(callback: (result: DrawFlightPathResult) => void) {
        this._onFinishedCallback = callback;
        this.clear();

        this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);

        this._handler.setInputAction((event: { position: Cesium.Cartesian2 }) => {
            const cartesian = this._pickCartesian(event.position);
            if (!cartesian) return;

            if (this._activePathPoints.length === 0) {
                this._mousePosition = cartesian;
                this._floatingPointEntity = this._createPoint(cartesian, true);
                this._drawEntities.push(this._floatingPointEntity);
            }

            this._activePathPoints.push(cartesian);
            this._drawEntities.push(this._createPoint(cartesian));

            if (this._activePathPoints.length === 1) {
                this._drawEntities.push(this._createDynamicPolyline());
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        this._handler.setInputAction((event: { endPosition: Cesium.Cartesian2 }) => {
            if (this._activePathPoints.length === 0) return;

            const newPosition = this._pickCartesian(event.endPosition);
            if (newPosition) {
                this._mousePosition = newPosition;
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._handler.setInputAction(() => {
            if (this._activePathPoints.length < 2) {
                console.warn('无人机路径至少需要 2 个点。');
                return;
            }

            this._finishDrawing();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        this._viewer.scene.screenSpaceCameraController.enableTilt = false;
    }

    deactivate() {
        this.clear();
        this._viewer.scene.screenSpaceCameraController.enableTilt = true;
    }

    clear() {
        if (this._handler) {
            this._handler.destroy();
            this._handler = null;
        }

        this._drawEntities.forEach((entity) => this._viewer.entities.remove(entity));
        this._drawEntities = [];
        this._activePathPoints = [];
        this._mousePosition = null;
        this._floatingPointEntity = null;
    }

    private _finishDrawing() {
        if (this._handler) {
            this._handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }

        if (this._floatingPointEntity) {
            this._viewer.entities.remove(this._floatingPointEntity);
            this._drawEntities = this._drawEntities.filter((entity) => entity !== this._floatingPointEntity);
            this._floatingPointEntity = null;
        }

        this._mousePosition = null;

        const vertices = this._getFormattedVertices();
        const lineCoords = vertices.map((vertex) => [vertex.longitude, vertex.latitude]);
        const line = turf.lineString(lineCoords);
        const lengthKilometer = turf.length(line, { units: 'kilometers' });
        const lengthMeter = lengthKilometer * 1000;

        if (this._onFinishedCallback) {
            this._onFinishedCallback({
                vertices,
                lengthMeter: Number(lengthMeter.toFixed(2)),
                lengthKilometer: Number(lengthKilometer.toFixed(3))
            });
        }

        this.deactivate();
    }

    private _getFormattedVertices(): FlightPathVertex[] {
        return this._activePathPoints.map((cartesian) => {
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
            position: isFloating
                ? new Cesium.CallbackPositionProperty(() => this._mousePosition || position, false)
                : position,
            point: {
                pixelSize: isFloating ? 8 : 10,
                color: isFloating ? Cesium.Color.fromCssColorString('#38bdf8').withAlpha(0.7) : Cesium.Color.fromCssColorString('#ffffff'),
                outlineColor: Cesium.Color.fromCssColorString('#0ea5e9'),
                outlineWidth: 2,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
        });
    }

    private _createDynamicPolyline(): Cesium.Entity {
        return this._viewer.entities.add({
            name: 'flight_path',
            polyline: {
                positions: new Cesium.CallbackProperty(() => {
                    if (this._mousePosition) {
                        return [...this._activePathPoints, this._mousePosition];
                    }

                    return [...this._activePathPoints];
                }, false),
                width: 4,
                material: new Cesium.PolylineGlowMaterialProperty({
                    color: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.9),
                    glowPower: 0.18,
                    taperPower: 0.5
                }),
                clampToGround: true
            }
        });
    }
}
