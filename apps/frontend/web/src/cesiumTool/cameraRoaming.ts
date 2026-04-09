import * as Cesium from 'cesium'

export interface RoamingOptions {
    time?: number           //漫游时长
    multiplier?: number     //时间倍率
    isPattern?: boolean     //是否某种固定模式
    ifClockLoop?: boolean   //是否循环播放
    ifTileset?: boolean     //是否贴地飞行
}

export class Roaming {
    private viewer: Cesium.Viewer
    private options: RoamingOptions

    private Lines: Cesium.Cartesian3[] = []
    private entity?: Cesium.Entity
    private start?: Cesium.JulianDate
    private stop?: Cesium.JulianDate

    private time: number
    private multiplier: number
    private ifClockLoop: boolean
    private ifTileset: boolean

    private exectionHandler?: Cesium.Event.RemoveCallback

    constructor(viewer: Cesium.Viewer, options?: RoamingOptions) {
        this.viewer = viewer
        this.options = options || {}

        this.time = this.options.time || 360
        this.multiplier = this.options.multiplier || 1
        this.ifClockLoop = this.options.ifClockLoop ?? false
        this.ifTileset = this.options.ifClockLoop ?? false
    }

    /**
     * 
     * @param Lines 路径点集数组
     */
    public cameraRoaming(Lines: Cesium.Cartesian3[]): void {
        this.Lines = Lines

        // 根据点集计算带有时间戳的属性对象
        const property = this._ComputeRoamingLineProperty(this.Lines, this.time)

        // 初始化实体和相机绑定
        this._InitRoaming(property, this.start!, this.stop!)
    }

    /**
     * 
     * @param Lines 路径点集
     * @param time 总耗时
     * @returns samplePositionProperty
     */
    private _ComputeRoamingLineProperty(Lines: Cesium.Cartesian3[], time: number): Cesium.SampledPositionProperty {
        const property = new Cesium.SampledPositionProperty()
        const lineLength = Lines.length

        const start = Cesium.JulianDate.now()
        const stop = Cesium.JulianDate.addSeconds(start, time, new Cesium.JulianDate())
        this.start = start
        this.stop = stop

        // 接管Cesium系统的 Clock
        const clock = this.viewer.clock
        clock.startTime = start.clone()
        clock.stopTime = stop.clone()
        clock.currentTime = start.clone()

        if (this.ifClockLoop) {
            clock.clockRange = Cesium.ClockRange.LOOP_STOP // 循环播放
        } else {
            clock.clockRange = Cesium.ClockRange.CLAMPED // 到终点就停止
            clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK //跟随系统时间
        }

        clock.shouldAnimate = true //开启时间轴运转
        clock.multiplier = this.multiplier

        for (let i = 0; i < lineLength; i++) {
            let pointTime = Cesium.JulianDate.addSeconds(start, i * (time / lineLength), new Cesium.JulianDate())

            if (i === lineLength - 1) {
                pointTime = stop
            }

            let position = Lines[i] as Cesium.Cartesian3

            if (this.ifTileset) {
                position = this.viewer.scene.clampToHeight(position) || position
            }

            property.addSample(pointTime, position)
        }

        return property
    }

    /**
     * 
     * @param position 计算好的位置属性
     * @param start 开始时间
     * @param stop 结束时间
     */
    private _InitRoaming(position: Cesium.SampledPositionProperty, start: Cesium.JulianDate, stop: Cesium.JulianDate) {
        // 添加一个 Entity 作为漫游载体
        this.entity = this.viewer.entities.add({
            availability: new Cesium.TimeIntervalCollection([
                new Cesium.TimeInterval({ start: start, stop: stop })
            ]),
            position: position,

            orientation: new Cesium.VelocityOrientationProperty(position)
        });

        (this.entity?.position as Cesium.SampledPositionProperty).setInterpolationOptions({
            interpolationDegree: 5, // 度数越高越平滑
            interpolationAlgorithm: Cesium.HermitePolynomialApproximation
        })

        this.viewer.trackedEntity = this.entity
        const camera = this.viewer.camera

        const Exection = () => {
            if (this.entity) {
                const center = this.entity.position?.getValue(this.viewer.clock.currentTime)

                if (center) {
                    camera.lookAt(center, new Cesium.HeadingPitchRange(
                        Cesium.Math.toRadians(117.7),
                        Cesium.Math.toRadians(0),
                        100
                    ))
                }

                if (this.viewer.clock.shouldAnimate && center) {
                    this._realTimeData(center)
                }
            } else {
                if (this.exectionHandler) {
                    this.exectionHandler()
                }
            }
        }

        this.exectionHandler = this.viewer.scene.preUpdate.addEventListener(Exection)
    }

    private _realTimeData(_center: Cesium.Cartesian3): void {

    }

    public destroy(): void {
        if (this.entity) {
            this.viewer.entities.remove(this.entity)
        }
        if (this.exectionHandler) {
            this.exectionHandler()
        }
        this.viewer.trackedEntity = undefined
    }
}

