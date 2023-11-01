import { Signal } from "@rbxts/beacon";
import { Binding, BindingFunction, createBinding } from "@rbxts/roact";
import { RunService, TweenService } from "@rbxts/services";

export interface BindingTweenData {
	time: number;
	easingStyle: Enum.EasingStyle;
	easingDirection: Enum.EasingDirection;
}

const DEFAULT_INFO = {
	time: 1,
	easingStyle: Enum.EasingStyle.Sine,
	easingDirection: Enum.EasingDirection.Out,
} satisfies BindingTweenData;

function lerp(from: number, to: number, time: number) {
	return (1 - time) * from + time * to;
}

export class TweenableNumberBinding {
	public binding: Binding<number>;

	private updateBinding: BindingFunction<number>;
	private currentTween?: {
		connection: RBXScriptConnection;
		callback?: (didComplete: boolean) => void;
	};

	constructor(initialValue = 0, private sharedData?: Partial<BindingTweenData>) {
		[this.binding, this.updateBinding] = createBinding(initialValue);
	}

	public set(value: number) {
		this.stopCurrentTween(false);

		this.updateBinding(value);
	}

	public tween(targetValue: number, callback?: (didComplete: boolean) => void) {
		this.stopCurrentTween(false);

		const chosenData = { ...DEFAULT_INFO, ...this.sharedData };
		const originalValue = this.binding.getValue();

		let accumulatedTime = 0;

		this.currentTween = {
			connection: RunService.RenderStepped.Connect((deltaTime) => {
				accumulatedTime += deltaTime;

				if (accumulatedTime > chosenData.time) {
					this.stopCurrentTween(true);
					return;
				}

				const alpha = TweenService.GetValue(
					accumulatedTime / chosenData.time,
					chosenData.easingStyle,
					chosenData.easingDirection,
				);

				this.updateBinding(lerp(originalValue, targetValue, alpha));
			}),

			callback,
		};
	}

	private stopCurrentTween(didComplete: boolean) {
		if (this.currentTween) {
			const tweenReference = this.currentTween;
			this.currentTween = undefined;

			tweenReference.connection.Disconnect();
			tweenReference.callback?.(didComplete);
		}
	}
}
