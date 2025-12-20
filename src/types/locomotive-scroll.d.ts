declare module 'locomotive-scroll' {
	interface ScrollInstanceOptions {
		el: HTMLElement | string | null;
		smooth?: boolean;
		direction?: 'vertical' | 'horizontal';
		gestureDirection?: 'vertical' | 'horizontal';
		reloadOnContextChange?: boolean;
		inertia?: number;
		class?: string;
		scrollFromAnywhere?: boolean;
		firefoxMultiplier?: number;
		touchMultiplier?: number;
		smartphone?: any;
		tablet?: any;
	}

	interface ScrollEvent { progress: number }

	class LocomotiveScroll {
		constructor(options: ScrollInstanceOptions);
		on(event: string, cb: (instance: any) => void): void;
		off(event: string, cb?: (instance: any) => void): void;
		update(): void;
		scrollTo(target: any, options?: any): void;
		destroy(): void;
	}

	export default LocomotiveScroll;
}

