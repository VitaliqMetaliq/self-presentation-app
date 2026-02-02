import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Input, input, OnDestroy, Renderer2, signal, ViewChild } from "@angular/core";

@Component({
    selector: 'app-tag-cloud',
    templateUrl: './tag-cloud.component.html',
    styleUrls: ['./tag-cloud.component.scss'],
    imports: [],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush // оптимизация производительности ?
})
export class TagCloudComponent implements AfterViewInit, OnDestroy {

    @ViewChild('cloudContainer') 
    public cloudContainerRef!: ElementRef<HTMLDivElement>;

    private readonly defaultConfig: TagCloudConfig = {
        radius: 200,
        dragSensetivity: 0.5,
        autoRotationSpeed: 0.001,
        autoRotationVector: { x: 0, y: 1, z: 0 },
        itemScale: {
            min: 0.6,
            max: 1.0
        },
        aspect: { x: 1, y: 1, z: 1 }
    };

    private dragListeners: (() => void)[] = [];

    public config = input<TagCloudConfig>(this.defaultConfig);

    public tags = input.required<TagCloudItem[]>();

    private cloudConfig = computed(() => ({
        ...this.defaultConfig,
        ...this.config()
    }));

    private readonly renderer = inject(Renderer2);

    private isDragging = false;

    private rotateX = 0;
    private rotateY = 0;

