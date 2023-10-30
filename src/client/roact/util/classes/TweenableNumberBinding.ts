import { Binding, BindingFunction, createBinding } from "@rbxts/roact";
import { RunService, TweenService } from "@rbxts/services";

interface TweenData {
	time: number;
	easingStyle: Enum.EasingStyle;
	easingDirection: Enum.EasingDirection;
}

const DEFAULT_INFO = {
	time: 1,
	easingStyle: Enum.EasingStyle.Sine,
	easingDirection: Enum.EasingDirection.Out,
} satisfies TweenData;

function lerp(from: number, to: number, time: number) {
	return (1 - time) * from + time * to;
}

export class TweenableNumberBinding {
	public binding: Binding<number>;
	private updateBinding: BindingFunction<number>;

	private lastConnection?: RBXScriptConnection;

	constructor(initialValue = 0, private sharedData?: Partial<TweenData>) {
		[this.binding, this.updateBinding] = createBinding(initialValue);
	}

	public tween(targetValue: number) {
		this.lastConnection?.Disconnect();

		const chosenData = { ...DEFAULT_INFO, ...this.sharedData };
		const originalValue = this.binding.getValue();

		let accumulatedTime = 0;

		this.lastConnection = RunService.RenderStepped.Connect((deltaTime) => {
			accumulatedTime += deltaTime;

			const alpha = TweenService.GetValue(
				accumulatedTime / chosenData.time,
				chosenData.easingStyle,
				chosenData.easingDirection,
			);

			this.updateBinding(lerp(originalValue, targetValue, alpha));
		});
	}
}