    private rotationMatrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ];

    private startVec: { x: number; y: number; z: number } | null = null;

    // угловая скорость
    private velocityX = 0;
    private velocityY = 0;

    private windowMouseMoveListener: (() => void) | null = null;
    private windowMouseUpListener: (() => void) | null = null;

    private animationFrameId: number | null = null;

    private tagPositions: TagCloudItemPosition[] = [];

    // прямой доступ к элементам через индекс
    private multiplyMatrices(a: number[], b: number[]): number[] {
        return [
            a[0]*b[0] + a[1]*b[3] + a[2]*b[6],
            a[0]*b[1] + a[1]*b[4] + a[2]*b[7],
            a[0]*b[2] + a[1]*b[5] + a[2]*b[8],

            a[3]*b[0] + a[4]*b[3] + a[5]*b[6],
            a[3]*b[1] + a[4]*b[4] + a[5]*b[7],
            a[3]*b[2] + a[4]*b[5] + a[5]*b[8],

            a[6]*b[0] + a[7]*b[3] + a[8]*b[6],
            a[6]*b[1] + a[7]*b[4] + a[8]*b[7],
            a[6]*b[2] + a[7]*b[5] + a[8]*b[8]
        ];
    }

    private projectToSphere(x: number, y: number): { x: number; y: number; z: number } {
        const rect = this.cloudContainerRef.nativeElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Нормализуем в [-1, 1], с учётом aspect ratio
        const aspect = this.cloudConfig().aspect!; // rect.width / rect.height;
        let nx = (x - centerX) / (rect.width / 2);
        let ny = (y - centerY) / (rect.height / 2);

        nx /= aspect.x;
        ny /= aspect.y;

        const lengthSq = nx * nx + ny * ny;
        let z: number;
        if (lengthSq <= 1) {
            z = Math.sqrt(1 - lengthSq);
        } else {
            // За пределами сферы — проекция на окружность
            const norm = 1 / Math.sqrt(lengthSq);
            nx *= norm;
            ny *= norm;
            z = 0;
        }

        return { x: nx, y: -ny, z }; // y инвертируем
    }

    private getRotationMatrixFromVectors(start: { x: number; y: number; z: number }, end: { x: number; y: number; z: number }): number[] {
        const EPS = 1e-8;
        const dot = start.x * end.x + start.y * end.y + start.z * end.z;

        if (dot > 1 - EPS) {
            // Векторы почти совпадают — возвращаем единичную матрицу
            return [1,0,0, 0,1,0, 0,0,1];
        }

        if (dot < -1 + EPS) {
            // Противоположные векторы — поворот на 180° вокруг любой перпендикулярной оси
            const axis = Math.abs(start.x) > 0.1 ? { x: 0, y: start.z, z: -start.y } : { x: start.z, y: 0, z: -start.x };
            const len = Math.sqrt(axis.x*axis.x + axis.y*axis.y + axis.z*axis.z);
            if (len < EPS) return [1,0,0, 0,1,0, 0,0,1];
            return this.rotationMatrixFromAxisAngle(axis.x/len, axis.y/len, axis.z/len, Math.PI * 0.5 * this.cloudConfig().dragSensetivity!);
        }

        // Ось поворота = cross(start, end)
        const axisX = start.y * end.z - start.z * end.y;
        const axisY = -(start.z * end.x - start.x * end.z);
        const axisZ = start.x * end.y - start.y * end.x;

        const sinAngle = Math.sqrt(axisX*axisX + axisY*axisY + axisZ*axisZ);
        const cosAngle = dot;

        // Нормализуем ось
        const invLen = 1 / sinAngle;
        const nx = axisX * invLen;
        const ny = axisY * invLen;
        const nz = axisZ * invLen;

        return this.rotationMatrixFromAxisAngle(nx, ny, nz, -Math.atan2(sinAngle, cosAngle) * 0.5 * this.cloudConfig().dragSensetivity!);
    }

    private rotationMatrixFromAxisAngle(x: number, y: number, z: number, angle: number): number[] {
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        const t = 1 - c;

        return [
            t*x*x + c,   t*x*y - s*z, t*x*z + s*y,
            t*x*y + s*z, t*y*y + c,   t*y*z - s*x,
            t*x*z - s*y, t*y*z + s*x, t*z*z + c
        ];
    }

    ngAfterViewInit(): void {
        this.calculateTagPositions(this.cloudConfig().radius!);

        const cloud = this.cloudContainerRef.nativeElement;

        this.dragListeners.push(
            this.renderer.listen(cloud, 'mousedown', this.onDragStart.bind(this)),
            this.renderer.listen(cloud, 'touchstart', this.onDragStart.bind(this), { passive: false }),
            this.renderer.listen(cloud, 'mousemove', this.onDragMove.bind(this)),
            this.renderer.listen(cloud, 'touchmove', this.onDragMove.bind(this), { passive: false }),
            this.renderer.listen(window, 'mouseup', this.onDragEnd.bind(this)),
            this.renderer.listen(window, 'touchend', this.onDragEnd.bind(this))
        );

        // инициируем анимацию
        this.initAnimation();
    }

    private onDragStart(e: MouseEvent | TouchEvent): void {
        const target = e.target as HTMLElement;
        if (target.closest('.tag')) {
            return; // не держим Drag, позволяем клику случиться
        }

        this.isDragging = true;

        const isTouch = 'touches' in e;

        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        this.startVec = this.projectToSphere(clientX, clientY);
        
        if (isTouch) {
            e.preventDefault();
        } else {
            this.windowMouseMoveListener = this.renderer.listen(window, 'mousemove', this.onDragMove.bind(this));
            this.windowMouseUpListener = this.renderer.listen(window, 'mouseup', this.onDragEnd.bind(this));
        }
    }

    private onDragMove(e: MouseEvent | TouchEvent): void {
        if (!this.isDragging || !this.startVec) return;

        const isTouch = 'touches' in e;
        const clientX = isTouch ? e.touches[0].clientX : e.clientX;
        const clientY = isTouch ? e.touches[0].clientY : e.clientY;

        const currentVec = this.projectToSphere(clientX, clientY);
        const deltaRotation = this.getRotationMatrixFromVectors(this.startVec, currentVec);
        this.rotationMatrix = this.multiplyMatrices(deltaRotation, this.rotationMatrix);

        this.startVec = currentVec;

        if (isTouch) { // для touch эффекта выключаем скролл
            e.preventDefault();
        }
    }

    private onDragEnd(): void {
        this.isDragging = false;

        // Удаляем глобальные слушатели
        if (this.windowMouseMoveListener) {
            this.windowMouseMoveListener();
            this.windowMouseMoveListener = null;
        }
        if (this.windowMouseUpListener) {
            this.windowMouseUpListener();
            this.windowMouseUpListener = null;
        }
    }

    private autoRotate(): void {
        const angle = this.cloudConfig().autoRotationSpeed!;
        const autoRotationVector = this.cloudConfig().autoRotationVector!;
        const autoRot = this.rotationMatrixFromAxisAngle(autoRotationVector.x, autoRotationVector.y, autoRotationVector.z, angle);
        this.rotationMatrix = this.multiplyMatrices(autoRot, this.rotationMatrix);
    }

    ngOnDestroy(): void {
        this.dragListeners.forEach(unlisten => unlisten());

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    private initAnimation(): void {
        if (!this.isDragging) {
            this.autoRotate();

            this.velocityX *= 0.96;
            this.velocityY *= 0.96;
        }

        this.rotateX += this.velocityX;
        this.rotateY += this.velocityY;

        this.applyTransforms();

        this.animationFrameId = requestAnimationFrame(() => this.initAnimation());
    }

    private applyTransforms(): void {
        const items = this.cloudContainerRef.nativeElement.querySelectorAll('.tag');
        const maxZ = this.cloudConfig().radius;
        const maxScale = this.cloudConfig().itemScale?.max;
        const minScale = this.cloudConfig().itemScale?.min;

        this.tagPositions.forEach((pos, i) => {
            const item = items[i] as HTMLElement;
            if (!item) return;

            // Применяем rotationMatrix к исходной точке
            const x = pos.position.x;
            const y = pos.position.y;
            const z = pos.position.z;

            const rx = this.rotationMatrix[0] * x + this.rotationMatrix[1] * y + this.rotationMatrix[2] * z;
            const ry = this.rotationMatrix[3] * x + this.rotationMatrix[4] * y + this.rotationMatrix[5] * z;
            const rz = this.rotationMatrix[6] * x + this.rotationMatrix[7] * y + this.rotationMatrix[8] * z;

            const distanceFactor = (rz + maxZ!) / (2 * maxZ!);
            const scale = minScale! + distanceFactor * (maxScale! - minScale!);
            const opacity = 0.4 + distanceFactor * 0.6;

            item.style.transform = `translate(${rx}px, ${ry}px) scale(${scale})`;
            item.style.opacity = `${Math.max(0.2, opacity)}`;
            item.style.pointerEvents = rz < 0 ? 'none' : 'auto';
            item.style.userSelect = rz < 0 ? 'none' : 'auto';
        });
    }

    private calculateTagPositions(radius: number): void {
        const totalTags = this.tags().length;
        const aspect = this.cloudConfig().aspect!;
        
        for (let i = 0; i < totalTags; i++) {
            // равномерное распределение точек на поверхности сферы
            const phi = Math.acos(1 - (2 * i + 0.5) / totalTags);
            const theta = Math.PI * (1 + Math.sqrt(5)) * i;

            const x = radius * aspect.x * Math.sin(phi) * Math.cos(theta);
            const y = radius * aspect.y * Math.sin(phi) * Math.sin(theta);
            const z = radius * aspect.z * Math.cos(phi);
            
            const distanceFactor = (z + radius * aspect.z) / (2 * radius * aspect.z);
            const scale = 0.5 + distanceFactor * (1.0 - 0.6); // maxScale = 1.0, minScale = 0.6

            this.tagPositions.push({
                item: this.tags()[i], 
                position: { x, y, z }, 
                scale: scale, 
                opacity: 0.5 + distanceFactor * 0.5 // opacityFactor ?
            });
        }
    }
}

export interface TagCloudItem {
    id: number;
    name: string;
    // color: string; // black always for cloud ?
    // backgroundColor: string; // its always transparent ?
    link?: string;
}

interface TagCloudItemPosition {
    item: TagCloudItem;
    position: {
        x: number;
        y: number;
        z: number;
    };
    scale: number; // при приближении к зрителю - небольшое увеличение
    opacity: number; // элементы на передней части сферы должны быть
                     // чуть прозрачнее
}

export interface TagCloudConfig {
    radius?: number;
    dragSensetivity?: number;
    autoRotationSpeed?: number;
    autoRotationVector?: { x: number; y: number; z: number; };
    // maxSpeed?: number; // как будто не нужно
    itemScale?: {
        min: number;
        max: number;
    };
    aspect?: { x: number; y: number; z: number; };
}
